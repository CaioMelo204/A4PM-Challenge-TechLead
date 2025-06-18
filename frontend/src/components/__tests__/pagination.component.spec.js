import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PaginationComponent from '../pagination.component.vue';

describe('PaginationComponent', () => {
  it('deve renderizar o componente e botões de navegação', () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 3,
        totalPages: 5,
        pageRange: 5,
      },
    });

    expect(wrapper.find('button.pagination-button:first-child').text()).toBe('Anterior');
    expect(wrapper.find('button.pagination-button:last-child').text()).toBe('Próxima');

    expect(wrapper.findAll('button.pagination-button').length).toBe(7);
  });

  it('deve desabilitar o botão "Anterior" na primeira página', () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 1,
        totalPages: 5,
        pageRange: 5,
      },
    });

    expect(
      wrapper.find('button.pagination-button:first-child').attributes('disabled')
    ).toBeDefined();
    expect(
      wrapper.find('button.pagination-button:last-child').attributes('disabled')
    ).toBeUndefined();
  });

  it('deve desabilitar o botão "Próxima" na última página', () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 5,
        totalPages: 5,
        pageRange: 5,
      },
    });

    expect(
      wrapper.find('button.pagination-button:last-child').attributes('disabled')
    ).toBeDefined();
    expect(
      wrapper.find('button.pagination-button:first-child').attributes('disabled')
    ).toBeUndefined();
  });

  it('deve exibir os números de página corretos dentro do pageRange', () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 3,
        totalPages: 10,
        pageRange: 5,
      },
    });

    const pageButtons = wrapper
      .findAll('.pagination-button')
      .filter((btn) => !['Anterior', 'Próxima'].includes(btn.text()));
    expect(pageButtons.length).toBe(5);
    expect(pageButtons.map((btn) => Number(btn.text()))).toEqual([1, 2, 3, 4, 5]);
  });

  it('deve ajustar o range de páginas quando a currentPage está perto do início', () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 1,
        totalPages: 10,
        pageRange: 5,
      },
    });

    const pageButtons = wrapper
      .findAll('.pagination-button')
      .filter((btn) => !['Anterior', 'Próxima'].includes(btn.text()));
    expect(pageButtons.map((btn) => Number(btn.text()))).toEqual([1, 2, 3, 4, 5]);
  });

  it('deve ajustar o range de páginas quando a currentPage está perto do fim', () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 10,
        totalPages: 10,
        pageRange: 5,
      },
    });

    const pageButtons = wrapper
      .findAll('.pagination-button')
      .filter((btn) => !['Anterior', 'Próxima'].includes(btn.text()));
    expect(pageButtons.map((btn) => Number(btn.text()))).toEqual([8, 9, 10]);
  });

  it('deve emitir o evento "page-change" ao clicar em um número de página', async () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 3,
        totalPages: 5,
        pageRange: 5,
      },
    });

    await wrapper.findAll('.pagination-button')[4].trigger('click');

    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(4);
  });

  it('deve emitir o evento "page-change" ao clicar no botão "Anterior"', async () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 3,
        totalPages: 5,
        pageRange: 5,
      },
    });

    await wrapper.find('button.pagination-button:first-child').trigger('click');

    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(2);
  });

  it('deve emitir o evento "page-change" ao clicar no botão "Próxima"', async () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 3,
        totalPages: 5,
        pageRange: 5,
      },
    });

    await wrapper.find('button.pagination-button:last-child').trigger('click');

    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(4);
  });

  it('não deve emitir "page-change" se o botão "Anterior" estiver desabilitado (primeira página)', async () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 1,
        totalPages: 5,
        pageRange: 5,
      },
    });

    await wrapper.find('button.pagination-button:first-child').trigger('click');

    expect(wrapper.emitted('page-change')).toBeUndefined();
  });

  it('não deve emitir "page-change" se o botão "Próxima" estiver desabilitado (última página)', async () => {
    const wrapper = mount(PaginationComponent, {
      props: {
        currentPage: 5,
        totalPages: 5,
        pageRange: 5,
      },
    });

    await wrapper.find('button.pagination-button:last-child').trigger('click');

    expect(wrapper.emitted('page-change')).toBeUndefined();
  });
});
