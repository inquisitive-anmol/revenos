import { create } from 'zustand';

export interface Activity {
  id: string;
  agentId: string;
  type: 'prospector' | 'qualifier' | 'booker' | 'searcher' | 'system';
  title: string;
  details: string;
  metadata?: any;
  timestamp: Date;
}

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [
    {
      id: 'mock-1',
      agentId: 'QA',
      type: 'qualifier',
      title: 'Qualifier Agent replied',
      details: 'John Doe at TechCorp',
      metadata: { confidence: 82 },
      timestamp: new Date(Date.now() - 2 * 60000),
    },
    {
      id: 'mock-2',
      agentId: 'SA',
      type: 'searcher',
      title: 'Searcher Agent found 12 new prospects',
      details: 'Project Alpha',
      metadata: { intent: 'High intent' },
      timestamp: new Date(Date.now() - 14 * 60000),
    },
  ],
  addActivity: (activity) => {
    set((state) => {
      const newActivity = {
        ...activity,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      return { activities: [newActivity, ...state.activities].slice(0, 50) };
    });
  },
  clearActivities: () => set({ activities: [] }),
}));
