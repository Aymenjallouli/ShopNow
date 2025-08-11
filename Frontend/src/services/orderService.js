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

  // Create order with cash on delivery
  createCashOnDelivery: async (itemsPayload) => {
    const payload = {
      orderItems: itemsPayload,
      shippingAddress: '',
      totalPrice: 0, // backend will recalc
      paymentMethod: 'cash_on_delivery',
    };
    const response = await api.post('/orders/', payload);
    return response.data.order;
  },

  // Create credit request order (must be single shop)
  createCreditRequest: async (itemsPayload, paymentDueDate) => {
    const payload = {
      orderItems: itemsPayload,
      shippingAddress: '',
      totalPrice: 0,
      paymentMethod: 'credit',
      paymentDueDate: paymentDueDate, // YYYY-MM-DD format
    };
    const response = await api.post('/orders/', payload);
    return response.data.order;
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

  // Shop owner / admin decision on credit order
  decideCredit: async ({ orderId, action, note }) => {
    const response = await api.patch('/orders/credit/decision/', { order_id: orderId, action, note });
    return response.data;
  },

  // Shop owner: list orders for owned shops
  getShopOwnerOrders: async (params = {}) => {
    const response = await api.get('/orders/shop-owner/', { params });
    return response.data.orders || [];
  },
  
  // Shop owner: list regular orders (excluding credits)
  getShopOwnerRegularOrders: async (params = {}) => {
    const response = await api.get('/orders/shop-owner/', { params: { ...params, exclude_credit: 1 } });
    return response.data.orders || [];
  },
  
  // Shop owner: list only credit requests (requested/approved)
  getCreditRequests: async () => {
    const response = await api.get('/orders/shop-owner/', { params: { credit: 1 } });
    return response.data.orders || [];
  }
};

export default orderService;
