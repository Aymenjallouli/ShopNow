import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateProductsStock } from '../products/productsSlice';
import orderService from '../../services/orderService';

const initialState = {
  orders: [],
  currentOrder: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Fetch user orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, thunkAPI) => {
    try {
  const orders = await orderService.getOrders();
  return orders;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch orders';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, thunkAPI) => {
    try {
  const order = await orderService.getOrderById(id);
  return order;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch order';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, thunkAPI) => {
    try {
  const response = await orderService.createOrder(orderData); // { order: {...} }
      // Try extract stock info in consistent shape
      const updated = response?.order?.items?.map(it => ({
        product_id: it.product_id,
        remaining_stock: parseInt(it.remaining_stock ?? it.stock ?? 0, 10),
        status: it.remaining_stock === 0 ? 'unavailable' : undefined,
      })) || [];
      if (updated.length) {
        thunkAPI.dispatch(updateProductsStock(updated));
      }
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to create order';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
  state.orders = action.payload; // already array
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.status = 'succeeded';
  state.currentOrder = action.payload; // order object
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
  .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
  // response contains order key
  const orderObj = action.payload.order;
  state.currentOrder = orderObj;
  state.orders.unshift(orderObj);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
