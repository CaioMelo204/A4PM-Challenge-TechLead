<template>
  <div class="recipe-container">
    <AppHeader />
    <div class="header-section">
      <h2>Lista de Receitas</h2>
      <router-link :to="{ name: 'CreateRecipe' }" class="create-recipe-button">
        + Nova Receita
      </router-link>
    </div>
    <div class="search-sort-section">
      <RecipeHeaderComponent
        :initial-search-filters="currentFilters"
        :initial-sort-by="currentSortBy"
        :categories="formattedCategories"
        @apply:filters="
          ({ filters, sortBy }) => {
            currentFilters = filters;
            currentSortBy = sortBy;
            applyFiltersAndSort();
          }
        "
      />
    </div>

    <RecipeGrid
      :allRecipes="allRecipes"
      :loading="loading"
      :error="error"
      :totalItems="totalItems"
    />

    <PaginationComponent
      :currentPage="currentPage"
      :totalPages="totalPages"
      :pageRange="5"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRecipeStore } from '../stores/recipes.store.js';
  import RecipeHeaderComponent from '../components/recipe-header.component.vue';
  import PaginationComponent from '../components/pagination.component.vue';
  import RecipeGrid from '../components/recipe-card.component.vue';
  import AppHeader from '../components/app-header.component.vue';

  const recipeStore = useRecipeStore();

  const currentFilters = ref({
    nome: recipeStore.searchQuery,
    ingredientes: '',
    porcoes: null,
    id_categorias: recipeStore.selectedCategory,
  });

  const currentSortBy = ref(recipeStore.sortBy);

  const allRecipes = computed(() => recipeStore.allRecipes);
  const loading = computed(() => recipeStore.loading);
  const error = computed(() => recipeStore.error);
  const currentPage = computed(() => recipeStore.currentPage);
  const totalPages = computed(() => recipeStore.totalPages);
  const totalItems = computed(() => recipeStore.totalItems);

  const applyFiltersAndSort = () => {
    recipeStore.setSearchQuery(currentFilters.value.nome);
    recipeStore.setSelectedCategory(currentFilters.value.id_categorias);
    recipeStore.setSortBy(currentSortBy.value);

    recipeStore.searchRecipes({
      query: currentFilters.value.nome,
      ingredientes: currentFilters.value.ingredientes,
      porcoes: currentFilters.value.porcoes,
      category: currentFilters.value.id_categorias,
      page: recipeStore.currentPage,
      order: currentSortBy.value,
    });
  };

  const handlePageChange = (newPage) => {
    recipeStore.setCurrentPage(newPage);
    applyFiltersAndSort();
  };

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

  watch(
    () => recipeStore.searchRecipes(),
    (newVal) => {
      currentFilters.value.nome = newVal;
    }
  );
  watch(
    () => recipeStore.selectedCategory,
    (newVal) => {
      currentFilters.value.id_categorias = newVal;
    }
  );
  watch(
    () => recipeStore.sortBy,
    (newVal) => {
      currentSortBy.value = newVal;
    }
  );

  onMounted(async () => {
    applyFiltersAndSort();
    await recipeStore.fetchAllRecipes();
    await recipeStore.fetchAllCategories();
  });
</script>

<style scoped>
  .recipe-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f8f8f8;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    margin: 30px 0;
    flex-wrap: wrap;
  }

  h2 {
    font-family: sans-serif;
    color: #ff105f;
    font-size: 2.5em;
    text-align: center;
    margin: 0;
  }

  .create-recipe-button {
    background: linear-gradient(to right, #ffad06, #ff105f);
    color: #fff;
    border: none;
    border-radius: 25px;
    padding: 12px 25px;
    text-decoration: none;
    font-size: 1.1em;
    font-weight: bold;
    transition: opacity 0.3s ease;
    white-space: nowrap;
  }

  .create-recipe-button:hover {
    opacity: 0.9;
  }

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

  @media (max-width: 1024px) {
    .search-sort-section {
      flex-direction: column;
      align-items: stretch;
    }
    .sort-controls {
      justify-content: flex-start;
    }
  }

  @media (max-width: 768px) {
    .header-section {
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }
    h2 {
      margin-bottom: 0;
    }
    .recipe-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .recipe-card {
      padding: 20px;
    }

    h2 {
      font-size: 2em;
    }
    .search-sort-section {
      padding: 15px;
      gap: 15px;
    }
    .search-input,
    .sort-select {
      padding: 8px 12px;
      font-size: 0.95em;
    }
    .sort-controls label {
      font-size: 0.95em;
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
    h2 {
      font-size: 1.8em;
    }
    .create-recipe-button {
      padding: 10px 20px;
      font-size: 1em;
    }
    .search-inputs {
      flex-direction: column;
    }
    .search-input {
      flex: none;
      width: 100%;
    }
  }
</style>
