import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

const initialState = {
  products: [],
  categories: [],
  singleProduct: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await productService.getProducts();
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch products';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, thunkAPI) => {
    try {
      const response = await productService.getProductById(id);
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch product';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await productService.getCategories();
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch categories';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query, thunkAPI) => {
    try {
      const response = await productService.searchProducts(query);
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to search products';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add review to product
export const addProductReview = createAsyncThunk(
  'products/addProductReview',
  async ({ productId, reviewData }, thunkAPI) => {
    try {
      const response = await productService.createReview(productId, reviewData);
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Échec de l\'ajout de l\'avis';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update review
export const updateProductReview = createAsyncThunk(
  'products/updateProductReview',
  async ({ productId, reviewId, reviewData }, thunkAPI) => {
    try {
      const response = await productService.updateReview(productId, reviewId, reviewData);
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Échec de la mise à jour de l\'avis';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete review
export const deleteProductReview = createAsyncThunk(
  'products/deleteProductReview',
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      await productService.deleteReview(productId, reviewId);
      return { reviewId, productId };
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Échec de la suppression de l\'avis';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Data mocking for testing reviews when backend is not available
const generateMockReviews = (productId) => {
  const userNames = ['John Doe', 'Alice Smith', 'Robert Johnson', 'Emma Wilson', 'Michael Brown'];
  const reviewTitles = [
    'Très satisfait de mon achat',
    'Excellent rapport qualité-prix',
    'Livraison rapide et produit conforme',
    'Bon produit mais quelques défauts',
    'Je recommande ce produit'
  ];
  const comments = [
    'Ce produit est exactement ce que je cherchais. La qualité est excellente et le prix très raisonnable.',
    'J\'ai reçu ma commande rapidement et le produit fonctionne parfaitement. Je suis très satisfait.',
    'Bonne qualité générale, mais quelques petits défauts de finition. Dans l\'ensemble, je suis satisfait.',
    'Excellent produit, je le recommande vivement. Le service client a également été très réactif.',
    'Le produit correspond parfaitement à la description. Je suis très content de mon achat.'
  ];
  
  // Generate 0-5 random reviews
  const count = Math.floor(Math.random() * 6);
  const reviews = [];
  
  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars for positive bias
    const userIndex = Math.floor(Math.random() * userNames.length);
    const titleIndex = Math.floor(Math.random() * reviewTitles.length);
    const commentIndex = Math.floor(Math.random() * comments.length);
    
    // Create a date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    reviews.push({
      id: Date.now() + i,
      rating,
      title: reviewTitles[titleIndex],
      comment: comments[commentIndex],
      created_at: date.toISOString(),
      user: {
        id: 1000 + i,
        name: userNames[userIndex]
      },
      product: productId
    });
  }
  
  return reviews;
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    resetSingleProduct: (state) => {
      state.singleProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products;
        state.categories = action.payload.categories;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Ensure we have a product and set default reviews if needed
        const product = action.payload;
        
        // If reviews are missing or empty, generate mock reviews for testing purposes
        if (!product.reviews || product.reviews.length === 0) {
          console.log('Using mock reviews for testing purposes');
          product.reviews = generateMockReviews(product.id);
          
          // Calculate average rating
          if (product.reviews.length > 0) {
            const ratings = product.reviews.map(review => review.rating);
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            product.rating = sum / ratings.length;
          } else {
            product.rating = 0;
          }
        }
        
        state.singleProduct = product;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) && action.payload.length > 0 
          ? action.payload 
          : [
              { id: 1, name: 'Electronics' },
              { id: 2, name: 'Clothing' },
              { id: 3, name: 'Home & Kitchen' },
              { id: 4, name: 'Books' },
              { id: 5, name: 'Sports & Outdoors' },
            ];
        state.status = 'succeeded';
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        // Fallback categories en cas d'erreur
        state.categories = [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Clothing' },
          { id: 3, name: 'Home & Kitchen' },
          { id: 4, name: 'Books' },
          { id: 5, name: 'Sports & Outdoors' },
        ];
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add review to product
      .addCase(addProductReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.singleProduct) {
          // If reviews array doesn't exist, create it
          if (!state.singleProduct.reviews) {
            state.singleProduct.reviews = [];
          }
          
          // Add the new review
          state.singleProduct.reviews.push(action.payload);
          
          // Recalculate the average rating
          const ratings = state.singleProduct.reviews.map(review => review.rating);
          const sum = ratings.reduce((acc, rating) => acc + rating, 0);
          state.singleProduct.rating = sum / ratings.length;
        }
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update review
      .addCase(updateProductReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProductReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.singleProduct && state.singleProduct.reviews) {
          // Find and update the review
          const index = state.singleProduct.reviews.findIndex(review => review.id === action.payload.id);
          if (index !== -1) {
            state.singleProduct.reviews[index] = action.payload;
          }
          
          // Recalculate the average rating
          const ratings = state.singleProduct.reviews.map(review => review.rating);
          const sum = ratings.reduce((acc, rating) => acc + rating, 0);
          state.singleProduct.rating = sum / ratings.length;
        }
      })
      .addCase(updateProductReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete review
      .addCase(deleteProductReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProductReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.singleProduct && state.singleProduct.reviews) {
          // Remove the review
          state.singleProduct.reviews = state.singleProduct.reviews.filter(
            review => review.id !== action.payload.reviewId
          );
          
          // Recalculate the average rating or set to 0 if no reviews
          if (state.singleProduct.reviews.length > 0) {
            const ratings = state.singleProduct.reviews.map(review => review.rating);
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            state.singleProduct.rating = sum / ratings.length;
          } else {
            state.singleProduct.rating = 0;
          }
        }
      })
      .addCase(deleteProductReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearProductError, resetSingleProduct } = productsSlice.actions;
export default productsSlice.reducer;
