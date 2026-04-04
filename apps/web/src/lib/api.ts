import axios from 'axios';

// Ensure you export the centralized Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Clerk Auth Token
api.interceptors.request.use(
  async (config) => {
    try {
      // @ts-ignore - Clerk puts itself on window context when ClerkProvider is loaded
      const clerk = window.Clerk;

      // If Clerk is initialized and active session exists
      if (clerk && clerk.session) {
        const token = await clerk.session.getToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve Clerk token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
