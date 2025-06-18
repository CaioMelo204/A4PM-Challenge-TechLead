<template>
  <div class="recipe-form-card">
    <router-link v-if="backLinkTo" :to="backLinkTo" class="back-button">
      {{ backLinkText }}
    </router-link>

    <h1 class="form-title">{{ formTitle }}</h1>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="nome">Nome da Receita:</label>
        <input type="text" id="nome" v-model="localRecipe.nome" required class="input-field" />
      </div>

      <div class="form-group half-width">
        <label for="tempo_preparo_minutos">Tempo de Preparo (minutos):</label>
        <input
          type="number"
          id="tempo_preparo_minutos"
          v-model.number="localRecipe.tempo_preparo_minutos"
          class="input-field"
        />
      </div>

      <div class="form-group half-width">
        <label for="porcoes">Porções:</label>
        <input
          type="number"
          id="porcoes"
          v-model.number="localRecipe.porcoes"
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label for="id_categorias">Categoria:</label>
        <select id="id_categorias" v-model.number="localRecipe.id_categorias" class="input-field">
          <option :value="null">Selecione uma categoria</option>
          <option v-for="(name, id) in categories" :key="id" :value="Number(id)">
            {{ name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="ingredientes">Ingredientes (separe por ponto e vírgula ';'):</label>
        <textarea
          id="ingredientes"
          v-model="localRecipe.ingredientes"
          rows="5"
          class="input-field"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="modo_preparo">Modo de Preparo:</label>
        <textarea
          id="modo_preparo"
          v-model="localRecipe.modo_preparo"
          rows="10"
          required
          class="input-field"
        ></textarea>
      </div>

      <!-- Exibe o erro passado via prop -->
      <p v-if="formError" class="error-message">{{ formError }}</p>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Processando...' : submitButtonText }}
      </button>
    </form>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    initialRecipeData: {
      type: Object,
      default: () => ({
        nome: '',
        tempo_preparo_minutos: null,
        porcoes: null,
        id_categorias: null,
        ingredientes: '',
        modo_preparo: '',
      }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    formError: {
      type: String,
      default: null,
    },
    categories: {
      type: Object,
      required: true,
    },
    submitButtonText: {
      type: String,
      default: 'Salvar',
    },
    formTitle: {
      type: String,
      default: 'Formulário de Receita',
    },
    backLinkTo: {
      type: Object,
      default: null,
    },
    backLinkText: {
      type: String,
      default: 'Voltar',
    },
  });

  const emit = defineEmits(['submit-form']);

  const localRecipe = ref({ ...props.initialRecipeData });

  watch(
    () => props.initialRecipeData,
    (newData) => {
      if (newData) {
        localRecipe.value = { ...newData };
      } else {
        localRecipe.value = {
          nome: '',
          tempo_preparo_minutos: null,
          porcoes: null,
          id_categorias: null,
          ingredientes: '',
          modo_preparo: '',
        };
      }
    },
    { deep: true, immediate: true }
  );

  const handleSubmit = () => {
    if (!localRecipe.value.nome || !localRecipe.value.modo_preparo) {
      return;
    }
    emit('submit-form', localRecipe.value);
  };
</script>

<style scoped>
  .recipe-form-card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    padding: 40px;
    max-width: 900px;
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

  .form-title {
    font-family: sans-serif;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
    font-size: 2.8em;
    border-bottom: 2px solid #ff105f;
    padding-bottom: 15px;
    margin-top: 30px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 1.1em;
    color: #555;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .input-field {
    width: calc(100% - 20px);
    padding: 12px 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1em;
    box-sizing: border-box;
    background-color: #fefefe;
    color: #333;
  }

  .input-field:focus {
    outline: none;
    border-color: #ffad06;
    box-shadow: 0 0 5px rgba(255, 173, 6, 0.5);
  }

  textarea.input-field {
    resize: vertical;
    min-height: 80px;
  }

  .form-group.half-width {
    display: inline-block;
    width: calc(50% - 15px);
    vertical-align: top;
  }

  .form-group.half-width:first-of-type {
    margin-right: 30px;
  }

  .submit-btn {
    background: linear-gradient(to right, #ff105f, #ffad06);
    color: #fff;
    border: none;
    border-radius: 30px;
    padding: 15px 30px;
    margin-top: 30px;
    cursor: pointer;
    font-size: 1.2em;
    font-weight: bold;
    transition: opacity 0.3s ease;
    display: block;
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error-message {
    color: #e74c3c;
    font-size: 0.9em;
    margin-top: 10px;
    text-align: center;
  }

  @media (max-width: 768px) {
    .recipe-form-card {
      padding: 30px 20px;
      width: 95%;
    }

    .form-title {
      font-size: 2.2em;
    }

    .form-group.half-width {
      width: 100%;
      margin-right: 0;
      display: block;
    }

    .input-field {
      width: 100%;
    }

    .submit-btn {
      padding: 12px 20px;
      font-size: 1.1em;
    }

    .back-button {
      top: 15px;
      left: 15px;
      padding: 6px 12px;
      font-size: 0.8em;
    }
  }

  @media (max-width: 480px) {
    .recipe-form-card {
      padding: 20px 15px;
      width: 100%;
    }

    .form-title {
      font-size: 1.8em;
      margin-top: 20px;
      padding-bottom: 10px;
    }

    .form-group label {
      font-size: 1em;
    }

    .input-field {
      padding: 10px;
      font-size: 0.95em;
    }

    textarea.input-field {
      min-height: 60px;
    }
  }
</style>
