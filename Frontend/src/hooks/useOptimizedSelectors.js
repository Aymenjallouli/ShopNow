import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// Hook pour créer des sélecteurs memoized
export const useOptimizedSelector = (selectorFactory, equalityFn) => {
  const memoizedSelector = useMemo(() => createSelector(selectorFactory), []);
  return useSelector(memoizedSelector, equalityFn);
};

// Sélecteurs optimisés pour les données communes
export const selectOptimizedProducts = createSelector(
  [
    (state) => state.products.products,
    (state) => state.products.categories,
    (state) => state.products.status,
    (state) => state.products.error
  ],
  (products, categories, status, error) => ({
    products: products || [],
    categories: categories || [],
    status,
    error,
    hasProducts: Array.isArray(products) && products.length > 0,
    hasCategories: Array.isArray(categories) && categories.length > 0
  })
);

export const selectOptimizedCart = createSelector(
  [(state) => state.cart.items, (state) => state.cart.total],
  (items, total) => ({
    items: items || [],
    total: total || 0,
    itemCount: items?.length || 0,
    hasItems: Array.isArray(items) && items.length > 0
  })
);

export const selectOptimizedAuth = createSelector(
  [
    (state) => state.auth.isAuthenticated,
    (state) => state.auth.user,
    (state) => state.auth.token
  ],
  (isAuthenticated, user, token) => ({
    isAuthenticated: Boolean(isAuthenticated),
    user: user || null,
    token: token || null,
    isAdmin: user?.is_staff || false,
    userId: user?.id || null
  })
);

export const selectOptimizedWishlist = createSelector(
  [(state) => state.wishlist.items, (state) => state.wishlist.status],
  (items, status) => ({
    items: items || [],
    status,
    itemCount: items?.length || 0,
    hasItems: Array.isArray(items) && items.length > 0
  })
);

// Hook personnalisé pour les données de produits optimisées
export const useOptimizedProducts = () => {
  return useSelector(selectOptimizedProducts, (left, right) => {
    return left.products.length === right.products.length && 
           left.status === right.status;
  });
};

// Hook personnalisé pour le panier optimisé
export const useOptimizedCart = () => {
  return useSelector(selectOptimizedCart, (left, right) => {
    return left.itemCount === right.itemCount && 
           left.total === right.total;
  });
};

// Hook personnalisé pour l'authentification optimisée
export const useOptimizedAuth = () => {
  return useSelector(selectOptimizedAuth, (left, right) => {
    return left.isAuthenticated === right.isAuthenticated && 
           left.userId === right.userId &&
           left.isAdmin === right.isAdmin;
  });
};

// Hook personnalisé pour la wishlist optimisée
export const useOptimizedWishlist = () => {
  return useSelector(selectOptimizedWishlist, (left, right) => {
    return left.itemCount === right.itemCount;
  });
};
