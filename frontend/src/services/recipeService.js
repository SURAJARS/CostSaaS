import axiosInstance from './axiosConfig';

class RecipeService {
  getRecipes(page = 1, limit = 10, status = '') {
    return axiosInstance.get('/recipes', {
      params: { page, limit, status }
    });
  }

  getRecipeById(id) {
    return axiosInstance.get(`/recipes/${id}`);
  }

  getRecipeByMenuId(menuId) {
    return axiosInstance.get(`/recipes/menu/${menuId}`);
  }

  createRecipe(data) {
    return axiosInstance.post('/recipes', data);
  }

  updateRecipe(id, data) {
    return axiosInstance.put(`/recipes/${id}`, data);
  }

  deleteRecipe(id) {
    return axiosInstance.delete(`/recipes/${id}`);
  }
}

export default new RecipeService();
