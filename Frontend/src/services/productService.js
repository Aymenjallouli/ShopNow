import api from './api';

// Product services
export const productService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Ne jamais retourner de données statiques, retourner un tableau vide à la place
      return { products: [], categories: [] };
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}/`);
      // S'assurer que le produit a un champ rating valide
      if (!response.data.rating) {
        response.data.rating = 0;
      }
      // S'assurer que le produit a un tableau reviews vide au minimum
      if (!response.data.reviews) {
        response.data.reviews = [];
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured/');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await api.get('/products/', {
        params: { category: categoryId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { products: [] };
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await api.get('/products/', {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [] };
    }
  },

  // Post a review for a product
  createReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/products/${productId}/reviews/`, reviewData);
      
      // Si l'API retourne simplement un message de succès sans l'objet review,
      // on peut construire l'objet review manuellement pour un affichage immédiat
      if (!response.data?.id) {
        const { user } = await api.get('/auth/user/');
        
        return {
          id: Date.now(), // Temporary ID
          ...reviewData,
          product: productId,
          user: {
            id: user.id,
            name: user.name || user.username || 'Utilisateur anonyme',
          },
          created_at: new Date().toISOString(),
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  
  // Update a review
  updateReview: async (productId, reviewId, reviewData) => {
    try {
      const response = await api.put(`/products/${productId}/reviews/${reviewId}/`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },
  
  // Delete a review
  deleteReview: async (productId, reviewId) => {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};

export default productService;
