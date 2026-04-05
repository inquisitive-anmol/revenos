import { create } from "zustand";

export interface Lead {
  _id: string;
  workspaceId: string;
  campaignId: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  icpScore: number;
  status:
    | "prospecting"
    | "contacted"
    | "qualified"
    | "disqualified"
    | "meeting_booked"
    | "closed";
  researchNotes?: string;
  humanControlled: boolean;
  createdAt: string;
}

interface LeadStore {
  leads: Lead[];
  activeLead: Lead | null;
  loading: boolean;
  error: string | null;
  setLeads: (leads: Lead[]) => void;
  setActiveLead: (lead: Lead | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  activeLead: null,
  loading: false,
  error: null,
  setLeads: (leads) => set({ leads }),
  setActiveLead: (lead) => set({ activeLead: lead }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));