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
    updateProductsStock: (state, action) => {
      const updates = action.payload; // [{product_id?, id?, remaining_stock, status}]
      if (!Array.isArray(updates)) return;
      updates.forEach(u => {
        const pid = u.product_id || u.id;
        if (!pid) return;
        const prod = state.products.find(p => p.id === pid);
        if (prod) {
          if (typeof u.remaining_stock === 'number') prod.stock = u.remaining_stock;
          if (u.status) prod.status = u.status;
        }
        if (state.singleProduct && state.singleProduct.id === pid) {
          if (typeof u.remaining_stock === 'number') state.singleProduct.stock = u.remaining_stock;
          if (u.status) state.singleProduct.status = u.status;
        }
      });
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
        const data = action.payload || {};
        state.products = Array.isArray(data.products) ? data.products : [];
        state.categories = Array.isArray(data.categories) ? data.categories : (Array.isArray(data.category_list) ? data.category_list : []);
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
        const product = action.payload;
        // Guarantee arrays & numeric rating without injecting fake data
        if (!Array.isArray(product.reviews)) product.reviews = [];
        if (typeof product.rating !== 'number') product.rating = 0;
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
        const payload = action.payload;
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (payload && Array.isArray(payload.results)) list = payload.results;
        else if (payload && Array.isArray(payload.categories)) list = payload.categories; // fallback if different key
        state.categories = list;
        state.status = 'succeeded';
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.categories = [];
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
        // Also update list product rating to reflect new review without full refetch
        const prodInList = state.products.find(p => p.id === action.payload.product || (state.singleProduct && p.id === state.singleProduct.id));
        if (prodInList && state.singleProduct) {
          prodInList.rating = state.singleProduct.rating;
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
        const prodInList = state.products.find(p => state.singleProduct && p.id === state.singleProduct.id);
        if (prodInList && state.singleProduct) {
          prodInList.rating = state.singleProduct.rating;
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
        const prodInList = state.products.find(p => state.singleProduct && p.id === state.singleProduct.id);
        if (prodInList && state.singleProduct) {
          prodInList.rating = state.singleProduct.rating;
        }
      })
      .addCase(deleteProductReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearProductError, resetSingleProduct, updateProductsStock } = productsSlice.actions;
export default productsSlice.reducer;
