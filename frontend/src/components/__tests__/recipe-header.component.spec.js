import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RecipeHeaderComponent from '../recipe-header.component.vue';

describe('HeaderComponent', () => {
  const mockCategories = {
    1: 'Categoria A',
    2: 'Categoria B',
    3: 'Categoria C',
  };

  it('deve renderizar com os valores iniciais dos props', () => {
    const wrapper = mount(RecipeHeaderComponent, {
      props: {
        initialSearchFilters: {
          nome: 'Bolo',
          ingredientes: 'chocolate',
          porcoes: 8,
          id_categorias: 2,
        },
        initialSortBy: 'asc',
        categories: mockCategories,
      },
    });

    expect(wrapper.find('input[placeholder="Buscar por nome..."]').element.value).toBe('Bolo');
    expect(wrapper.find('input[placeholder="Buscar por ingrediente..."]').element.value).toBe(
      'chocolate'
    );
    expect(Number(wrapper.find('input[placeholder="Porções (ex: 4)"]').element.value)).toBe(8);
    expect(Number(wrapper.find('select.search-input').element.value)).toBe(2);
    expect(wrapper.find('select.sort-select').element.value).toBe('asc');
  });

  it('deve emitir o evento "apply:filters" com os filtros e ordenação corretos ao clicar no botão', async () => {
    const wrapper = mount(RecipeHeaderComponent, {
      props: {
        initialSearchFilters: {
          nome: '',
          ingredientes: '',
          porcoes: null,
          id_categorias: null,
        },
        initialSortBy: 'desc',
        categories: mockCategories,
      },
    });

    await wrapper.find('input[placeholder="Buscar por nome..."]').setValue('Receita Teste');
    await wrapper.find('input[placeholder="Buscar por ingrediente..."]').setValue('leite');
    await wrapper.find('input[placeholder="Porções (ex: 4)"]').setValue(6);
    await wrapper.find('select.search-input').setValue(1);
    await wrapper.find('select.sort-select').setValue('asc');

    await wrapper.find('.apply-filters-button').trigger('click');

    expect(wrapper.emitted('apply:filters')).toBeTruthy();
    expect(wrapper.emitted('apply:filters')[0][0]).toEqual({
      filters: {
        nome: 'Receita Teste',
        ingredientes: 'leite',
        porcoes: 6,
        id_categorias: 1,
      },
      sortBy: 'asc',
    });
  });

  it('deve resetar filtros e ordenação quando initialSearchFilters e initialSortBy mudam', async () => {
    const wrapper = mount(RecipeHeaderComponent, {
      props: {
        initialSearchFilters: {
          nome: 'Original',
          ingredientes: '',
          porcoes: null,
          id_categorias: null,
        },
        initialSortBy: 'desc',
        categories: mockCategories,
      },
    });

    await wrapper.find('input[placeholder="Buscar por nome..."]').setValue('Alterado');
    await wrapper.find('select.sort-select').setValue('asc');

    expect(wrapper.vm.searchFilters.nome).toBe('Alterado');
    expect(wrapper.vm.sortBy).toBe('asc');

    await wrapper.setProps({
      initialSearchFilters: {
        nome: 'Novo Filtro',
        ingredientes: 'água',
        porcoes: 2,
        id_categorias: 3,
      },
      initialSortBy: 'asc',
    });

    expect(wrapper.vm.searchFilters.nome).toBe('Novo Filtro');
    expect(wrapper.vm.searchFilters.ingredientes).toBe('água');
    expect(wrapper.vm.searchFilters.porcoes).toBe(2);
    expect(wrapper.vm.searchFilters.id_categorias).toBe(3);
    expect(wrapper.vm.sortBy).toBe('asc');
  });

  it('deve renderizar as opções de categoria corretamente', () => {
    const wrapper = mount(RecipeHeaderComponent, {
      props: {
        initialSearchFilters: {},
        initialSortBy: 'desc',
        categories: mockCategories,
      },
    });

    const categoryOptions = wrapper.findAll('select.search-input option');
    expect(categoryOptions.length).toBe(4);
    expect(categoryOptions[0].text()).toBe('Todas as Categorias');
    expect(categoryOptions[1].text()).toBe('Categoria A');
    expect(categoryOptions[2].text()).toBe('Categoria B');
    expect(categoryOptions[3].text()).toBe('Categoria C');
  });

  it('deve permitir que porcoes seja vazio', async () => {
    const wrapper = mount(RecipeHeaderComponent, {
      props: {
        initialSearchFilters: { porcoes: 4 },
        initialSortBy: 'desc',
        categories: mockCategories,
      },
    });

    expect(Number(wrapper.find('input[placeholder="Porções (ex: 4)"]').element.value)).toBe(4);

    await wrapper.find('input[placeholder="Porções (ex: 4)"]').setValue('');
    expect(wrapper.vm.searchFilters.porcoes).toBe('');

    await wrapper.find('.apply-filters-button').trigger('click');
    expect(wrapper.emitted('apply:filters')[0][0].filters.porcoes).toBe('');
  });
});
