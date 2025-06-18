import { describe, it, expect, vi, beforeEach } from 'vitest';
import categoryService from '../category.service.js';

vi.mock('../../api/base.api.js', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../../api/base.api.js';

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('deve retornar os dados das categorias em caso de sucesso', async () => {
      const mockCategories = [
        { id: 1, nome: 'Salgados' },
        { id: 2, nome: 'Doces' },
      ];
      const mockResponse = {
        data: {
          data: mockCategories,
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await categoryService.getAll();

      expect(api.get).toHaveBeenCalledWith('/category');
      expect(result).toEqual(mockCategories);
    });

    it('deve lançar um erro em caso de falha na requisição', async () => {
      const mockError = new Error('Network Error');
      api.get.mockRejectedValue(mockError);

      await expect(categoryService.getAll()).rejects.toThrow(mockError);

      expect(api.get).toHaveBeenCalledWith('/category');
    });
  });
});
