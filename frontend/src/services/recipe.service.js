import api from '../api/base.api.js';

const recipeService = {
  async search(params) {
    const { data } = await api.get(`/recipe`, {
      params: {
        nome: params.nome,
        ingredientes: params.ingredientes,
        porcoes: params.porcoes,
        id_categorias: params.id_categorias,
        order: params.sort,
        limit: params.limit,
        page: params.page,
      },
    });
    return {
      recipes: data.data,
      pagination: data.metadata.pagination,
    };
  },
  async getAll(params) {
    const { data } = await api.get(`/recipe`, {
      params: {
        ...params,
      },
    });
    return {
      recipes: data.data,
      pagination: data.metadata.pagination,
    };
  },
  async create(recipe) {
    const { data } = await api.post(`/recipe`, {
      ...recipe,
    });
    return data.data;
  },
  async update(id, recipe) {
    const { data } = await api.patch(`/recipe/${id}`, {
      ...recipe,
    });
    return data.data;
  },
  async remove(id) {
    await api.delete(`/recipe/${id}`);
  },
};

export default recipeService;
