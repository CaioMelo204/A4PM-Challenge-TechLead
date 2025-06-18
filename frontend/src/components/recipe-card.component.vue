<template>
  <div class="recipe-grid">
    <div v-if="loading" class="loading-state">
      <p>Carregando receitas...</p>
    </div>
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="allRecipes.length === 0" class="no-recipes">
      <p>Nenhuma receita encontrada com os filtros e ordenação aplicados.</p>
      <p v-if="!totalItems">Adicione novas receitas para vê-las aqui!</p>
    </div>
    <router-link
      v-else
      v-for="recipe in allRecipes"
      :key="recipe.id"
      :to="{ name: 'RecipeDetails', params: { id: recipe.id } }"
      class="recipe-card-link"
    >
      <div class="recipe-card">
        <h3>{{ recipe.nome }}</h3>
        <p v-if="recipe.tempo_preparo_minutos">⏰ {{ recipe.tempo_preparo_minutos }} min</p>
        <p v-if="recipe.porcoes">🍽️ {{ recipe.porcoes }} porções</p>
      </div>
    </router-link>
  </div>
</template>

<script setup>
  import { defineProps } from 'vue';

  const props = defineProps({
    allRecipes: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
    totalItems: {
      type: Number,
      required: true,
    },
  });
</script>

<style scoped>
  .recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    width: 100%;
    max-width: 1200px;
  }

  .no-recipes {
    width: 100%;
    text-align: center;
    padding: 50px;
    font-size: 1.2em;
    color: #777;
  }

  .loading-state,
  .error-message {
    width: 100%;
    text-align: center;
    padding: 50px;
    font-size: 1.2em;
    color: #777;
  }

  .error-message {
    color: #dc3545;
    font-weight: bold;
  }

  .recipe-card-link {
    text-decoration: none;
    color: inherit;
  }

  .recipe-card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    padding: 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: left;
    transition: transform 0.3s ease;
    overflow: hidden;
  }

  .recipe-card:hover {
    transform: translateY(-5px);
  }

  .recipe-card h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.8em;
    font-weight: bold;
  }

  .recipe-card p {
    color: #666;
    font-size: 0.95em;
    margin-bottom: 5px;
  }

  @media (max-width: 768px) {
    .recipe-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .recipe-card {
      padding: 20px;
    }
  }

  @media (max-width: 480px) {
    .recipe-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }
    .recipe-card {
      padding: 15px;
    }
  }
</style>
