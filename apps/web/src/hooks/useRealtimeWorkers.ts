import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { useLeads } from './useLeads';
import { useCampaigns } from './useCampaigns';
import { useActivityStore } from '../stores/activity.store';
import { notify } from '../utils/notification.utils';

let socketInstance: Socket | null = null;

export const useRealtimeWorkers = () => {
  const { getToken } = useAuth();
  const { fetchLeads } = useLeads();
  const { fetchCampaigns } = useCampaigns();
  const { addActivity } = useActivityStore();

  useEffect(() => {
    let isMounted = true;

    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token || !isMounted) return;

        if (!socketInstance) {
          socketInstance = io(import.meta.env.VITE_API_BASE_URL || '', {
            auth: { token },
            transports: ['websocket', 'polling'],
          });
        }

        socketInstance.on('worker:completed', (payload: any) => {
          console.log('[Realtime] Worker completed:', payload);
          
          if (payload.workerName === 'prospector') {
             notify({
               title: 'Prospecting Complete',
               message: `Found ${payload.data?.leadsFound || 0} new leads`,
               type: 'prospector'
             });
             addActivity({
               agentId: 'PA',
               type: 'prospector',
               title: 'Prospector Agent finished searching',
               details: `Found ${payload.data?.leadsFound || 0} new leads`,
             });
          } else if (payload.workerName === 'qualifier') {
             notify({
               title: 'Leads Qualified',
               message: 'Finished scoring new leads',
               type: 'qualifier'
             });
             addActivity({
               agentId: 'QA',
               type: 'qualifier',
               title: 'Qualifier Agent finished scoring',
               details: 'Processed new leads',
             });
          } else if (payload.workerName === 'booker') {
             notify({
               title: 'Tasks Finished',
               message: 'Booker agent completed meeting tasks',
               type: 'booker'
             });
             addActivity({
               agentId: 'BA',
               type: 'booker',
               title: 'Booker Agent completed tasks',
               details: 'Processed meeting invites',
             });
          } else {
             notify({
               title: 'Task Completed',
               message: `Background task ${payload.workerName} completed.`,
               type: 'system'
             });
          }

          fetchLeads();
          fetchCampaigns();
        });

        socketInstance.on('worker:failed', (payload: any) => {
          console.error('[Realtime] Worker failed:', payload);
          notify({
            title: 'Task Failed',
            message: `Background task ${payload.workerName} failed.`,
            type: 'error'
          });
        });

      } catch (err) {
        console.error('[Realtime] Socket connection error:', err);
      }
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.off('worker:completed');
        socketInstance.off('worker:failed');
      }
    };
  }, [getToken, fetchLeads, fetchCampaigns]);
};
