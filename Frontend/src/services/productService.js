import api from './api';

// Product services
export const productService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  // Get a single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured/');
    return response.data;
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    const response = await api.get('/products/', {
      params: { category: categoryId },
    });
    return response.data;
  },

  // Search products
  searchProducts: async (query) => {
    const response = await api.get('/products/', {
      params: { search: query },
    });
    return response.data;
  },

  // Post a review for a product
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/review/`, reviewData);
    return response.data;
  },
};

export default productService;
