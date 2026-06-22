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
    }).then(response => response.data).catch(error => {
      console.error('Excel export error:', error);
      throw new Error(error.response?.statusText || 'Failed to export Excel');
    });
  }

  exportToPdf(id) {
    return axiosInstance.get(`/estimations/${id}/export/pdf`, {
      responseType: 'blob'
    }).then(response => response.data).catch(error => {
      console.error('PDF export error:', error);
      throw new Error(error.response?.statusText || 'Failed to export PDF');
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

  getAnalytics() {
    return axiosInstance.get('/estimations/report/analytics');
  }
}

export default new EstimationService();
