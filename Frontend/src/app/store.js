import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';
import myProductsReducer from '../features/products/myProductsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import paymentsReducer from '../features/payments/paymentsSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import shopsReducer from '../features/shops/shopsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    orders: ordersReducer,
    payments: paymentsReducer,
    wishlist: wishlistReducer,
  shops: shopsReducer,
  myProducts: myProductsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/non-serializable/action'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export default store;
