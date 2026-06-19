import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error ?? err.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ---- Stats ----
export const fetchStats = () => api.get('/api/stats');
export const fetchEventsChart = () => api.get('/api/stats/chart');

// ---- Sessions ----
export const fetchSessions = (params) => api.get('/api/sessions', { params });
export const fetchSessionEvents = (sessionId) =>
  api.get(`/api/sessions/${sessionId}/events`);

// ---- Heatmap ----
export const fetchHeatmapUrls = () => api.get('/api/heatmap/urls');
export const fetchHeatmap = (params) => api.get('/api/heatmap', { params });
