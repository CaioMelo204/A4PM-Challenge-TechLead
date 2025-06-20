import axios from 'axios';
import { useAuthStore } from '../stores/auth.store.js';
import { router } from '../router/router.js';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    if (error.response && error.response.status === 401 && authStore.isAuthenticated) {
      await authStore.logout();
      await router.push('/');
    }
    return Promise.reject(error);
  }
);

export default api;
