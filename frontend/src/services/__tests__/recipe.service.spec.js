import { describe, it, expect, vi, beforeEach } from 'vitest';
import recipeService from '../recipe.service.js';

vi.mock('../../api/base.api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../api/base.api.js';

describe('recipeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('deve retornar receitas e dados de paginação em caso de sucesso', async () => {
      const mockRecipes = [{ id: 1, nome: 'Bolo de Chocolate' }];
      const mockPagination = { totalItems: 10, totalPages: 1, currentPage: 1, limit: 10 };
      const mockResponse = {
        data: {
          data: mockRecipes,
          metadata: {
            pagination: mockPagination,
          },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const params = { nome: 'Bolo', page: 1, limit: 10, sort: 'asc' };
      const result = await recipeService.search(params);

      expect(api.get).toHaveBeenCalledWith('/recipe', {
        params: {
          nome: params.nome,
          ingredientes: undefined,
          porcoes: undefined,
          id_categorias: undefined,
          order: params.sort,
          limit: params.limit,
          page: params.page,
        },
      });
      expect(result.recipes).toEqual(mockRecipes);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('deve lançar um erro em caso de falha na busca', async () => {
      const mockError = new Error('Search failed');
      api.get.mockRejectedValue(mockError);

      const params = { nome: 'Pizza' };
      await expect(recipeService.search(params)).rejects.toThrow(mockError);

      expect(api.get).toHaveBeenCalledWith('/recipe', {
        params: {
          nome: params.nome,
          ingredientes: undefined,
          porcoes: undefined,
          id_categorias: undefined,
          order: undefined,
          limit: undefined,
          page: undefined,
        },
      });
    });
  });

  describe('getAll', () => {
    it('deve retornar receitas e dados de paginação para todos os parâmetros', async () => {
      const mockRecipes = [{ id: 2, nome: 'Salada Colorida' }];
      const mockPagination = { totalItems: 5, totalPages: 1, currentPage: 1, limit: 5 };
      const mockResponse = {
        data: {
          data: mockRecipes,
          metadata: {
            pagination: mockPagination,
          },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const params = { limit: 5, page: 1, order: 'desc', id_categorias: 'vegetais' };
      const result = await recipeService.getAll(params);

      expect(api.get).toHaveBeenCalledWith('/recipe', {
        params: {
          limit: 5,
          page: 1,
          order: 'desc',
          id_categorias: 'vegetais',
        },
      });
      expect(result.recipes).toEqual(mockRecipes);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('deve lançar um erro em caso de falha em getAll', async () => {
      const mockError = new Error('Failed to fetch all recipes');
      api.get.mockRejectedValue(mockError);

      const params = { limit: 5, page: 1 };
      await expect(recipeService.getAll(params)).rejects.toThrow(mockError);

      expect(api.get).toHaveBeenCalledWith('/recipe', {
        params: {
          limit: 5,
          page: 1,
        },
      });
    });
  });

  describe('create', () => {
    it('deve retornar os dados da receita criada em caso de sucesso', async () => {
      const newRecipeData = { nome: 'Biscoito', tempo_preparo_minutos: 30 };
      const createdRecipeResponse = { id: 3, ...newRecipeData };
      const mockResponse = {
        data: {
          data: createdRecipeResponse,
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await recipeService.create(newRecipeData);

      expect(api.post).toHaveBeenCalledWith('/recipe', newRecipeData);
      expect(result).toEqual(createdRecipeResponse);
    });

    it('deve lançar um erro em caso de falha na criação', async () => {
      const mockError = new Error('Creation failed');
      api.post.mockRejectedValue(mockError);

      const newRecipeData = { nome: 'Receita Inválida' };
      await expect(recipeService.create(newRecipeData)).rejects.toThrow(mockError);

      expect(api.post).toHaveBeenCalledWith('/recipe', newRecipeData);
    });
  });

  describe('update', () => {
    it('deve retornar os dados da receita atualizada em caso de sucesso', async () => {
      const recipeId = 'abc-123';
      const updateData = { nome: 'Biscoito Atualizado', porcoes: 12 };
      const updatedRecipeResponse = { id: recipeId, nome: 'Biscoito Atualizado', porcoes: 12 };
      const mockResponse = {
        data: {
          data: updatedRecipeResponse,
        },
      };
      api.patch.mockResolvedValue(mockResponse);

      const result = await recipeService.update(recipeId, updateData);

      expect(api.patch).toHaveBeenCalledWith(`/recipe/${recipeId}`, updateData);
      expect(result).toEqual(updatedRecipeResponse);
    });

    it('deve lançar um erro em caso de falha na atualização', async () => {
      const mockError = new Error('Update failed');
      api.patch.mockRejectedValue(mockError);

      const recipeId = 'abc-123';
      const updateData = { nome: 'Dado Inválido' };
      await expect(recipeService.update(recipeId, updateData)).rejects.toThrow(mockError);

      expect(api.patch).toHaveBeenCalledWith(`/recipe/${recipeId}`, updateData);
    });
  });

  describe('remove', () => {
    it('deve remover a receita sem retornar nada em caso de sucesso', async () => {
      const recipeId = 'xyz-789';
      api.delete.mockResolvedValue({});

      const result = await recipeService.remove(recipeId);

      expect(api.delete).toHaveBeenCalledWith(`/recipe/${recipeId}`);
      expect(result).toBeUndefined();
    });

    it('deve lançar um erro em caso de falha na remoção', async () => {
      const mockError = new Error('Deletion failed');
      api.delete.mockRejectedValue(mockError);

      const recipeId = 'xyz-789';
      await expect(recipeService.remove(recipeId)).rejects.toThrow(mockError);

      expect(api.delete).toHaveBeenCalledWith(`/recipe/${recipeId}`);
    });
  });
});
