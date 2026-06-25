import axiosInstance from './axiosConfig';

class AuthService {
  register(userData) {
    return axiosInstance.post('/auth/register', userData);
  }

  login(email, password) {
    return axiosInstance.post('/auth/login', { email, password });
  }

  getProfile() {
    return axiosInstance.get('/auth/profile');
  }

  updateProfile(userData) {
    return axiosInstance.put('/auth/profile', userData);
  }
}

const authService = new AuthService();
export default authService;
