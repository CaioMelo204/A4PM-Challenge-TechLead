import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeDetailCard from '../recipe-detail-card.component.vue';

describe('RecipeDetailCard', () => {
  const stubs = {
    RouterLink: {
      template: '<a :href="to"><slot /></a>',
      props: ['to'],
    },
  };

  const originalWindowPrint = window.print;

  beforeEach(() => {
    window.print = vi.fn();
  });

  afterEach(() => {
    window.print = originalWindowPrint;
  });

  const mockRecipe = {
    id: '123',
    nome: 'Bolo de Cenoura com Cobertura',
    tempo_preparo_minutos: 45,
    porcoes: 6,
    id_categorias: 1,
    ingredientes: 'Farinha;Açúcar;Cenoura;Ovos;Fermento;Cobertura de chocolate;',
    modo_preparo:
      '1. Misture todos os ingredientes secos.\n2. Adicione os líquidos e misture bem.\n3. Asse por 30 minutos.\n4. Cubra com chocolate.',
    criado_em: '2023-01-15T10:00:00.000Z',
    alterado_em: '2023-01-15T10:00:00.000Z',
  };

  const mockFormattedCategories = {
    1: 'Doces',
    2: 'Salgados',
  };

  it('deve renderizar os detalhes completos da receita e links de ação', () => {
    const wrapper = mount(RecipeDetailCard, {
      props: {
        recipe: mockRecipe,
        formattedCategories: mockFormattedCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('h1').text()).toBe(mockRecipe.nome);

    expect(wrapper.find('.delete-button').exists()).toBe(true);
    expect(wrapper.find('button.edit-button').text()).toContain('Imprimir Receita');

    expect(wrapper.text()).toContain(
      `⏰ **Tempo de Preparo:** ${mockRecipe.tempo_preparo_minutos} minutos`
    );
    expect(wrapper.text()).toContain(`🍽️ **Porções:** ${mockRecipe.porcoes}`);
    expect(wrapper.text()).toContain(`**Categoria:** ${mockFormattedCategories['1']}`);

    const ingredientsListItems = wrapper.findAll('.section ul li');
    expect(ingredientsListItems.length).toBe(6);
    expect(ingredientsListItems[0].text()).toBe('Farinha');
    expect(ingredientsListItems[4].text()).toBe('Fermento');

    expect(wrapper.find('.preparation-mode').text()).toBe(mockRecipe.modo_preparo);

    const expectedCreatedDatePart = '15 de janeiro de 2023';
    expect(wrapper.text()).toContain(`Criado em: ${expectedCreatedDatePart}`);
    expect(wrapper.text()).not.toContain('Última atualização:');
  });

  it('deve exibir "Não Categorizado" se a categoria da receita não for encontrada nos dados formatados', () => {
    const recipeWithUnknownCategory = { ...mockRecipe, id_categorias: 999 };
    const wrapper = mount(RecipeDetailCard, {
      props: {
        recipe: recipeWithUnknownCategory,
        formattedCategories: mockFormattedCategories,
      },
      global: {
        stubs: stubs,
      },
    });
    expect(wrapper.text()).toContain('**Categoria:** Não Categorizado');
  });

  it('não deve exibir tempo de preparo, porções, ingredientes ou última atualização se os dados não forem fornecidos/iguais', () => {
    const recipeWithoutOptionalData = {
      ...mockRecipe,
      tempo_preparo_minutos: null,
      porcoes: null,
      ingredientes: '',
      alterado_em: mockRecipe.criado_em,
    };
    const wrapper = mount(RecipeDetailCard, {
      props: {
        recipe: recipeWithoutOptionalData,
        formattedCategories: mockFormattedCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.text()).not.toContain('Tempo de Preparo:');
    expect(wrapper.text()).not.toContain('Porções:');
    expect(wrapper.find('.section ul').findAll('li').length).toBe(0);

    expect(wrapper.text()).not.toContain('Última atualização:');
  });

  it('deve emitir o evento "delete-requested" ao clicar no botão "Deletar Receita"', async () => {
    const wrapper = mount(RecipeDetailCard, {
      props: {
        recipe: mockRecipe,
        formattedCategories: mockFormattedCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    await wrapper.find('.delete-button').trigger('click');

    expect(wrapper.emitted('delete-requested')).toBeTruthy();
    expect(wrapper.emitted('delete-requested').length).toBe(1);
  });

  it('deve exibir a última atualização se for diferente da data de criação', () => {
    const recipeUpdated = {
      ...mockRecipe,
      alterado_em: '2023-01-16T15:30:00.000Z',
    };
    const wrapper = mount(RecipeDetailCard, {
      props: {
        recipe: recipeUpdated,
        formattedCategories: mockFormattedCategories,
      },
      global: {
        stubs: stubs,
      },
    });

    const expectedCreatedDatePart = '15 de janeiro de 2023';
    expect(wrapper.text()).toContain(`Criado em: ${expectedCreatedDatePart}`);

    const expectedUpdatedDatePart = '16 de janeiro de 2023';
    expect(wrapper.text()).toContain(`Última atualização: ${expectedUpdatedDatePart}`);
  });

  it('parseIngredients deve lidar com string de ingredientes vazia ou nula', () => {
    const wrapper = mount(RecipeDetailCard, {
      props: {
        recipe: { ...mockRecipe, ingredientes: null },
        formattedCategories: mockFormattedCategories,
      },
      global: { stubs },
    });
    expect(wrapper.find('.section ul').findAll('li').length).toBe(0);

    const wrapperEmpty = mount(RecipeDetailCard, {
      props: {
        recipe: { ...mockRecipe, ingredientes: '' },
        formattedCategories: mockFormattedCategories,
      },
      global: { stubs },
    });
    expect(wrapperEmpty.find('.section ul').findAll('li').length).toBe(0);

    const wrapperWhitespace = mount(RecipeDetailCard, {
      props: {
        recipe: { ...mockRecipe, ingredientes: '   ;  ' },
        formattedCategories: mockFormattedCategories,
      },
      global: { stubs },
    });
    expect(wrapperWhitespace.find('.section ul').findAll('li').length).toBe(0);
  });
});
