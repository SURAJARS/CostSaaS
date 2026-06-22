import axiosInstance from './axiosConfig';

class EstimationService {
  getEstimations(page = 1, limit = 10, status = '') {
    return axiosInstance.get('/estimations', {
      params: { page, limit, status }
    });
  }

  getEstimationById(id) {
    return axiosInstance.get(`/estimations/${id}`);
  }

  createEstimation(data) {
    return axiosInstance.post('/estimations', data);
  }

  updateEstimation(id, data) {
    return axiosInstance.put(`/estimations/${id}`, data);
  }

  deleteEstimation(id) {
    return axiosInstance.delete(`/estimations/${id}`);
  }

  exportToExcel(id) {
    return axiosInstance.get(`/estimations/${id}/export/excel`, {
      responseType: 'blob'
    });
  }

  exportToPdf(id) {
    return axiosInstance.get(`/estimations/${id}/export/pdf`, {
      responseType: 'blob'
    });
  }

  getReportsByDateRange(startDate, endDate, page = 1, limit = 10) {
    return axiosInstance.get('/estimations/report/date-range', {
      params: { startDate, endDate, page, limit }
    });
  }

  getReportsByCustomer(customerName, page = 1, limit = 10) {
    return axiosInstance.get('/estimations/report/customer', {
      params: { customerName, page, limit }
    });
  }
}

export default new EstimationService();
