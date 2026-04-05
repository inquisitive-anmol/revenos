import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

// Ensure you export the centralized Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


export const useApi = () => {
  const { getToken } = useAuth();

  const authApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  authApi.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return authApi;
}

