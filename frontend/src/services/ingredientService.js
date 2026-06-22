import axiosInstance from './axiosConfig';

class IngredientService {
  getIngredients(page = 1, limit = 10, status = '') {
    return axiosInstance.get('/ingredients', {
      params: { page, limit, status }
    });
  }

  searchIngredients(query, page = 1, limit = 10) {
    return axiosInstance.get('/ingredients/search', {
      params: { q: query, page, limit }
    });
  }

  getIngredientById(id) {
    return axiosInstance.get(`/ingredients/${id}`);
  }

  createIngredient(data) {
    return axiosInstance.post('/ingredients', data);
  }

  updateIngredient(id, data) {
    return axiosInstance.put(`/ingredients/${id}`, data);
  }

  deleteIngredient(id) {
    return axiosInstance.delete(`/ingredients/${id}`);
  }
}

export default new IngredientService();
