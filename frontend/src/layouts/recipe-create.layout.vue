<template>
  <div class="recipe-container">
    <AppHeader />
    <div class="create-recipe-page-wrapper">
      <RecipeForm
        :initialRecipeData="newRecipe"
        :loading="loading"
        :formError="error"
        :categories="formattedCategories"
        submitButtonText="Adicionar Receita"
        formTitle="Criar Nova Receita"
        :backLinkTo="{ name: 'RecipeList' }"
        backLinkText="&larr; Voltar para a Lista"
        @submit-form="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useRecipeStore } from '../stores/recipes.store.js';
  import RecipeForm from '../components/recipe-form.component.vue';
  import AppHeader from '../components/app-header.component.vue';

  const recipeStore = useRecipeStore();
  const router = useRouter();

  const newRecipe = ref({
    nome: '',
    tempo_preparo_minutos: null,
    porcoes: null,
    id_categorias: null,
    ingredientes: '',
    modo_preparo: '',
  });

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

  const handleSubmit = async (formData) => {
    if (!formData.nome || !formData.modo_preparo) {
      recipeStore.error = 'Nome da receita e modo de preparo são obrigatórios!';
      return;
    }

    try {
      const recipeToCreate = {
        ...formData,
        id_usuarios: 1001,
      };

      const addedRecipe = await recipeStore.addRecipe(recipeToCreate);

      if (addedRecipe) {
        await router.push({ name: 'RecipeDetails', params: { id: addedRecipe.id } });
      }
    } catch (err) {
      console.error('Erro ao adicionar receita no componente:', err);
    }
  };

  onMounted(() => {
    if (Object.keys(recipeStore.allCategories).length === 0) {
      recipeStore.fetchAllCategories();
    }
  });
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
    width: 100%;
  }

  .create-recipe-page-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: #f8f8f8;
    box-sizing: border-box;
    width: 100%;
  }
</style>
