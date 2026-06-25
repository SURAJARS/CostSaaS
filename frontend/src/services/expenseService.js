import axiosConfig from './axiosConfig';

const API_URL = '/expenses';

const expenseService = {
  getExpenses: (page = 1, limit = 100) => {
    return axiosConfig.get(`${API_URL}?page=${page}&limit=${limit}`);
  },

  getExpenseById: (id) => {
    return axiosConfig.get(`${API_URL}/${id}`);
  },

  createExpense: (data) => {
    return axiosConfig.post(API_URL, data);
  },

  updateExpense: (id, data) => {
    return axiosConfig.put(`${API_URL}/${id}`, data);
  },

  deleteExpense: (id) => {
    return axiosConfig.delete(`${API_URL}/${id}`);
  }
};

export default expenseService;
