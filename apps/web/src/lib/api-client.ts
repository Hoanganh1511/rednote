import axios from 'axios';
import { API_BASE_URL } from '@/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('rednote-user');
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { accessToken?: string } };
      const token = parsed.state?.accessToken;
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});
