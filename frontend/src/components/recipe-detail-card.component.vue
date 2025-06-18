<template>
  <div class="recipe-detail-card">
    <router-link :to="{ name: 'RecipeList' }" class="back-button"
      >&larr; Voltar para a Lista</router-link
    >

    <div class="actions-header">
      <h1>{{ recipe.nome }}</h1>
      <div class="header-buttons">
        <router-link :to="{ name: 'UpdateRecipe', params: { id: recipe.id } }" class="edit-button">
          ✏️ Editar Receita
        </router-link>
        <button @click="emit('delete-requested')" class="delete-button">🗑️ Deletar Receita</button>
        <button @click="printRecipe" class="edit-button">🖨️ Imprimir Receita</button>
      </div>
    </div>

    <div class="meta-info">
      <p v-if="recipe.tempo_preparo_minutos">
        ⏰ **Tempo de Preparo:** {{ recipe.tempo_preparo_minutos }} minutos
      </p>
      <p v-if="recipe.porcoes">🍽️ **Porções:** {{ recipe.porcoes }}</p>
      <p v-if="recipe.id_categorias">**Categoria:** {{ getCategoryName(recipe.id_categorias) }}</p>
    </div>

    <div class="section">
      <h2>Ingredientes:</h2>
      <ul>
        <li v-for="(ingredient, index) in parseIngredients(recipe.ingredientes)" :key="index">
          {{ ingredient }}
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>Modo de Preparo:</h2>
      <p class="preparation-mode">{{ recipe.modo_preparo }}</p>
    </div>

    <div class="timestamp">
      <p>Criado em: {{ formatDate(recipe.criado_em) }}</p>
      <p v-if="recipe.criado_em !== recipe.alterado_em">
        Última atualização: {{ formatDate(recipe.alterado_em) }}
      </p>
    </div>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue';

  const props = defineProps({
    recipe: {
      type: Object,
      required: true,
    },
    formattedCategories: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['delete-requested']);

  const parseIngredients = (ingredientsString) => {
    return ingredientsString
      ? ingredientsString.split(';').filter((item) => item.trim() !== '')
      : [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getCategoryName = (categoryId) => {
    return props.formattedCategories[categoryId] || 'Não Categorizado';
  };

  const printRecipe = () => {
    window.print();
  };
</script>

<style scoped>
  .recipe-detail-card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    padding: 40px;
    max-width: 800px;
    width: 100%;
    text-align: left;
    position: relative;
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

  .actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #ff105f;
    padding-bottom: 15px;
    margin-top: 30px;
    flex-wrap: wrap;
  }

  .actions-header h1 {
    margin: 20px 0;
    border-bottom: none;
    padding-bottom: 0;
    text-align: left;
  }

  .header-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .edit-button,
  .delete-button {
    border: none;
    border-radius: 25px;
    padding: 10px 20px;
    text-decoration: none;
    font-size: 1em;
    font-weight: bold;
    transition: opacity 0.3s ease;
    white-space: nowrap;
    cursor: pointer;
  }

  .edit-button {
    background: linear-gradient(to right, #ffad06, #ff105f);
    color: #fff;
  }

  .delete-button {
    background: #dc3545;
    color: #fff;
  }

  .edit-button:hover,
  .delete-button:hover {
    opacity: 0.9;
  }

  h1 {
    font-family: sans-serif;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
    font-size: 2.8em;
    border-bottom: 2px solid #ff105f;
    padding-bottom: 15px;
    margin-top: 30px;
  }

  .meta-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .meta-info p {
    color: #555;
    font-size: 1.1em;
    font-weight: 500;
  }

  .section {
    margin-bottom: 30px;
  }

  .section h2 {
    color: #ffad06;
    font-size: 1.8em;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }

  .section ul {
    list-style: disc inside;
    margin-left: 0;
    padding-left: 0;
    color: #555;
    font-size: 1.1em;
    line-height: 1.8;
  }

  .section ul li {
    margin-bottom: 5px;
  }

  .preparation-mode {
    white-space: pre-wrap;
    line-height: 1.7;
    color: #444;
    font-size: 1.1em;
  }

  .timestamp {
    border-top: 1px solid #eee;
    padding-top: 20px;
    margin-top: 30px;
    font-size: 0.9em;
    color: #777;
    text-align: right;
  }

  @media (max-width: 768px) {
    .recipe-detail-card {
      padding: 30px 20px;
    }

    h1 {
      font-size: 2.2em;
    }

    .meta-info {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .meta-info p,
    .section ul li,
    .preparation-mode {
      font-size: 1em;
    }

    .section h2 {
      font-size: 1.5em;
    }

    .back-button {
      top: 15px;
      left: 15px;
      padding: 6px 12px;
      font-size: 0.8em;
    }

    .actions-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
    .actions-header h1 {
      font-size: 2.2em;
      width: 100%;
    }
    .header-buttons {
      flex-direction: column;
      width: 100%;
      gap: 10px;
    }
    .edit-button,
    .delete-button {
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .recipe-detail-card {
      padding: 20px 15px;
    }

    h1 {
      font-size: 1.8em;
      margin-top: 20px;
      padding-bottom: 10px;
    }

    .meta-info {
      margin-bottom: 20px;
    }

    .section {
      margin-bottom: 20px;
    }

    .section h2 {
      font-size: 1.3em;
      margin-bottom: 10px;
    }

    .timestamp {
      padding-top: 15px;
      margin-top: 20px;
      font-size: 0.8em;
    }
  }

  @media print {
    .edit-button {
      display: none;
    }
    .delete-button {
      display: none;
    }
    .back-button {
      display: none;
    }
  }
</style>
