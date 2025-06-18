import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const authService = {
  async login(credentials) {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      return {
        user: null,
        token: data.data.accessToken,
      };
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, userData);
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
