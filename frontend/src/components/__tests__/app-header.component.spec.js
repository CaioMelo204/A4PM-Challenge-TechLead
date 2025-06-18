import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from '../app-header.component.vue';

const _mockAuthStore = {
  logout: vi.fn(),
};

vi.mock('../../stores/auth.store.js', () => ({
  useAuthStore: vi.fn(() => _mockAuthStore),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

import { useRouter } from 'vue-router';

describe('AppHeader', () => {
  let mockRouter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = useRouter();
  });

  it('deve renderizar o título do aplicativo e o botão de sair', () => {
    const wrapper = mount(AppHeader);

    expect(wrapper.find('.app-title').exists()).toBe(true);
    expect(wrapper.find('.app-title').text()).toBe('Seu App de Receitas');

    expect(wrapper.find('.logout-button').exists()).toBe(true);
    expect(wrapper.find('.logout-button').text()).toBe('Sair');
  });

  it('deve chamar a função de logout da store ao clicar no botão "Sair"', async () => {
    const wrapper = mount(AppHeader);

    await wrapper.find('.logout-button').trigger('click');

    expect(_mockAuthStore.logout).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
