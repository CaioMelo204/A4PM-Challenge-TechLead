import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../auth.service.js';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from 'axios';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_API_URL = 'http://localhost:3000';
  });

  describe('login', () => {
    it('deve retornar o token e user nulo em caso de login bem-sucedido', async () => {
      const mockResponse = {
        data: {
          data: {
            accessToken: 'mocked-jwt-token',
          },
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await authService.login(credentials);

      expect(axios.post).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        credentials
      );
      expect(result).toEqual({
        user: null,
        token: 'mocked-jwt-token',
      });
    });

    it('deve lançar um erro em caso de falha no login', async () => {
      const mockError = new Error('Invalid credentials');
      axios.post.mockRejectedValue(mockError);

      const credentials = { email: 'wrong@example.com', password: 'wrongpassword' };

      await expect(authService.login(credentials)).rejects.toThrow(mockError);

      expect(axios.post).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        credentials
      );
    });
  });

  describe('register', () => {
    it('não deve retornar nada em caso de registro bem-sucedido', async () => {
      axios.post.mockResolvedValue({});

      const userData = {
        name: 'John Doe',
        email: 'newuser@example.com',
        password: 'newpassword123',
      };
      const result = await authService.register(userData);

      expect(axios.post).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        userData
      );
      expect(result).toBeUndefined();
    });

    it('deve lançar um erro em caso de falha no registro', async () => {
      const mockError = new Error('User already exists');
      axios.post.mockRejectedValue(mockError);

      const userData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(authService.register(userData)).rejects.toThrow(mockError);

      expect(axios.post).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        userData
      );
    });
  });
});
