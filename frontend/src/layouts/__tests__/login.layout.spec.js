import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthPage from '../login.layout.vue';

const _mockAuthStore = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../../stores/auth.store.js', () => ({
  useAuthStore: vi.fn(() => _mockAuthStore),
}));

const _mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => _mockRouter),
}));

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _mockAuthStore.token = null;
    _mockAuthStore.isAuthenticated = false;
    _mockAuthStore.loading = false;
    _mockAuthStore.error = null;
    _mockAuthStore.user = null;
    _mockRouter.push.mockClear();
  });

  it('deve renderizar a tela de login por padrão', () => {
    const wrapper = mount(AuthPage);

    expect(wrapper.find('button.auth-toggle-btn.active-toggle').text()).toBe('Login');
    expect(wrapper.find('#login').attributes('style')).toContain('transform: translateX(0)');
    expect(wrapper.find('#register').attributes('style')).toContain('transform: translateX(100%)');
    expect(wrapper.find('h2.form-title').text()).toBe('Bem-vindo(a)!');
  });

  it('deve limpar os campos do formulário ao alternar entre login e registro', async () => {
    const wrapper = mount(AuthPage);

    await wrapper.find('#login input[type="text"]').setValue('test@example.com');
    await wrapper.find('#login input[type="password"]').setValue('password');

    await wrapper.find('button.auth-toggle-btn:not(.active-toggle)').trigger('click');
    await wrapper.vm.$nextTick();
    const registerForm = wrapper.find('#register');

    await registerForm.find('input[placeholder="Nome de Usuário"]').setValue('John Doe');
    await registerForm.find('input[type="email"]').setValue('register@example.com');

    await wrapper.find('button.auth-toggle-btn.active-toggle').trigger('click');
    await wrapper.vm.$nextTick();
    const loginForm = wrapper.find('#login');

    expect(loginForm.find('input[type="text"]').element.value).toBe('');
    expect(loginForm.find('input[type="password"]').element.value).toBe('');

    await wrapper.find('button.auth-toggle-btn:not(.active-toggle)').trigger('click');
    await wrapper.vm.$nextTick();
    const registerFormAgain = wrapper.find('#register');

    expect(registerFormAgain.find('input[placeholder="Nome de Usuário"]').element.value).toBe('');
    expect(registerFormAgain.find('input[type="email"]').element.value).toBe('');
  });

  describe('handleLogin', () => {
    it('deve chamar authStore.login e redirecionar em caso de sucesso', async () => {
      _mockAuthStore.login.mockResolvedValueOnce();
      _mockAuthStore.token = 'mock_token';

      const wrapper = mount(AuthPage);
      await wrapper.vm.$nextTick();

      const loginForm = wrapper.find('#login');
      await loginForm.find('input[type="text"]').setValue('test@example.com');
      await loginForm.find('input[type="password"]').setValue('password123');
      await loginForm.trigger('submit');
      await wrapper.vm.$nextTick();

      expect(_mockAuthStore.login).toHaveBeenCalledTimes(1);
      expect(_mockAuthStore.login).toHaveBeenCalledWith({
        login: 'test@example.com',
        senha: 'password123',
      });
      expect(_mockRouter.push).toHaveBeenCalledTimes(1);
      expect(_mockRouter.push).toHaveBeenCalledWith('/recipes');
      expect(_mockAuthStore.loading).toBe(false);
      expect(_mockAuthStore.error).toBeNull();
    });
  });
});
