import api from './api';

// Wishlist services
export const wishlistService = {
  // Get all wishlist items
  getWishlist: async () => {
    const response = await api.get('/wishlist/');
    return response.data;
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist/', {
      product: productId,
    });
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (wishlistItemId) => {
    const response = await api.delete(`/wishlist/${wishlistItemId}/`);
    return response.data;
  },

  // Check if a product is in the wishlist
  isInWishlist: async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}/`);
    return response.data;
  },

  // Clear wishlist
  clearWishlist: async () => {
    const response = await api.delete('/wishlist/clear/');
    return response.data;
  },
};

export default wishlistService;
