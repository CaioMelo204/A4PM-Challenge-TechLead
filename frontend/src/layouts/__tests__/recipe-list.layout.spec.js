import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipesPage from '../recipe-list.layout.vue';

const _mockRecipeStore = {
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'nome:asc',
  allRecipes: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  allCategories: [],
  setSearchQuery: vi.fn((query) => {
    _mockRecipeStore.searchQuery = query;
  }),
  setSelectedCategory: vi.fn((id) => {
    _mockRecipeStore.selectedCategory = id;
  }),
  setSortBy: vi.fn((sort) => {
    _mockRecipeStore.sortBy = sort;
  }),
  setCurrentPage: vi.fn((page) => {
    _mockRecipeStore.currentPage = page;
  }),
  searchRecipes: vi.fn(),
  fetchAllCategories: vi.fn(),
  fetchAllRecipes: vi.fn(),
};

vi.mock('../../stores/recipes.store.js', () => ({
  useRecipeStore: vi.fn(() => _mockRecipeStore),
}));

const _mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => _mockRouter),
  RouterLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}));

describe('RecipesPage', () => {
  const mockRecipes = [
    { id: '1', nome: 'Bolo', tempo_preparo_minutos: 60, porcoes: 8 },
    { id: '2', nome: 'Pão', tempo_preparo_minutos: 30, porcoes: 4 },
  ];
  const mockCategories = [
    { id: 1, nome: 'Doces' },
    { id: 2, nome: 'Salgados' },
  ];
  const formattedMockCategories = {
    1: 'Doces',
    2: 'Salgados',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    _mockRecipeStore.searchQuery = '';
    _mockRecipeStore.selectedCategory = null;
    _mockRecipeStore.sortBy = 'nome:asc';
    _mockRecipeStore.allRecipes = [];
    _mockRecipeStore.loading = false;
    _mockRecipeStore.error = null;
    _mockRecipeStore.currentPage = 1;
    _mockRecipeStore.totalPages = 1;
    _mockRecipeStore.totalItems = 0;
    _mockRecipeStore.allCategories = [];

    _mockRecipeStore.searchRecipes.mockResolvedValue();
    _mockRecipeStore.fetchAllCategories.mockResolvedValue();
    _mockRecipeStore.fetchAllRecipes.mockResolvedValue();
  });

  it('deve renderizar os componentes filhos e o título da seção', () => {
    const wrapper = mount(RecipesPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeHeaderComponent: true,
          RecipeGrid: true,
          PaginationComponent: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'AppHeader' }).exists()).toBe(true);
    expect(wrapper.find('.header-section h2').text()).toBe('Lista de Receitas');
    expect(wrapper.find('.create-recipe-button').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeHeaderComponent' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeGrid' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'PaginationComponent' }).exists()).toBe(true);
  });

  it('deve passar props corretas para RecipeGrid', async () => {
    _mockRecipeStore.allRecipes = mockRecipes;
    _mockRecipeStore.loading = true;
    _mockRecipeStore.error = 'Um erro de teste';
    _mockRecipeStore.totalItems = 2;

    const wrapper = mount(RecipesPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeHeaderComponent: true,
          RecipeGrid: true,
          PaginationComponent: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'RecipeGrid' }).props().allRecipes).toEqual(mockRecipes);
    expect(wrapper.findComponent({ name: 'RecipeGrid' }).props().loading).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeGrid' }).props().error).toBe('Um erro de teste');
    expect(wrapper.findComponent({ name: 'RecipeGrid' }).props().totalItems).toBe(2);
  });

  it('deve passar props corretas para PaginationComponent', async () => {
    _mockRecipeStore.currentPage = 2;
    _mockRecipeStore.totalPages = 5;

    const wrapper = mount(RecipesPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeHeaderComponent: true,
          RecipeGrid: true,
          PaginationComponent: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'PaginationComponent' }).props().currentPage).toBe(2);
    expect(wrapper.findComponent({ name: 'PaginationComponent' }).props().totalPages).toBe(5);
  });
});
