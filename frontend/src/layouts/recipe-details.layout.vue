<template>
  <div class="recipe-container">
    <AppHeader />
    <div class="recipe-detail-page-wrapper">
      <div v-if="loading" class="loading-state">
        <p>Carregando detalhes da receita...</p>
      </div>
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <router-link :to="{ name: 'RecipeList' }" class="back-button"
          >Voltar para a Lista</router-link
        >
      </div>
      <RecipeDetailCardComponent
        v-else-if="recipe"
        :recipe="recipe"
        :formattedCategories="formattedCategories"
        @delete-requested="confirmDelete"
      />
      <div v-else class="loading-state">
        <p>Receita não encontrada.</p>
        <router-link :to="{ name: 'RecipeList' }" class="back-button"
          >Voltar para a Lista</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useRecipeStore } from '../stores/recipes.store.js';
  import AppHeader from '../components/app-header.component.vue';
  import RecipeDetailCardComponent from '../components/recipe-detail-card.component.vue';

  const route = useRoute();
  const router = useRouter();
  const recipeStore = useRecipeStore();

  const recipeId = computed(() => route.params.id);

  const formattedCategories = ref({});
  watch(
    () => recipeStore.allCategories,
    (categories) => {
      formattedCategories.value = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.nome;
        return acc;
      }, {});
    },
    { immediate: true }
  );

  const loading = computed(() => recipeStore.loading);
  const error = computed(() => recipeStore.error);

  const recipe = computed(() => {
    return recipeStore.getRecipeById(recipeId.value);
  });

  const confirmDelete = async () => {
    if (!recipe.value) return;

    if (
      confirm(
        `Tem certeza que deseja deletar a receita "${recipe.value.nome}"? Esta ação é irreversível.`
      )
    ) {
      try {
        await recipeStore.deleteRecipe(recipeId.value);
        await router.push({ name: 'RecipeList' });
      } catch (err) {
        console.error('Erro ao deletar receita:', err);
      }
    }
  };

  watch(
    recipeId,
    (newId) => {
      if (newId) {
        if (!recipeStore.allRecipes.length) {
          recipeStore.fetchAllRecipes();
        }
        if (!recipeStore.allCategories.length) {
          recipeStore.fetchAllCategories();
        }
      }
    },
    { immediate: true }
  );
</script>

<style scoped>
  .recipe-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    background-color: #f8f8f8;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .recipe-detail-page-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: #f8f8f8;
    box-sizing: border-box;
    width: 100%; /* Garante que o wrapper ocupe a largura total do pai */
  }

  .loading-state,
  .error-message {
    text-align: center;
    font-size: 1.2em;
    color: #777;
    padding: 50px;
    width: 100%;
  }

  .error-message {
    color: #dc3545;
    font-weight: bold;
  }

  .back-button {
    background: linear-gradient(to right, #ff105f, #ffad06);
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 8px 15px;
    text-decoration: none;
    font-size: 0.9em;
    font-weight: bold;
    transition: opacity 0.3s ease;
    display: inline-block; /* Para que o botão não ocupe a largura total */
    margin-top: 20px; /* Espaçamento caso esteja sozinho */
  }

  .back-button:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .recipe-detail-page-wrapper {
      padding: 30px 15px;
    }
    .back-button {
      padding: 6px 12px;
      font-size: 0.8em;
    }
  }

  @media (max-width: 480px) {
    .recipe-detail-page-wrapper {
      padding: 20px 10px;
    }
  }
</style>
