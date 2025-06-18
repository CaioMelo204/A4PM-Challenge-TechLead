import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRecipeStore } from '../recipes.store.js';

vi.mock('../../services/recipe.service.js', () => ({
  default: {
    getAll: vi.fn(),
    search: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('../../services/category.service.js', () => ({
  default: {
    getAll: vi.fn(),
  },
}));

import recipeService from '../../services/recipe.service.js';
import categoriesService from '../../services/category.service.js';

describe('useRecipeStore', () => {
  let recipeStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    recipeStore = useRecipeStore();
  });

  it('deve ter um estado inicial correto', () => {
    expect(recipeStore.allRecipes).toEqual([]);
    expect(recipeStore.loading).toBe(false);
    expect(recipeStore.error).toBeNull();
    expect(recipeStore.allCategories).toEqual([]);
    expect(recipeStore.searchQuery).toBe('');
    expect(recipeStore.selectedCategory).toBeNull();
    expect(recipeStore.sortBy).toBe('desc');
    expect(recipeStore.limit).toBe(25);
    expect(recipeStore.totalPages).toBe(1);
    expect(recipeStore.totalItems).toBe(0);
    expect(recipeStore.currentPage).toBe(1);
  });

  describe('getters', () => {
    it('getRecipeById deve retornar a receita correta pelo ID', () => {
      const mockRecipes = [
        { id: '1', nome: 'Bolo' },
        { id: '2', nome: 'Torta' },
      ];
      recipeStore.allRecipes = mockRecipes;

      expect(recipeStore.getRecipeById('1')).toEqual({ id: '1', nome: 'Bolo' });
      expect(recipeStore.getRecipeById('3')).toBeUndefined();
    });
  });

  describe('actions', () => {
    describe('fetchAllCategories', () => {
      it('deve carregar todas as categorias com sucesso', async () => {
        const mockCategories = [{ id: 'cat1', nome: 'Doces' }];
        categoriesService.getAll.mockResolvedValue(mockCategories);

        await recipeStore.fetchAllCategories();

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBeNull();
        expect(recipeStore.allCategories).toEqual(mockCategories);
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      });

      it('deve definir o erro se a busca de categorias falhar', async () => {
        const mockError = new Error('Erro ao buscar categorias');
        categoriesService.getAll.mockRejectedValue(mockError);

        await recipeStore.fetchAllCategories();

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBe('Falha ao carregar categorias.');
        expect(recipeStore.allCategories).toEqual([]);
        expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchAllRecipes', () => {
      it('deve carregar todas as receitas com sucesso e atualizar a paginação', async () => {
        const mockRecipes = [{ id: 'rec1', nome: 'Receita 1' }];
        const mockPagination = {
          limit: 10,
          total_pages: 5,
          total_records: 50,
          current_page: 1,
        };
        recipeService.getAll.mockResolvedValue({
          recipes: mockRecipes,
          pagination: mockPagination,
        });

        await recipeStore.fetchAllRecipes();

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBeNull();
        expect(recipeStore.allRecipes).toEqual(mockRecipes);
        expect(recipeStore.limit).toBe(mockPagination.limit);
        expect(recipeStore.totalPages).toBe(mockPagination.total_pages);
        expect(recipeStore.totalItems).toBe(mockPagination.total_records);
        expect(recipeStore.currentPage).toBe(mockPagination.current_page);
        expect(recipeService.getAll).toHaveBeenCalledWith({
          limit: 25,
          page: 1,
          order: 'desc',
        });
      });

      it('deve definir o erro se a busca de receitas falhar', async () => {
        const mockError = new Error('Erro ao buscar receitas');
        recipeService.getAll.mockRejectedValue(mockError);

        await recipeStore.fetchAllRecipes();

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBe('Falha ao carregar receitas.');
        expect(recipeStore.allRecipes).toEqual([]);
        expect(recipeStore.totalItems).toBe(0);
        expect(recipeStore.totalPages).toBe(1);
        expect(recipeStore.currentPage).toBe(1);
      });
    });

    describe('searchRecipes', () => {
      it('deve buscar receitas com filtros e atualizar a paginação', async () => {
        const mockRecipes = [{ id: 'rec2', nome: 'Receita Filtrada' }];
        const mockPagination = {
          limit: 5,
          total_pages: 2,
          total_records: 10,
          current_page: 1,
        };
        recipeService.search.mockResolvedValue({
          recipes: mockRecipes,
          pagination: mockPagination,
        });

        const filters = {
          query: 'Filtrado',
          category: 'cat1',
          sortBy: 'asc',
          limit: 5,
          page: 1,
          order: 'asc',
        };
        await recipeStore.searchRecipes(filters);

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBeNull();
        expect(recipeStore.allRecipes).toEqual(mockRecipes);
        expect(recipeStore.limit).toBe(mockPagination.limit);
        expect(recipeStore.totalPages).toBe(mockPagination.total_pages);
        expect(recipeStore.totalItems).toBe(mockPagination.total_records);
        expect(recipeStore.currentPage).toBe(mockPagination.current_page);
        expect(recipeService.search).toHaveBeenCalledWith({
          nome: 'Filtrado',
          id_categorias: 'cat1',
          sortBy: 'asc',
          ingredientes: undefined,
          porcoes: undefined,
          limit: 5,
          page: 1,
          order: 'asc',
        });
      });

      it('deve usar valores padrão para filtros não fornecidos', async () => {
        const mockRecipes = [{ id: 'rec3', nome: 'Receita Padrão' }];
        const mockPagination = {
          limit: 25,
          total_pages: 1,
          total_records: 20,
          current_page: 1,
        };
        recipeService.search.mockResolvedValue({
          recipes: mockRecipes,
          pagination: mockPagination,
        });

        const filters = { query: 'Padrão' };
        await recipeStore.searchRecipes(filters);

        expect(recipeStore.allRecipes).toEqual(mockRecipes);
        expect(recipeService.search).toHaveBeenCalledWith({
          nome: 'Padrão',
          id_categorias: null,
          sortBy: 'desc',
          ingredientes: undefined,
          porcoes: undefined,
          limit: 25,
          page: 1,
          order: 'desc',
        });
      });

      it('deve definir o erro se a busca de receitas falhar', async () => {
        const mockError = new Error('Erro na busca');
        recipeService.search.mockRejectedValue(mockError);

        await recipeStore.searchRecipes({});

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBe('Falha ao carregar receitas.');
        expect(recipeStore.allRecipes).toEqual([]);
      });
    });

    describe('addRecipe', () => {
      it('deve adicionar uma nova receita com sucesso', async () => {
        const newRecipe = { nome: 'Nova Receita', tempo_preparo_minutos: 45 };
        const addedRecipe = { id: 'new-id', ...newRecipe };
        recipeService.create.mockResolvedValue(addedRecipe);

        const result = await recipeStore.addRecipe(newRecipe);

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBeNull();
        expect(recipeStore.allRecipes).toContainEqual(addedRecipe);
        expect(result).toEqual(addedRecipe);
        expect(recipeService.create).toHaveBeenCalledWith(newRecipe);
      });

      it('deve definir o erro se a adição de receita falhar', async () => {
        const mockError = new Error('Erro ao adicionar');
        recipeService.create.mockRejectedValue(mockError);

        const newRecipe = { nome: 'Falha' };
        await recipeStore.addRecipe(newRecipe);

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBe('Falha ao adicionar receita.');
        expect(recipeStore.allRecipes).not.toContainEqual(newRecipe);
      });
    });

    describe('updateRecipe', () => {
      it('deve atualizar uma receita existente com sucesso', async () => {
        const initialRecipe = { id: 'rec1', nome: 'Receita Original', porcoes: 2 };
        recipeStore.allRecipes = [initialRecipe];

        const updatedData = { id: 'rec1', nome: 'Receita Atualizada', porcoes: 4 };
        recipeService.update.mockResolvedValue({});

        await recipeStore.updateRecipe(updatedData);

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBeNull();
        const updatedRecipeInStore = recipeStore.getRecipeById('rec1');
        expect(updatedRecipeInStore.nome).toBe('Receita Atualizada');
        expect(updatedRecipeInStore.porcoes).toBe(4);
        expect(updatedRecipeInStore.alterado_em).toBeDefined();
        expect(recipeService.update).toHaveBeenCalledWith('rec1', updatedData);
      });

      it('deve definir o erro se a atualização de receita falhar', async () => {
        const initialRecipe = { id: 'rec1', nome: 'Receita Original' };
        recipeStore.allRecipes = [initialRecipe];

        const mockError = new Error('Erro ao atualizar');
        recipeService.update.mockRejectedValue(mockError);

        const updatedData = { id: 'rec1', nome: 'Receita Que Falha' };
        await recipeStore.updateRecipe(updatedData);

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBe('Falha ao atualizar receita.');
        expect(recipeStore.getRecipeById('rec1')).toEqual(initialRecipe);
      });
    });

    describe('deleteRecipe', () => {
      it('deve deletar uma receita com sucesso', async () => {
        const recipeToDelete = { id: 'rec-to-delete', nome: 'A Deletar' };
        const otherRecipe = { id: 'rec-keep', nome: 'Manter' };
        recipeStore.allRecipes = [recipeToDelete, otherRecipe];

        recipeService.remove.mockResolvedValue({});

        await recipeStore.deleteRecipe('rec-to-delete');

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBeNull();
        expect(recipeStore.allRecipes).toEqual([otherRecipe]);
        expect(recipeService.remove).toHaveBeenCalledWith('rec-to-delete');
      });

      it('deve definir o erro se a deleção de receita falhar', async () => {
        const recipeToDelete = { id: 'rec-to-delete', nome: 'A Deletar' };
        recipeStore.allRecipes = [recipeToDelete];

        const mockError = new Error('Erro ao deletar');
        recipeService.remove.mockRejectedValue(mockError);

        await recipeStore.deleteRecipe('rec-to-delete');

        expect(recipeStore.loading).toBe(false);
        expect(recipeStore.error).toBe('Falha ao deletar receita.');
        expect(recipeStore.allRecipes).toContainEqual(recipeToDelete);
      });
    });

    describe('setSearchQuery', () => {
      it('deve definir a query de busca', () => {
        recipeStore.setSearchQuery('pizza');
        expect(recipeStore.searchQuery).toBe('pizza');
      });
    });

    describe('setSelectedCategory', () => {
      it('deve definir a categoria selecionada', () => {
        recipeStore.setSelectedCategory('cat-id-123');
        expect(recipeStore.selectedCategory).toBe('cat-id-123');
      });
    });

    describe('setSortBy', () => {
      it('deve definir a opção de ordenação', () => {
        recipeStore.setSortBy('nome:asc');
        expect(recipeStore.sortBy).toBe('nome:asc');
      });
    });

    describe('setCurrentPage', () => {
      it('deve definir a página atual e converter para número', () => {
        recipeStore.setCurrentPage('5');
        expect(recipeStore.currentPage).toBe(5);
        expect(typeof recipeStore.currentPage).toBe('number');

        recipeStore.setCurrentPage(3);
        expect(recipeStore.currentPage).toBe(3);
      });
    });
  });
});
