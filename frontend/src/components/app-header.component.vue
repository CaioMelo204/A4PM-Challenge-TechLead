<template>
  <header class="app-header-container">
    <div class="header-content">
      <h1 class="app-title">Seu App de Receitas</h1>
      <button @click="handleLogout" class="logout-button">Sair</button>
    </div>
  </header>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth.store.js';

  const authStore = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await authStore.logout();
  };
</script>

<style scoped>
  .app-header-container {
    background: linear-gradient(to right, #ff105f, #ffad06);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .header-content {
    width: 100%;
    display: flex;
    padding: 15px 30px;
    justify-content: space-between;
    align-items: center;
  }

  .app-title {
    color: #ffffff;
    font-size: 1.8em;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
  }

  .logout-button {
    background-color: #ffffff;
    color: #fc5c7d;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .logout-button:hover {
    background-color: #f0f0f0;
    color: #6a82fb;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .app-header-container {
      padding: 10px 20px;
    }
    .app-title {
      font-size: 1.5em;
    }
    .logout-button {
      padding: 8px 15px;
      font-size: 0.9em;
    }
  }

  @media (max-width: 480px) {
    .header-content {
      flex-direction: column;
      gap: 10px;
    }
    .app-title {
      font-size: 1.3em;
    }
    .logout-button {
      width: 100%;
      max-width: 150px;
    }
  }
</style>
