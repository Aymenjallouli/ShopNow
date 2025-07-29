import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Clear any leftover tokens and reject
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          console.log('No refresh token found');
          return Promise.reject(error);
        }
        
        // Attempt to refresh the token
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        // If successful, update the tokens
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data);
        
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Only redirect to login if not already on login page to prevent redirect loops
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
