import api from './api';

// Order services
export const orderService = {
  // Get all orders for the current user
  getOrders: async () => {
    const response = await api.get('/orders/');
  return response.data.orders || [];
  },

  // Get a single order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}/`);
  return response.data.order || null;
  },

  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
  return response.data; // contains order key
  },

  // Update order status (e.g., cancel an order)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}/`, { status });
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/`, { action: 'cancel' });
    return response.data;
  },

  // Get order history with filtering options
  getOrderHistory: async (params = {}) => {
    const response = await api.get('/orders/', { params });
  return response.data.orders || [];
  },
};

export default orderService;
