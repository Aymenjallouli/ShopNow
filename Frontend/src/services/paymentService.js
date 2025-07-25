import api from './api';

// Payment services
export const paymentService = {
  // Process a payment for an order
  processPayment: async (paymentData) => {
    const response = await api.post('/payments/process/', paymentData);
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/verify/`);
    return response.data;
  },

  // Get payment methods for the current user
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods/');
    return response.data;
  },

  // Add a new payment method
  addPaymentMethod: async (methodData) => {
    const response = await api.post('/payments/methods/', methodData);
    return response.data;
  },

  // Delete a payment method
  deletePaymentMethod: async (methodId) => {
    const response = await api.delete(`/payments/methods/${methodId}/`);
    return response.data;
  },
};

export default paymentService;
