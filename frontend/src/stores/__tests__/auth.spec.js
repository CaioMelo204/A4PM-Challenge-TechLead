import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../auth.store.js';

vi.mock('../../router/router.js', () => ({
  router: {
    push: vi.fn(),
  },
}));

vi.mock('../../services/auth.service.js', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

const localStorageMock = (function () {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { router } from '../../router/router.js';
import authService from '../../services/auth.service.js';

describe('useAuthStore', () => {
  let authStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();
    authStore = useAuthStore();
  });

  it('deve ter um estado inicial correto', () => {
    expect(authStore.token).toBeNull();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.loading).toBe(false);
    expect(authStore.error).toBeNull();
    expect(authStore.user).toBeNull();
  });

  describe('getters', () => {
    it('isLoggedIn deve retornar true se autenticado, false caso contrário', () => {
      authStore.isAuthenticated = true;
      expect(authStore.isLoggedIn).toBe(true);

      authStore.isAuthenticated = false;
      expect(authStore.isLoggedIn).toBe(false);
    });

    it('getAuthToken deve retornar o token atual', () => {
      authStore.token = 'test_token';
      expect(authStore.getAuthToken).toBe('test_token');
    });

    it('getUser deve retornar o objeto de usuário atual', () => {
      const testUser = { id: 1, email: 'test@example.com' };
      authStore.user = testUser;
      expect(authStore.getUser).toEqual(testUser);
    });
  });

  describe('login action', () => {
    it('deve logar o usuário com sucesso, definir token e usuário, e armazenar no localStorage', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'new_auth_token';
      authService.login.mockResolvedValue({ user: mockUser, token: mockToken });

      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await authStore.login(credentials);

      expect(authStore.loading).toBe(false);
      expect(authStore.error).toBeNull();
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.token).toBe(mockToken);
      expect(result).toBe(true);

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authUser', JSON.stringify(mockUser));
    });

    it('deve definir o erro e chamar logout em caso de falha no login', async () => {
      const mockError = new Error('Invalid credentials');
      authService.login.mockRejectedValue(mockError);

      authStore.logout = vi.fn();

      const credentials = { email: 'wrong@example.com', password: 'wrongpassword' };
      await authStore.login(credentials);

      expect(authStore.loading).toBe(false);
      expect(authStore.error).toBe('Falha no login. Verifique suas credenciais.');
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(authStore.logout).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register action', () => {
    it('deve registrar o usuário com sucesso', async () => {
      authService.register.mockResolvedValue({});

      const userData = { email: 'new@example.com', password: 'password123', name: 'New User' };
      await authStore.register(userData);

      expect(authStore.loading).toBe(false);
      expect(authStore.error).toBeNull();

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('deve definir o erro e chamar logout em caso de falha no registro', async () => {
      const mockError = new Error('User already exists');
      authService.register.mockRejectedValue(mockError);

      authStore.logout = vi.fn();

      const userData = { email: 'existing@example.com', password: 'password123' };
      await authStore.register(userData);

      expect(authStore.loading).toBe(false);
      expect(authStore.error).toBe('Falha no registro. O e-mail pode já estar em uso.');
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(authStore.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout action', () => {
    it('deve limpar o estado de autenticação e o localStorage, e redirecionar para "/"', async () => {
      authStore.token = 'some_token';
      authStore.isAuthenticated = true;
      authStore.user = { id: 1 };
      localStorageMock.setItem('authToken', 'some_token');
      localStorageMock.setItem('authUser', JSON.stringify({ id: 1 }));

      await authStore.logout();

      expect(authStore.token).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser');
      expect(router.push).toHaveBeenCalledWith('/');
    });
  });

  describe('initializeAuth action', () => {
    it('deve chamar logout se authToken não estiver no localStorage', async () => {
      authStore.logout = vi.fn();
      await authStore.initializeAuth();

      expect(authStore.token).toBeNull();
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.logout).toHaveBeenCalledTimes(1);
    });

    it('deve chamar logout se nenhum dado de autenticação estiver no localStorage', async () => {
      authStore.logout = vi.fn();
      await authStore.initializeAuth();

      expect(authStore.token).toBeNull();
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.logout).toHaveBeenCalledTimes(1);
    });
  });
});
