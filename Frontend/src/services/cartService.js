import api from './api';

// Cart services
export const cartService = {
  // Get cart items
  getCart: async () => {
    const response = await api.get('/cart/');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/', {
      product: productId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    const response = await api.put(`/cart/${cartItemId}/`, {
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}/`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear/');
    return response.data;
  },

  // Get cart total
  getCartTotal: async () => {
    const response = await api.get('/cart/total/');
    return response.data;
  },
};

export default cartService;
