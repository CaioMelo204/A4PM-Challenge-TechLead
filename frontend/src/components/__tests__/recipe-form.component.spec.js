import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeForm from '../recipe-form.component.vue';

describe('RecipeForm', () => {
  const stubs = {
    RouterLink: {
      template: '<a :href="to"><slot /></a>',
      props: ['to'],
    },
  };

  const mockCategories = {
    1: 'Sobremesas',
    2: 'Salgados',
    3: 'Bebidas',
  };

  const mockInitialRecipeData = {
    nome: 'Pizza de Calabresa',
    tempo_preparo_minutos: 60,
    porcoes: 4,
    id_categorias: 2,
    ingredientes: 'Massa;Molho;Calabresa;Queijo',
    modo_preparo: '1. Monte a pizza.\n2. Asse no forno.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário com os valores padrão dos props', () => {
    const wrapper = mount(RecipeForm, {
      props: {
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.form-title').text()).toBe('Formulário de Receita');
    expect(wrapper.find('.submit-btn').text()).toBe('Salvar');
    expect(wrapper.find('.back-button').exists()).toBe(false);
    expect(wrapper.find('input#nome').element.value).toBe('');
    expect(wrapper.find('input#tempo_preparo_minutos').element.value).toBe('');
    expect(wrapper.find('select#id_categorias').element.value).toBe('Selecione uma categoria');
  });

  it('deve renderizar o formulário com os valores passados via props', () => {
    const wrapper = mount(RecipeForm, {
      props: {
        initialRecipeData: mockInitialRecipeData,
        loading: true,
        formError: 'Erro de validação',
        categories: mockCategories,
        submitButtonText: 'Atualizando...',
        formTitle: 'Editar Minha Receita',
        backLinkTo: { name: 'RecipeList' },
        backLinkText: 'Voltar',
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.form-title').text()).toBe('Editar Minha Receita');
    expect(wrapper.find('.submit-btn').text()).toBe('Processando...');
    expect(wrapper.find('.submit-btn').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.error-message').text()).toBe('Erro de validação');
    expect(wrapper.find('.back-button').exists()).toBe(true);
    expect(wrapper.find('.back-button').text()).toBe('Voltar');

    expect(wrapper.find('input#nome').element.value).toBe(mockInitialRecipeData.nome);
    expect(Number(wrapper.find('input#tempo_preparo_minutos').element.value)).toBe(
      mockInitialRecipeData.tempo_preparo_minutos
    );
    expect(Number(wrapper.find('input#porcoes').element.value)).toBe(mockInitialRecipeData.porcoes);
    expect(Number(wrapper.find('select#id_categorias').element.value)).toBe(
      mockInitialRecipeData.id_categorias
    );
    expect(wrapper.find('textarea#ingredientes').element.value).toBe(
      mockInitialRecipeData.ingredientes
    );
    expect(wrapper.find('textarea#modo_preparo').element.value).toBe(
      mockInitialRecipeData.modo_preparo
    );
  });

  it('deve atualizar localRecipe via v-model quando o usuário digita nos campos', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    await wrapper.find('input#nome').setValue('Nova Receita');
    await wrapper.find('input#tempo_preparo_minutos').setValue(30);
    await wrapper.find('input#porcoes').setValue(2);
    await wrapper.find('select#id_categorias').setValue(1);
    await wrapper.find('textarea#ingredientes').setValue('Maçã;Canela');
    await wrapper.find('textarea#modo_preparo').setValue('Cozinhe a maçã.');

    expect(wrapper.vm.localRecipe.nome).toBe('Nova Receita');
    expect(wrapper.vm.localRecipe.tempo_preparo_minutos).toBe(30);
    expect(wrapper.vm.localRecipe.porcoes).toBe(2);
    expect(wrapper.vm.localRecipe.id_categorias).toBe(1);
    expect(wrapper.vm.localRecipe.ingredientes).toBe('Maçã;Canela');
    expect(wrapper.vm.localRecipe.modo_preparo).toBe('Cozinhe a maçã.');
  });

  it('deve emitir o evento "submit-form" com os dados do formulário quando válido', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    await wrapper.find('input#nome').setValue('Receita Válida');
    await wrapper.find('textarea#modo_preparo').setValue('Passos para o preparo.');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit-form')).toBeTruthy();
    expect(wrapper.emitted('submit-form')[0][0]).toEqual({
      nome: 'Receita Válida',
      tempo_preparo_minutos: null,
      porcoes: null,
      id_categorias: null,
      ingredientes: '',
      modo_preparo: 'Passos para o preparo.',
    });
  });

  it('não deve emitir "submit-form" se o nome estiver vazio', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    await wrapper.find('textarea#modo_preparo').setValue('Modo de preparo.');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit-form')).toBeUndefined();
  });

  it('não deve emitir "submit-form" se o modo de preparo estiver vazio', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    await wrapper.find('input#nome').setValue('Receita Sem Modo de Preparo');

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('submit-form')).toBeUndefined();
  });

  it('deve desabilitar o botão de submit quando loading é true', () => {
    const wrapper = mount(RecipeForm, {
      props: {
        loading: true,
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });
    expect(wrapper.find('.submit-btn').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.submit-btn').text()).toBe('Processando...');
  });

  it('deve atualizar localRecipe quando initialRecipeData prop muda', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        initialRecipeData: { nome: 'Receita Antiga', modo_preparo: 'Antigo' },
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.vm.localRecipe.nome).toBe('Receita Antiga');

    const newRecipeData = {
      nome: 'Receita Nova',
      tempo_preparo_minutos: 120,
      modo_preparo: 'Novo',
    };
    await wrapper.setProps({ initialRecipeData: newRecipeData });

    expect(wrapper.vm.localRecipe.nome).toBe('Receita Nova');
    expect(wrapper.vm.localRecipe.tempo_preparo_minutos).toBe(120);
  });

  it('deve resetar localRecipe quando initialRecipeData prop se torna null', async () => {
    const wrapper = mount(RecipeForm, {
      props: {
        initialRecipeData: mockInitialRecipeData,
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.vm.localRecipe.nome).toBe(mockInitialRecipeData.nome);

    await wrapper.setProps({ initialRecipeData: null });

    expect(wrapper.vm.localRecipe.nome).toBe('');
    expect(wrapper.vm.localRecipe.tempo_preparo_minutos).toBeNull();
  });

  it('deve renderizar as opções de categoria corretamente no select', () => {
    const wrapper = mount(RecipeForm, {
      props: {
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    const options = wrapper.findAll('select#id_categorias option');
    expect(options.length).toBe(4);
    expect(options[0].text()).toBe('Selecione uma categoria');
    expect(options[1].text()).toBe('Sobremesas');
    expect(options[1].attributes('value')).toBe('1');
    expect(options[2].text()).toBe('Salgados');
    expect(options[2].attributes('value')).toBe('2');
    expect(options[3].text()).toBe('Bebidas');
    expect(options[3].attributes('value')).toBe('3');
  });

  it('deve exibir mensagem de erro se formError for fornecido', () => {
    const wrapper = mount(RecipeForm, {
      props: {
        formError: 'Ocorreu um erro ao salvar!',
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });
    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Ocorreu um erro ao salvar!');
  });

  it('não deve exibir mensagem de erro se formError for null ou vazio', () => {
    const wrapper = mount(RecipeForm, {
      props: {
        formError: null,
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });
    expect(wrapper.find('.error-message').exists()).toBe(false);

    const wrapperEmptyError = mount(RecipeForm, {
      props: {
        formError: '',
        categories: mockCategories,
      },
      global: {
        stubs: stubs,
      },
    });
    expect(wrapperEmptyError.find('.error-message').exists()).toBe(false);
  });
});
