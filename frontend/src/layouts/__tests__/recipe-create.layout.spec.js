import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CreateRecipePage from '../recipe-create.layout.vue';

const _mockRecipeStore = {
  allCategories: [],
  loading: false,
  error: null,
  addRecipe: vi.fn(),
  fetchAllCategories: vi.fn(),
  setError: vi.fn((message) => {
    _mockRecipeStore.error = message;
  }),
};

vi.mock('../../stores/recipes.store.js', () => ({
  useRecipeStore: vi.fn(() => _mockRecipeStore),
}));

const _mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => _mockRouter),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}));

describe('CreateRecipePage', () => {
  const mockCategories = [
    { id: 1, nome: 'Doces' },
    { id: 2, nome: 'Salgados' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    _mockRecipeStore.allCategories = [];
    _mockRecipeStore.loading = false;
    _mockRecipeStore.error = null;
    _mockRecipeStore.addRecipe.mockClear();
    _mockRecipeStore.fetchAllCategories.mockClear();
    _mockRecipeStore.setError.mockImplementation((message) => {
      _mockRecipeStore.error = message;
    });
    _mockRouter.push.mockClear();
  });

  it('deve renderizar o AppHeader e RecipeForm', () => {
    const wrapper = mount(CreateRecipePage, {
      global: {
        stubs: {
          AppHeader: true,
          RecipeForm: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'AppHeader' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecipeForm' }).exists()).toBe(true);
  });

  describe('handleSubmit', () => {
    it('deve adicionar a receita e redirecionar em caso de sucesso', async () => {
      const addedRecipe = { id: 'new-recipe-id', nome: 'Pizza', modo_preparo: 'Assar' };
      _mockRecipeStore.addRecipe.mockResolvedValueOnce(addedRecipe);
      _mockRecipeStore.allCategories = mockCategories;

      const wrapper = mount(CreateRecipePage, {
        global: {
          stubs: {
            AppHeader: true,
            RecipeForm: true,
          },
        },
      });

      const formData = {
        nome: 'Nova Receita',
        tempo_preparo_minutos: 30,
        porcoes: 2,
        id_categorias: 1,
        ingredientes: 'Ing1; Ing2',
        modo_preparo: 'Passos de preparo',
      };
      await wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('submit-form', formData);

      expect(_mockRecipeStore.addRecipe).toHaveBeenCalledTimes(1);
      expect(_mockRecipeStore.addRecipe).toHaveBeenCalledWith({
        ...formData,
        id_usuarios: 1001,
      });
      expect(_mockRouter.push).toHaveBeenCalledTimes(1);
      expect(_mockRouter.push).toHaveBeenCalledWith({
        name: 'RecipeDetails',
        params: { id: addedRecipe.id },
      });
      expect(_mockRecipeStore.error).toBeNull();
    });

    it('deve definir erro e não adicionar receita se nome ou modo_preparo estiverem vazios', async () => {
      const wrapper = mount(CreateRecipePage, {
        global: {
          stubs: {
            AppHeader: true,
            RecipeForm: true,
          },
        },
      });

      const formDataNomeVazio = {
        nome: '',
        tempo_preparo_minutos: 30,
        porcoes: 2,
        id_categorias: 1,
        ingredientes: 'Ing1; Ing2',
        modo_preparo: 'Passos de preparo',
      };
      await wrapper
        .findComponent({ name: 'RecipeForm' })
        .vm.$emit('submit-form', formDataNomeVazio);

      expect(_mockRecipeStore.addRecipe).not.toHaveBeenCalled();
      expect(_mockRecipeStore.error).toBe('Nome da receita e modo de preparo são obrigatórios!');
      expect(_mockRouter.push).not.toHaveBeenCalled();

      _mockRecipeStore.error = null;

      const formDataModoPreparoVazio = {
        nome: 'Receita Vazia',
        tempo_preparo_minutos: 30,
        porcoes: 2,
        id_categorias: 1,
        ingredientes: 'Ing1; Ing2',
        modo_preparo: '',
      };
      await wrapper
        .findComponent({ name: 'RecipeForm' })
        .vm.$emit('submit-form', formDataModoPreparoVazio);

      expect(_mockRecipeStore.addRecipe).not.toHaveBeenCalled();
      expect(_mockRecipeStore.error).toBe('Nome da receita e modo de preparo são obrigatórios!');
      expect(_mockRouter.push).not.toHaveBeenCalled();
    });

    it('deve definir erro e não redirecionar em caso de falha na adição da receita', async () => {
      _mockRecipeStore.addRecipe.mockRejectedValueOnce(new Error('Erro de API'));
      _mockRecipeStore.allCategories = mockCategories;

      const wrapper = mount(CreateRecipePage, {
        global: {
          stubs: {
            AppHeader: true,
            RecipeForm: true,
          },
        },
      });

      const formData = {
        nome: 'Receita que Falha',
        tempo_preparo_minutos: 30,
        porcoes: 2,
        id_categorias: 1,
        ingredientes: 'Ing1; Ing2',
        modo_preparo: 'Passos de preparo',
      };
      await wrapper.findComponent({ name: 'RecipeForm' }).vm.$emit('submit-form', formData);

      expect(_mockRecipeStore.addRecipe).toHaveBeenCalledTimes(1);
      expect(_mockRecipeStore.error).toBe(null);

      expect(_mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
