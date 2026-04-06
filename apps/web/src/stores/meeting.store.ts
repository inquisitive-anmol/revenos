import { create } from "zustand";

export interface MeetingLead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
}

export interface Meeting {
  _id: string;
  workspaceId: string;
  leadId: string | MeetingLead;
  campaignId: string;
  calendarEventId?: string;
  scheduledAt: string;
  outcome?: "completed" | "no_show" | "rescheduled" | "cancelled";
  createdAt: string;
}

interface MeetingStore {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  setMeetings: (meetings: Meeting[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  loading: false,
  error: null,
  setMeetings: (meetings) => set({ meetings }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));