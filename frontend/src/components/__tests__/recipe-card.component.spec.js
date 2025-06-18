import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeGrid from '../recipe-card.component.vue';

describe('RecipeGrid', () => {
  const stubs = {
    RouterLink: {
      template: '<a :href="to"><slot /></a>',
      props: ['to'],
    },
  };

  it('deve exibir o estado de carregamento quando loading é true', () => {
    const wrapper = mount(RecipeGrid, {
      props: {
        allRecipes: [],
        loading: true,
        error: null,
        totalItems: 0,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.loading-state').exists()).toBe(true);
    expect(wrapper.find('.loading-state p').text()).toBe('Carregando receitas...');
    expect(wrapper.find('.error-message').exists()).toBe(false);
    expect(wrapper.find('.no-recipes').exists()).toBe(false);
  });

  it('deve exibir a mensagem de erro quando error não é nulo', () => {
    const wrapper = mount(RecipeGrid, {
      props: {
        allRecipes: [],
        loading: false,
        error: 'Algo deu errado!',
        totalItems: 0,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message p').text()).toBe('Algo deu errado!');
    expect(wrapper.find('.loading-state').exists()).toBe(false);
    expect(wrapper.find('.no-recipes').exists()).toBe(false);
  });

  it('deve exibir a mensagem "Nenhuma receita encontrada" quando allRecipes está vazio', () => {
    const wrapper = mount(RecipeGrid, {
      props: {
        allRecipes: [],
        loading: false,
        error: null,
        totalItems: 0,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.no-recipes').exists()).toBe(true);
    expect(wrapper.find('.no-recipes p:first-child').text()).toBe(
      'Nenhuma receita encontrada com os filtros e ordenação aplicados.'
    );
    expect(wrapper.find('.no-recipes p:last-child').text()).toBe(
      'Adicione novas receitas para vê-las aqui!'
    );
    expect(wrapper.find('.loading-state').exists()).toBe(false);
    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('deve exibir apenas a primeira mensagem "Nenhuma receita encontrada" quando allRecipes está vazio mas totalItems > 0', () => {
    const wrapper = mount(RecipeGrid, {
      props: {
        allRecipes: [],
        loading: false,
        error: null,
        totalItems: 5,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.no-recipes').exists()).toBe(true);
    expect(wrapper.find('.no-recipes p:first-child').text()).toBe(
      'Nenhuma receita encontrada com os filtros e ordenação aplicados.'
    );
  });

  it('deve renderizar as receitas quando allRecipes possui dados', () => {
    const mockRecipes = [
      { id: '1', nome: 'Bolo de Chocolate', tempo_preparo_minutos: 60, porcoes: 8 },
      { id: '2', nome: 'Salada de Frutas', tempo_preparo_minutos: 15, porcoes: 4 },
    ];
    const wrapper = mount(RecipeGrid, {
      props: {
        allRecipes: mockRecipes,
        loading: false,
        error: null,
        totalItems: 2,
      },
      global: {
        stubs: stubs,
      },
    });

    expect(wrapper.find('.recipe-grid').exists()).toBe(true);
    const recipeCards = wrapper.findAll('.recipe-card-link');
    expect(recipeCards.length).toBe(mockRecipes.length);

    expect(recipeCards[0].find('h3').text()).toBe('Bolo de Chocolate');
    expect(recipeCards[0].find('p:nth-of-type(1)').text()).toBe('⏰ 60 min');
    expect(recipeCards[0].find('p:nth-of-type(2)').text()).toBe('🍽️ 8 porções');

    expect(recipeCards[1].find('h3').text()).toBe('Salada de Frutas');
    expect(recipeCards[1].find('p:nth-of-type(1)').text()).toBe('⏰ 15 min');
    expect(recipeCards[1].find('p:nth-of-type(2)').text()).toBe('🍽️ 4 porções');
  });

  it('não deve exibir tempo_preparo_minutos ou porcoes se não fornecidos', () => {
    const mockRecipes = [{ id: '3', nome: 'Água' }];
    const wrapper = mount(RecipeGrid, {
      props: {
        allRecipes: mockRecipes,
        loading: false,
        error: null,
        totalItems: 1,
      },
      global: {
        stubs: stubs,
      },
    });

    const recipeCard = wrapper.find('.recipe-card');
    expect(recipeCard.find('h3').text()).toBe('Água');
    expect(recipeCard.find('p:nth-of-type(1)').exists()).toBe(false);
    expect(recipeCard.find('p:nth-of-type(2)').exists()).toBe(false);
  });
});
