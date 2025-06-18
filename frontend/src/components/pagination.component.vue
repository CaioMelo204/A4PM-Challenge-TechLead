<template>
  <div class="pagination-container">
    <button
      class="pagination-button"
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      Anterior
    </button>
    <button
      v-for="page in displayedPages"
      :key="page"
      class="pagination-button"
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    <button
      class="pagination-button"
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      Próxima
    </button>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    pageRange: {
      type: Number,
      default: 5,
    },
  });

  const emit = defineEmits(['page-change']);

  const displayedPages = computed(() => {
    const pages = [];
    const startPage = Math.max(1, props.currentPage - Math.floor(props.pageRange / 2));
    const endPage = Math.min(props.totalPages, startPage + props.pageRange - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= props.totalPages) {
      emit('page-change', page);
    }
  };
</script>

<style scoped>
  .pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pagination-button {
    background-color: #fff;
    color: #ff105f;
    border: 2px solid #ff105f;
    border-radius: 8px;
    padding: 10px 15px;
    font-size: 1em;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease;
    min-width: 40px;
    text-align: center;
  }

  .pagination-button:hover:not(:disabled) {
    background-color: #ff105f;
    color: #fff;
  }

  .pagination-button.active {
    background-color: #ff105f;
    color: #fff;
    border-color: #ff105f;
    font-weight: bold;
  }

  .pagination-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f0f0f0;
    border-color: #ccc;
    color: #999;
  }

  @media (max-width: 768px) {
    .pagination-button {
      padding: 8px 12px;
      font-size: 0.9em;
      min-width: 35px;
    }
    .pagination-container {
      gap: 8px;
    }
  }

  @media (max-width: 480px) {
    .pagination-container {
      padding: 0 10px;
      justify-content: space-around;
    }
    .pagination-button {
      flex-grow: 1;
      margin: 5px;
    }
  }
</style>
