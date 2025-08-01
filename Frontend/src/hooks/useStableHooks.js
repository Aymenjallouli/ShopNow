import { useCallback, useMemo, useEffect } from 'react';

// Hooks spécifiques à React pour les optimisations de performance

// Stabilisation des objets pour éviter les re-renders
export const useStableCallback = (fn, deps) => {
  return useCallback(fn, deps);
};

export const useStableMemo = (fn, deps) => {
  return useMemo(fn, deps);
};

// Nettoyage automatique des event listeners
export const useCleanupEffect = (cleanup) => {
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
};

// Hook pour stabiliser les objets complexes
export const useStableObject = (obj) => {
  return useMemo(() => obj, [JSON.stringify(obj)]);
};

// Hook pour stabiliser les arrays
export const useStableArray = (arr) => {
  return useMemo(() => arr, [JSON.stringify(arr)]);
};

// Hook pour éviter les re-renders inutiles avec comparaison profonde
export const useDeepMemo = (fn, deps) => {
  return useMemo(fn, deps.map(dep => JSON.stringify(dep)));
};

// Hook pour les callbacks avec dépendances stabilisées
export const useStableCallbackWithDeps = (fn, deps) => {
  const stableDeps = useMemo(() => deps, [JSON.stringify(deps)]);
  return useCallback(fn, stableDeps);
};
