import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useWorkspaceStore } from '../stores/workspace.store';
import { useMemo } from 'react';


// Ensure you export the centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


export const useApi = () => {
  const { getToken, orgId, userId } = useAuth();
  const { activeWorkspaceId } = useWorkspaceStore();

  const authApi = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Priority: real MongoDB workspaceId → Clerk orgId → Clerk userId (fallback)
      const tenantId = activeWorkspaceId ?? orgId ?? userId;
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
      return config;
    });

    return instance;
  }, [getToken, activeWorkspaceId, orgId, userId]);

  return authApi;
}

