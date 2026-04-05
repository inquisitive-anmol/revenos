import { create } from 'zustand';


export interface Campaign {
    _id: string;
    name: string;
    status: "draft" | "active" | "paused" | "completed";
    settings: {
        icpDescription: string;
        dailyEmailLimit: number;
        timezone: string;
    };
    metrics: {
        leadsFound: number;
        emailsSent: number;
        repliesReceived: number;
        meetingsBooked: number;
    };
    createdAt: string;
}


interface CampaignStore {
    campaigns: Campaign[];
    activeCampaign: Campaign | null;
    loading: boolean;
    error: string | null;
    setCampaigns: (campaigns: Campaign[]) => void;
    setActiveCampaign: (campaign: Campaign | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}


export const useCampaignStore = create<CampaignStore>((set) => ({
    campaigns: [],
    activeCampaign: null,
    loading: false,
    error: null,
    setCampaigns: (campaigns: Campaign[]) => set({ campaigns }),
    setActiveCampaign: (campaign: Campaign | null) => set({ activeCampaign: campaign }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
}));