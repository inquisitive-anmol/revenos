import { useCallback } from "react";
import { useApi } from "../lib/api";
import { useCampaignStore } from "../stores/campaign.store";

export const useCampaigns = () => {
  const api = useApi();
  const { setCampaigns, setLoading, setError } = useCampaignStore();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/v1/campaigns");
      setCampaigns(res.data.data || res.data.campaigns || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createCampaign = useCallback(
    async (name: string,
      icpDescription: string,
      options?: {
        industry?: string;
        companySize?: string;
        jobTitles?: string;
        problemToSolve?: string;
        goal?: string;
        status?: string;
        workflowId?: string;
      }) => {
      setLoading(true);
      try {
        const res = await api.post("/api/v1/campaigns", {
          name,
          icpDescription,
          ...options,
        });
        await fetchCampaigns();
        return res.data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const triggerProspector = useCallback(
    async (campaignId: string, leads: any[]) => {
      const res = await api.post(
        `/api/v1/campaigns/${campaignId}/prospect`,
        { leads }
      );
      return res.data;
    },
    [api]
  );

  const updateCampaignStatus = useCallback(
    async (campaignId: string, status: string) => {
      const res = await api.patch(`/api/v1/campaigns/${campaignId}/status`, {
        status,
      });
      return res.data;
    },
    [api]
  );

  return { fetchCampaigns, createCampaign, triggerProspector, updateCampaignStatus };
};