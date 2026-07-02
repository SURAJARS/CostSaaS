import axiosConfig from './axiosConfig';

const API_URL = '/combos';

const comboService = {
  getCombos: async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return axiosConfig.get(`${API_URL}?${params.toString()}`);
  },

  getComboById: async (id) => {
    return axiosConfig.get(`${API_URL}/${id}`);
  },

  createCombo: async (data) => {
    return axiosConfig.post(API_URL, data);
  },

  updateCombo: async (id, data) => {
    return axiosConfig.put(`${API_URL}/${id}`, data);
  },

  deleteCombo: async (id) => {
    return axiosConfig.delete(`${API_URL}/${id}`);
  },

  searchCombos: async (searchText, page = 1, limit = 10) => {
    return axiosConfig.get(`${API_URL}/search?q=${searchText}&page=${page}&limit=${limit}`);
  },

  getActiveCombos: async () => {
    return axiosConfig.get(`${API_URL}/active`);
  }
};

export default comboService;
