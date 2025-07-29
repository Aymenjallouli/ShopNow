import api from './api';

// User authentication services
export const authService = {
  // Login user (uses email as the username field)
  login: async (credentials) => {
    try {
      // Assurer que nous envoyons les champs corrects que SimpleJWT attend
      const payload = {
        email: credentials.email,
        password: credentials.password
      };
      
      const response = await api.post('/token/', payload);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      // Améliorer le message d'erreur
      if (error.response?.status === 401 || 
          (error.response?.data?.detail && 
           error.response.data.detail.includes('No active account'))) {
        error.response.data = {
          detail: 'Email ou mot de passe invalide. Veuillez réessayer.'
        };
      }
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/update_profile/', userData);
      // Store token if it's included in the response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data);
      throw error;
    }
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
