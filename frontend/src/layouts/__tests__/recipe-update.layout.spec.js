import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EditRecipePage from '../recipe-update.layout.vue';

const _mockRecipeStore = {
  allRecipes: [],
  allCategories: [],
  loading: false,
  error: null,
  fetchAllRecipes: vi.fn(),
  fetchAllCategories: vi.fn(),
  getRecipeById: vi.fn((id) => _mockRecipeStore.allRecipes.find((r) => r.id === id)),
  updateRecipe: vi.fn(),
};

vi.mock('../../stores/recipes.store.js', () => ({
  useRecipeStore: vi.fn(() => _mockRecipeStore),
}));

const _mockRoute = {
  params: { id: 'recipe-1' },
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

describe('EditRecipePage', () => {
  const mockRecipe = {
    id: 'recipe-1',
    nome: 'Bolo de Chocolate',
    tempo_preparo_minutos: 60,
    porcoes: 8,
    id_categorias: 1,
    ingredientes: 'chocolate;farinha;açúcar',
    modo_preparo: 'misturar e assar',
  };

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
    _mockRecipeStore.allRecipes = [];
    _mockRecipeStore.allCategories = [];
    _mockRecipeStore.loading = false;
    _mockRecipeStore.error = null;
    _mockRoute.params.id = 'recipe-1';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve exibir o estado de carregamento quando a store está carregando', () => {
    _mockRecipeStore.loading = true;
    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });

    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.find('.loading-state p').text()).toBe('Carregando receita para edição...');
    expect(wrapper.findComponent({ name: 'RecipeForm' }).exists()).toBe(false);
  });

  it('deve exibir mensagem de erro quando a store tem um erro', async () => {
    _mockRecipeStore.error = 'Erro ao carregar receita para edição.';
    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message p').text()).toBe('Erro ao carregar receita para edição.');
    expect(wrapper.find('.back-button').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeForm' }).exists()).toBe(false);
  });

  it('deve exibir "Receita não encontrada" se a receita não existir após o carregamento', async () => {
    _mockRecipeStore.allRecipes = [];
    _mockRecipeStore.loading = false;
    _mockRecipeStore.error = null;

    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.find('.loading-state p').text()).toBe('Receita não encontrada para edição.');
    expect(wrapper.find('.back-button').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeForm' }).exists()).toBe(false);
  });

  it('deve renderizar RecipeForm com props corretas quando a receita é encontrada', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;

    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const recipeForm = wrapper.findComponent({ name: 'RecipeForm' });
    expect(recipeForm.exists()).toBe(true);
    expect(recipeForm.props().initialRecipeData).toEqual(mockRecipe);
    expect(recipeForm.props().loading).toBe(false);
    expect(recipeForm.props().formError).toBeNull();
    expect(recipeForm.props().categories).toEqual(formattedMockCategories);
    expect(recipeForm.props().submitButtonText).toBe('Salvar Alterações');
    expect(recipeForm.props().formTitle).toBe('Editar Receita');
    expect(recipeForm.props().backLinkTo).toEqual({
      name: 'RecipeDetails',
      params: { id: mockRecipe.id },
    });
  });

  it('deve chamar fetchAllRecipes e fetchAllCategories no onMounted/watcher se os dados estiverem vazios', async () => {
    _mockRecipeStore.allRecipes = [];
    _mockRecipeStore.allCategories = [];
    _mockRecipeStore.fetchAllRecipes.mockResolvedValueOnce();
    _mockRecipeStore.fetchAllCategories.mockResolvedValueOnce();

    mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(_mockRecipeStore.fetchAllRecipes).toHaveBeenCalledTimes(1);
    expect(_mockRecipeStore.fetchAllCategories).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar fetchAllRecipes se as receitas já estiverem carregadas', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = [];
    _mockRecipeStore.fetchAllRecipes.mockResolvedValueOnce();
    _mockRecipeStore.fetchAllCategories.mockResolvedValueOnce();

    mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(_mockRecipeStore.fetchAllRecipes).not.toHaveBeenCalled();
    expect(_mockRecipeStore.fetchAllCategories).toHaveBeenCalledTimes(1);
  });

  it('deve chamar updateRecipe e redirecionar em caso de submissão bem-sucedida', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;
    _mockRecipeStore.updateRecipe.mockResolvedValueOnce();

    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });
    await wrapper.vm.$nextTick();

    const updatedFormData = { ...mockRecipe, nome: 'Bolo de Cenoura Editado' };
    await wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('submit-form', updatedFormData);

    expect(_mockRecipeStore.updateRecipe).toHaveBeenCalledTimes(1);
    expect(_mockRecipeStore.updateRecipe).toHaveBeenCalledWith(updatedFormData);
    expect(_mockRouter.push).toHaveBeenCalledTimes(1);
    expect(_mockRouter.push).toHaveBeenCalledWith({
      name: 'RecipeDetails',
      params: { id: updatedFormData.id },
    });
  });

  it('deve definir erro e não atualizar receita se nome ou modo_preparo estiverem vazios no handleSubmit', async () => {
    _mockRecipeStore.allRecipes = [mockRecipe];
    _mockRecipeStore.allCategories = mockCategories;

    const wrapper = mount(EditRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
          RouterLink: true,
        },
      },
    });
    await wrapper.vm.$nextTick();

    const formDataMissingName = { ...mockRecipe, nome: '' };
    await wrapper
      .findComponent({ name: 'RecipeForm' })
      .vm.$emit('submit-form', formDataMissingName);

    expect(_mockRecipeStore.updateRecipe).not.toHaveBeenCalled();
    expect(_mockRecipeStore.error).toBe('Nome da receita e modo de preparo são obrigatórios!');
    expect(_mockRouter.push).not.toHaveBeenCalled();

    _mockRecipeStore.error = null;

    const formDataMissingModoPreparo = { ...mockRecipe, modo_preparo: '' };
    await wrapper
      .findComponent({ name: 'RecipeForm' })
      .vm.$emit('submit-form', formDataMissingModoPreparo);

    expect(_mockRecipeStore.updateRecipe).not.toHaveBeenCalled();
    expect(_mockRecipeStore.error).toBe('Nome da receita e modo de preparo são obrigatórios!');
    expect(_mockRouter.push).not.toHaveBeenCalled();
  });
});
