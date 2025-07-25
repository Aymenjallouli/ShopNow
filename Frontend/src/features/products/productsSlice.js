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
        'Failed to add review';
      
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
        state.singleProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
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
      .addCase(addProductReview.fulfilled, (state, action) => {
        if (state.singleProduct) {
          state.singleProduct = {
            ...state.singleProduct,
            reviews: [...(state.singleProduct.reviews || []), action.payload],
          };
        }
      });
  },
});

export const { clearProductError, resetSingleProduct } = productsSlice.actions;
export default productsSlice.reducer;
