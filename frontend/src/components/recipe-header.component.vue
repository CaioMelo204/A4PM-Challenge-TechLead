<template>
  <div class="recipe-controls-container">
    <div class="search-sort-section">
      <div class="search-inputs">
        <input
          type="text"
          v-model="searchFilters.nome"
          placeholder="Buscar por nome..."
          class="search-input"
        />
        <input
          type="text"
          v-model="searchFilters.ingredientes"
          placeholder="Buscar por ingrediente..."
          class="search-input"
        />
        <input
          type="number"
          v-model.number="searchFilters.porcoes"
          placeholder="Porções (ex: 4)"
          class="search-input"
        />
        <select v-model.number="searchFilters.id_categorias" class="search-input">
          <option :value="null">Todas as Categorias</option>
          <option v-for="(name, id) in categories" :key="id" :value="Number(id)">{{ name }}</option>
        </select>
      </div>
      <div class="sort-controls">
        <label for="sortByDate">Ordenar por Data de Criação:</label>
        <select id="sortByDate" v-model="sortBy" class="sort-select">
          <option value="desc">Mais Recente</option>
          <option value="asc">Mais Antiga</option>
        </select>
      </div>
      <button @click="applyFilters" class="apply-filters-button">Aplicar Filtros</button>
    </div>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits, ref, watch } from 'vue';

  const props = defineProps({
    initialSearchFilters: {
      type: Object,
      default: () => ({
        nome: '',
        ingredientes: '',
        porcoes: null,
        id_categorias: null,
      }),
    },
    initialSortBy: {
      type: String,
      default: 'desc',
    },
    categories: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['apply:filters']);

  const searchFilters = ref({ ...props.initialSearchFilters });
  const sortBy = ref(props.initialSortBy);

  const applyFilters = () => {
    emit('apply:filters', {
      filters: searchFilters.value,
      sortBy: sortBy.value,
    });
  };

  watch(
    () => props.initialSearchFilters,
    (newFilters) => {
      searchFilters.value = { ...newFilters };
    },
    { deep: true }
  );

  watch(
    () => props.initialSortBy,
    (newSortBy) => {
      sortBy.value = newSortBy;
    }
  );
</script>

<style scoped>
  .recipe-controls-container {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .header-section h2 {
    margin: 0;
    color: #333;
  }

  .search-sort-section {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: flex-end;
  }

  .search-inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    flex-grow: 1;
  }

  .search-input {
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
    min-width: 150px;
    flex-grow: 1;
  }

  .search-input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    outline: none;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sort-controls label {
    font-weight: bold;
    color: #555;
    white-space: nowrap;
  }

  .sort-select {
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
    background-color: white;
    cursor: pointer;
  }

  .sort-select:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    outline: none;
  }

  .apply-filters-button {
    background: linear-gradient(to right, #ffad06, #ff105f);
    color: #fff;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
    margin-top: 1rem; /* Add some spacing */
  }

  .apply-filters-button:hover {
    background-color: #0056b3;
  }

  @media (max-width: 768px) {
    .search-sort-section {
      flex-direction: column;
      align-items: stretch;
    }

    .search-inputs {
      flex-direction: column;
    }

    .search-input,
    .sort-select,
    .apply-filters-button {
      width: 100%;
    }
  }
</style>
