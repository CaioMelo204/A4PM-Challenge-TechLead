import { defineStore } from 'pinia';
import recipeService from '../services/recipe.service.js';
import categoriesService from '../services/category.service.js';

export const useRecipeStore = defineStore('recipes', {
  state: () => ({
    allRecipes: [],
    loading: false,
    error: null,
    allCategories: [],
    searchQuery: '',
    selectedCategory: null,
    sortBy: 'desc',
    limit: 25,
    totalPages: 1,
    totalItems: 0,
    currentPage: 1,
  }),
  actions: {
    async fetchAllCategories() {
      this.loading = true;
      this.error = null;
      try {
        this.allCategories = await categoriesService.getAll();
      } catch (err) {
        this.error = 'Falha ao carregar categorias.';
      } finally {
        this.loading = false;
      }
    },
    async fetchAllRecipes() {
      this.loading = true;
      this.error = null;
      try {
        const { recipes, pagination } = await recipeService.getAll({
          limit: this.limit,
          page: 1,
          order: 'desc',
        });
        console.log(pagination);
        this.allRecipes = recipes;
        this.limit = pagination.limit;
        this.totalPages = pagination.total_pages;
        this.totalItems = pagination.total_records;
        this.currentPage = pagination.current_page;
      } catch (err) {
        this.error = 'Falha ao carregar receitas.';
      } finally {
        this.loading = false;
      }
    },
    async searchRecipes(filters) {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          nome: filters.query || undefined,
          id_categorias: filters.category || this.selectedCategory,
          sortBy: filters.sortBy || this.sortBy,
          ingredientes: filters.ingredientes || undefined,
          porcoes: filters.porcoes || undefined,
          limit: filters.limit || this.limit,
          page: filters.page || 1,
          order: filters.order || 'desc',
        };
        const { recipes, pagination } = await recipeService.search(params);
        this.allRecipes = recipes;
        this.limit = pagination.limit;
        this.totalPages = pagination.total_pages;
        this.totalItems = pagination.total_records;
        this.currentPage = pagination.current_page;
      } catch (err) {
        this.error = 'Falha ao carregar receitas.';
      } finally {
        this.loading = false;
      }
    },
    async addRecipe(newRecipe) {
      this.loading = true;
      try {
        const addedRecipe = await recipeService.create(newRecipe);
        this.allRecipes.push(addedRecipe);
        return addedRecipe;
      } catch (err) {
        this.error = 'Falha ao adicionar receita.';
      } finally {
        this.loading = false;
      }
    },
    async updateRecipe(updatedRecipe) {
      this.loading = true;
      try {
        await recipeService.update(updatedRecipe.id, updatedRecipe);
        const index = this.allRecipes.findIndex((r) => r.id === updatedRecipe.id);
        if (index !== -1) {
          this.allRecipes[index] = { ...updatedRecipe, alterado_em: new Date().toISOString() };
        }
      } catch (err) {
        this.error = 'Falha ao atualizar receita.';
      } finally {
        this.loading = false;
      }
    },
    async deleteRecipe(id) {
      this.loading = true;
      try {
        await recipeService.remove(id);
        this.allRecipes = this.allRecipes.filter((recipe) => recipe.id !== id);
      } catch (err) {
        this.error = 'Falha ao deletar receita.';
      } finally {
        this.loading = false;
      }
    },
    setSearchQuery(query) {
      this.searchQuery = query;
    },
    setSelectedCategory(categoryId) {
      this.selectedCategory = categoryId;
    },
    setSortBy(sortOption) {
      this.sortBy = sortOption;
    },
    setCurrentPage(page) {
      this.currentPage = Number(page);
    },
  },
  getters: {
    getRecipeById: (state) => (id) => {
      return state.allRecipes.find((recipe) => recipe.id == id);
    },
  },
});
