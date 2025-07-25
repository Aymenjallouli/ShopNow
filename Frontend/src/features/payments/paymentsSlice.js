import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

const initialState = {
  paymentMethods: [],
  currentPayment: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Process payment
export const processPayment = createAsyncThunk(
  'payments/processPayment',
  async (paymentData, thunkAPI) => {
    try {
      const response = await paymentService.processPayment(paymentData);
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to process payment';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get payment methods
export const fetchPaymentMethods = createAsyncThunk(
  'payments/fetchPaymentMethods',
  async (_, thunkAPI) => {
    try {
      const response = await paymentService.getPaymentMethods();
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch payment methods';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add payment method
export const addPaymentMethod = createAsyncThunk(
  'payments/addPaymentMethod',
  async (methodData, thunkAPI) => {
    try {
      const response = await paymentService.addPaymentMethod(methodData);
      return response;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to add payment method';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete payment method
export const deletePaymentMethod = createAsyncThunk(
  'payments/deletePaymentMethod',
  async (methodId, thunkAPI) => {
    try {
      await paymentService.deletePaymentMethod(methodId);
      return methodId;
    } catch (error) {
      const message = 
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to delete payment method';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPayment = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Fetch payment methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add payment method
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods.push(action.payload);
      })
      
      // Delete payment method
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(
          method => method.id !== action.payload
        );
      });
  },
});

export const { clearPaymentError, clearCurrentPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
