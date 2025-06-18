<template>
  <div class="recipe-container">
    <AppHeader />
    <div class="edit-recipe-page-wrapper">
      <div v-if="loading" class="loading-state">
        <p>Carregando receita para edição...</p>
      </div>
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <router-link :to="{ name: 'RecipeList' }" class="back-button"
          >Voltar para a Lista</router-link
        >
      </div>
      <RecipeForm
        v-else-if="recipe"
        :initialRecipeData="localRecipe"
        :loading="loading"
        :formError="error"
        :categories="formattedCategories"
        submitButtonText="Salvar Alterações"
        formTitle="Editar Receita"
        :backLinkTo="{ name: 'RecipeDetails', params: { id: recipe.id } }"
        backLinkText="&larr; Voltar para a Receita"
        @submit-form="handleSubmit"
      />
      <div v-else class="loading-state">
        <p>Receita não encontrada para edição.</p>
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
  import RecipeForm from '../components/recipe-form.component.vue';
  import AppHeader from '../components/app-header.component.vue';

  const route = useRoute();
  const router = useRouter();
  const recipeStore = useRecipeStore();

  const recipeId = computed(() => route.params.id);

  const localRecipe = ref(null);
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

  const loadRecipeForEditing = async () => {
    if (!recipeStore.allRecipes.length && !loading.value) {
      await recipeStore.fetchAllRecipes();
    }

    if (!recipeStore.allCategories.length && !loading.value) {
      await recipeStore.fetchAllCategories();
    }

    if (recipe.value) {
      localRecipe.value = { ...recipe.value };
    } else {
      localRecipe.value = null;
    }
  };

  const handleSubmit = async (formData) => {
    if (!formData || !formData.nome || !formData.modo_preparo) {
      recipeStore.error = 'Nome da receita e modo de preparo são obrigatórios!';
      return;
    }

    try {
      await recipeStore.updateRecipe(formData);
      await router.push({ name: 'RecipeDetails', params: { id: formData.id } });
    } catch (err) {
      console.error('Erro ao atualizar receita no componente:', err);
    }
  };

  watch(
    recipeId,
    (newId) => {
      if (newId) {
        loadRecipeForEditing();
      }
    },
    { immediate: true }
  );

  watch(
    recipe,
    (newRecipeValue) => {
      if (newRecipeValue) {
        localRecipe.value = { ...newRecipeValue };
      } else {
        localRecipe.value = null;
      }
    },
    { deep: true, immediate: true }
  );
</script>

<style scoped>
  .recipe-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    background-color: #f8f8f8;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .edit-recipe-page-wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: #f8f8f8;
    box-sizing: border-box;
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
    position: absolute;
    top: 20px;
    left: 20px;
    background: linear-gradient(to right, #ff105f, #ffad06);
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 8px 15px;
    text-decoration: none;
    font-size: 0.9em;
    font-weight: bold;
    transition: opacity 0.3s ease;
  }

  .back-button:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .edit-recipe-page-wrapper {
      padding: 30px 15px;
    }
    .back-button {
      top: 15px;
      left: 15px;
      padding: 6px 12px;
      font-size: 0.8em;
    }
  }

  @media (max-width: 480px) {
    .edit-recipe-page-wrapper {
      padding: 20px 10px;
    }
  }
</style>
