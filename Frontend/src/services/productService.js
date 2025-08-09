import api from './api';

// Product services
export const productService = {
  // Get all products with optional filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/', { params });
      const data = response.data || {};
      if (!Array.isArray(data.categories)) {
        if (Array.isArray(data.category_list)) data.categories = data.category_list;
        else if (Array.isArray(data.results)) data.categories = data.results; // unlikely but fallback
        else data.categories = [];
      }
      if (!Array.isArray(data.products)) data.products = Array.isArray(data.results) ? data.results : [];
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Ne jamais retourner de données statiques, retourner un tableau vide à la place
      return { products: [], categories: [] };
    }
  },

  // Create a new product (shop inferred by backend)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products/', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id, data) => {
    try {
      const response = await api.put(`/products/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Fetch only products of the authenticated shop owner
  getMyProducts: async (shopId) => {
    try {
      const response = await api.get('/products/my/', { params: shopId ? { shop: shopId } : {} });
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching my products:', error);
      return [];
    }
  },

  // Create category (dedup handled server-side; existing returned if duplicate)
  createCategory: async (data) => {
    try {
      const response = await api.post('/categories/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
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
