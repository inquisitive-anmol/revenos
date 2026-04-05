import { useCallback } from "react";
import { useApi } from "../lib/api";
import { useLeadStore, type Lead } from "../stores/lead.store";

export const useLeads = () => {
  const api = useApi();
  const { setLeads, setLoading, setError, leads } = useLeadStore();

  const fetchLeads = useCallback(
    async (filters: {
      campaignId?: string;
      status?: string;
      score_gte?: number;
    } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.campaignId) params.append("campaignId", filters.campaignId);
        if (filters.status) params.append("status", filters.status);
        if (filters.score_gte)
          params.append("score_gte", filters.score_gte.toString());

        const res = await api.get(`/api/v1/leads?${params.toString()}`);
        setLeads(res.data.data || res.data.leads || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const updateLeadStatus = useCallback(
    async (leadId: string, status: Lead["status"]) => {
      // Optimistic update — update store immediately, no waiting for API
      const updated = leads.map((l) =>
        l._id === leadId ? { ...l, status } : l
      );
      setLeads(updated);

      try {
        await api.patch(`/api/v1/leads/${leadId}/status`, { status });
      } catch (err: any) {
        // Rollback on failure — refetch from API
        const res = await api.get("/api/v1/leads");
        setLeads(res.data.data || res.data.leads || []);
        console.error("Status update failed, rolled back:", err.message);
      }
    },
    [api, leads]
  );

  const takeoverLead = useCallback(
    async (leadId: string) => {
      const res = await api.patch(`/api/v1/leads/${leadId}/takeover`);
      return res.data;
    },
    [api]
  );

  const handbackLead = useCallback(
    async (leadId: string) => {
      const res = await api.patch(`/api/v1/leads/${leadId}/handback`);
      return res.data;
    },
    [api]
  );

  return { fetchLeads, updateLeadStatus, takeoverLead, handbackLead };
};