import api from './api';

// User authentication services
export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/token/', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/update_profile/', userData);
    return response.data;
  },

  // Verify token is valid
  verifyToken: async (token) => {
    const response = await api.post('/token/verify/', { token });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};

export default authService;
