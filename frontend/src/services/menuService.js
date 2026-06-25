import axiosInstance from './axiosConfig';

class MenuService {
  getMenus(page = 1, limit = 10, category = '', status = '') {
    return axiosInstance.get('/menus', {
      params: { page, limit, category, status }
    });
  }

  searchMenus(query, page = 1, limit = 10) {
    return axiosInstance.get('/menus/search', {
      params: { q: query, page, limit }
    });
  }

  getMenuById(id) {
    return axiosInstance.get(`/menus/${id}`);
  }

  createMenu(data) {
    return axiosInstance.post('/menus', data);
  }

  updateMenu(id, data) {
    return axiosInstance.put(`/menus/${id}`, data);
  }

  deleteMenu(id) {
    return axiosInstance.delete(`/menus/${id}`);
  }
}

const menuService = new MenuService();
export default menuService;
