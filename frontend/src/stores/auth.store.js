import { defineStore } from 'pinia';
import { router } from '../router/router.js';
import authService from '../services/auth.service.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    loading: false,
    error: null,
    user: JSON.parse(localStorage.getItem('authUser')) || null,
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    getAuthToken: (state) => state.token,
    getUser: (state) => state.user,
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const { user, token } = await authService.login(credentials);

        this.user = user;
        this.token = token;
        this.isAuthenticated = true;

        localStorage.setItem('authToken', this.token);
        localStorage.setItem('authUser', JSON.stringify(this.user));

        return true;
      } catch (err) {
        this.error = 'Falha no login. Verifique suas credenciais.';
        await this.logout();
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        await authService.register(userData);
      } catch (err) {
        this.error = 'Falha no registro. O e-mail pode já estar em uso.';
        await this.logout();
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.token = null;
      this.isAuthenticated = false;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      await router.push('/');
    },

    async initializeAuth() {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        try {
          this.token = storedToken;
          this.user = JSON.parse(storedUser);
          this.isAuthenticated = true;
        } catch (e) {
          await this.logout();
        }
      } else {
        await this.logout();
      }
    },
  },
});
