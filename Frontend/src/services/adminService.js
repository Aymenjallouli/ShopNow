import api from './api';

// Admin service for dashboard functionality
export const adminService = {
  // Get admin dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats/');
      return response.data;
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  },
  
  // Get users list
  getUsers: async () => {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  
  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default adminService;
