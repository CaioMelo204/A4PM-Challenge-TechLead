import api from '../api/base.api.js';

const categoryService = {
  async getAll() {
    const { data } = await api.get(`/category`);
    return data.data;
  },
};

export default categoryService;
