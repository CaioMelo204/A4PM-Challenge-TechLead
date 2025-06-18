import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeDetailsPage from '../recipe-details.layout.vue';

const _mockRecipeStore = {
  allRecipes: [],
  allCategories: [],
  loading: false,
  error: null,
  fetchAllRecipes: vi.fn(),
  fetchAllCategories: vi.fn(),
  getRecipeById: vi.fn((id) => _mockRecipeStore.allRecipes.find((r) => r.id === id)),
  deleteRecipe: vi.fn(),
};

vi.mock('../../stores/recipes.store.js', () => ({
  useRecipeStore: vi.fn(() => _mockRecipeStore),
}));

const _mockRoute = {
  params: { id: '123' },
};
const _mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => _mockRoute),
  useRouter: vi.fn(() => _mockRouter),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}));

describe('RecipeDetailsPage', () => {
  const mockRecipe = {
    id: '123',
    nome: 'Bolo de Cenoura',
    tempo_preparo_minutos: 45,
    porcoes: 6,
    id_categorias: 1,
    ingredientes: 'Farinha;Açúcar;Cenoura;Ovos',
    modo_preparo: 'Misture tudo e asse.',
    criado_em: '2023-01-15T10:00:00.000Z',
    alterado_em: '2023-01-15T10:00:00.000Z',
  };

  const mockCategories = [
    { id: 1, nome: 'Doces' },
    { id: 2, nome: 'Salgados' },
  ];

  const originalConfirm = window.confirm;

  beforeEach(() => {
    vi.clearAllMocks();
    _mockRecipeStore.allRecipes = [];
    _mockRecipeStore.allCategories = [];
    _mockRecipeStore.loading = false;
    _mockRecipeStore.error = null;
    _mockRoute.params.id = '123';
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('deve exibir o estado de carregamento quando a store está carregando', () => {
    _mockRecipeStore.loading = true;
    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.find('.loading-state p').text()).toBe('Carregando detalhes da receita...');
    expect(wrapper.findComponent({ name: 'RecipeDetailCardComponent' }).exists()).toBe(false);
  });

  it('deve exibir mensagem de erro quando a store tem um erro', async () => {
    _mockRecipeStore.error = 'Erro ao carregar receita.';
    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message p').text()).toBe('Erro ao carregar receita.');
    expect(wrapper.find('.back-button').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeDetailCardComponent' }).exists()).toBe(false);
  });

  it('deve exibir "Receita não encontrada" se recipe for null após carregamento', async () => {
    _mockRecipeStore.allRecipes = [];
    _mockRecipeStore.loading = false;

    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.find('.loading-state p').text()).toBe('Receita não encontrada.');
    expect(wrapper.find('.back-button').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeDetailCardComponent' }).exists()).toBe(false);
  });

  it('deve renderizar RecipeDetailCardComponent com props corretas quando a receita é encontrada', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;

    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const recipeDetailCard = wrapper.findComponent({ name: 'RecipeDetailCardComponent' });
    expect(recipeDetailCard.exists()).toBe(true);
    expect(recipeDetailCard.props().recipe).toEqual(mockRecipe);
    expect(recipeDetailCard.props().formattedCategories).toEqual({ 1: 'Doces', 2: 'Salgados' });
  });

  it('deve chamar confirmDelete ao receber delete-requested do RecipeDetailCardComponent', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;

    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    await wrapper.findComponent({ name: 'RecipeDetailCardComponent' }).vm.$emit('delete-requested');

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledWith(
      `Tem certeza que deseja deletar a receita "${mockRecipe.nome}"? Esta ação é irreversível.`
    );
  });

  it('deve chamar deleteRecipe e redirecionar se o usuário confirmar a exclusão', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;
    _mockRecipeStore.deleteRecipe.mockResolvedValueOnce();
    window.confirm.mockReturnValue(true);

    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.findComponent({ name: 'RecipeDetailCardComponent' }).vm.$emit('delete-requested');

    expect(_mockRecipeStore.deleteRecipe).toHaveBeenCalledTimes(1);
    expect(_mockRecipeStore.deleteRecipe).toHaveBeenCalledWith(mockRecipe.id);
    expect(_mockRouter.push).toHaveBeenCalledTimes(1);
    expect(_mockRouter.push).toHaveBeenCalledWith({ name: 'RecipeList' });
  });

  it('não deve chamar deleteRecipe e nem redirecionar se o usuário cancelar a exclusão', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;
    window.confirm.mockReturnValue(false);

    const wrapper = mount(RecipeDetailsPage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeDetailCardComponent: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.findComponent({ name: 'RecipeDetailCardComponent' }).vm.$emit('delete-requested');

    expect(_mockRecipeStore.deleteRecipe).not.toHaveBeenCalled();
    expect(_mockRouter.push).not.toHaveBeenCalled();
  });
});
