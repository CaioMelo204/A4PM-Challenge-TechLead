<template>
  <div class="auth-page-wrapper">
    <div class="auth-card">
      <div class="auth-toggle-buttons">
        <div
          id="btn"
          class="toggle-background"
          :style="{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }"
        ></div>
        <button
          type="button"
          class="auth-toggle-btn"
          :class="{ 'active-toggle': isLogin }"
          @click="showLogin"
        >
          Login
        </button>
        <button
          type="button"
          class="auth-toggle-btn"
          :class="{ 'active-toggle': !isLogin }"
          @click="showRegister"
        >
          Registrar
        </button>
      </div>

      <form
        id="login"
        class="auth-form-group"
        :style="{
          transform: isLogin ? 'translateX(0)' : 'translateX(-100%)',
          opacity: isLogin ? 1 : 0,
          'pointer-events': isLogin ? 'auto' : 'none',
        }"
        @submit.prevent="handleLogin"
      >
        <h2 class="form-title">Bem-vindo(a)!</h2>
        <input
          type="text"
          class="auth-input-field"
          placeholder="Email"
          v-model="loginEmail"
          required
        />
        <input
          type="password"
          class="auth-input-field"
          placeholder="Senha"
          v-model="loginSenha"
          required
        />
        <button type="submit" class="auth-submit-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="authStore.error && isLogin" class="error-message">{{ authStore.error }}</p>
      </form>

      <form
        id="register"
        class="auth-form-group"
        :style="{
          transform: !isLogin ? 'translateX(0)' : 'translateX(100%)',
          opacity: !isLogin ? 1 : 0,
          'pointer-events': !isLogin ? 'auto' : 'none',
        }"
        @submit.prevent="handleRegister"
      >
        <h2 class="form-title">Crie sua conta</h2>
        <input
          type="text"
          class="auth-input-field"
          placeholder="Nome de Usuário"
          v-model="registerNome"
          required
        />
        <input
          type="email"
          class="auth-input-field"
          placeholder="Email"
          v-model="registerEmail"
          required
        />
        <input
          type="password"
          class="auth-input-field"
          placeholder="Senha"
          v-model="registerSenha"
          required
        />
        <input
          type="password"
          class="auth-input-field"
          placeholder="Confirme a senha"
          v-model="registerConfirmarSenha"
          required
        />
        <button type="submit" class="auth-submit-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Registrando...' : 'Registrar' }}
        </button>
        <p v-if="authStore.error && !isLogin" class="error-message">{{ authStore.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth.store.js';

  const authStore = useAuthStore();
  const router = useRouter();

  const isLogin = ref(true);
  const loginEmail = ref('');
  const loginSenha = ref('');
  const registerNome = ref('');
  const registerEmail = ref('');
  const registerSenha = ref('');
  const registerConfirmarSenha = ref('');

  const showLogin = () => {
    isLogin.value = true;
    authStore.error = null;
  };

  const showRegister = () => {
    isLogin.value = false;
    authStore.error = null;
  };

  const handleLogin = async () => {
    await authStore.login({ login: loginEmail.value, senha: loginSenha.value });
    if (authStore.token) {
      await router.push('/recipes');
    }
  };

  const handleRegister = async () => {
    if (registerSenha.value !== registerConfirmarSenha.value) {
      authStore.error = 'As senhas não coincidem!';
      return;
    }

    await authStore.register({
      nome: registerNome.value,
      login: registerEmail.value,
      senha: registerSenha.value,
    });

    isLogin.value = true;
  };

  watch(isLogin, (newValue, oldValue) => {
    loginEmail.value = '';
    loginSenha.value = '';
    registerNome.value = '';
    registerEmail.value = '';
    registerSenha.value = '';
    registerConfirmarSenha.value = '';
  });
</script>

<style scoped>
  .auth-page-wrapper {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f0f8ff, #e6f2ff);
    padding: 20px;
  }

  .auth-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    height: 600px;
    width: 420px;
    padding: 30px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Toggle Buttons */
  .auth-toggle-buttons {
    width: 100%;
    max-width: 280px;
    margin-bottom: 30px;
    background-color: #f0f0f0;
    border-radius: 50px;
    display: flex;
    position: relative;
    padding: 5px;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .toggle-background {
    position: absolute;
    top: 5px;
    left: 5px;
    width: calc(50% - 5px);
    height: calc(100% - 10px);
    background: linear-gradient(to right, #ff105f, #ffad06);
    border-radius: 50px;
    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    z-index: 1;
  }

  .auth-toggle-btn {
    flex: 1;
    padding: 12px 0;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 600;
    color: #555;
    transition: color 0.3s ease;
    position: relative;
    z-index: 2;
  }

  .auth-toggle-btn.active-toggle {
    color: #ffffff;
  }

  /* Form Groups */
  .auth-form-group {
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: absolute;
    top: 130px; /* Adjust based on new layout */
    left: 0;
    padding: 0 30px;
    transition:
      transform 0.5s ease-in-out,
      opacity 0.5s ease-in-out;
    background: #ffffff; /* Ensure background to cover other form */
  }

  .form-title {
    font-size: 2em;
    color: #333;
    text-align: center;
    margin-bottom: 10px;
  }

  /* Input Fields */
  .auth-input-field {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
  }

  .auth-input-field:focus {
    border-color: #6a82fb;
    box-shadow: 0 0 0 3px rgba(106, 130, 251, 0.2);
    outline: none;
    background-color: #ffffff;
  }

  /* Submit Button */
  .auth-submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(to right, #ff105f, #ffad06);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    margin: auto 10px;
  }

  .auth-submit-btn:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  .auth-submit-btn:disabled {
    background: linear-gradient(to right, #ff105f, #ffad06);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  /* Error Message */
  .error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 10px;
    text-align: center;
  }

  /* Responsive Adjustments */
  @media (max-width: 480px) {
    .auth-card {
      padding: 20px;
    }

    .auth-toggle-buttons {
      max-width: 240px;
      margin-bottom: 25px;
    }

    .auth-toggle-btn {
      font-size: 1em;
      padding: 10px 0;
    }

    .auth-form-group {
      padding: 0 20px;
      gap: 15px;
      top: 120px;
    }

    .form-title {
      font-size: 1.8em;
      margin-bottom: 5px;
    }

    .auth-input-field {
      padding: 10px 12px;
      font-size: 0.95em;
    }

    .auth-submit-btn {
      padding: 12px;
      font-size: 1em;
    }
  }
</style>
