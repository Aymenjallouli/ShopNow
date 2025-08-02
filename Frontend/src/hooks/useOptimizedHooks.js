import { useState, useEffect, useCallback, useRef } from 'react';

// Hook de debouncing pour éviter les recalculs excessifs
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook de throttling pour les événements fréquents
export const useThrottle = (callback, delay) => {
  const [throttling, setThrottling] = useState(false);
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    if (!throttling) {
      setThrottling(true);
      callback(...args);
      timeoutRef.current = setTimeout(() => {
        setThrottling(false);
      }, delay);
    }
  }, [callback, delay, throttling]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

// Hook pour les requêtes API optimisées
export const useOptimizedAPI = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (...args) => {
    const cacheKey = JSON.stringify(args);
    
    // Vérifier le cache
    if (cacheRef.current.has(cacheKey)) {
      setData(cacheRef.current.get(cacheKey));
      return;
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args, {
        signal: abortControllerRef.current.signal
      });
      
      // Mettre en cache le résultat
      cacheRef.current.set(cacheKey, result);
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Hook pour optimiser les re-renders
export const useStableCallback = (callback) => {
  const ref = useRef(callback);
  ref.current = callback;

  return useCallback((...args) => {
    return ref.current(...args);
  }, []);
};

// Hook pour la memoization avancée avec comparaison profonde
export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  const prevDepsRef = useRef(deps);

  const isEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      return keysA.length === keysB.length && keysA.every(key => isEqual(a[key], b[key]));
    }
    return false;
  };

  if (!ref.current || !isEqual(prevDepsRef.current, deps)) {
    ref.current = factory();
    prevDepsRef.current = deps;
  }

  return ref.current;
};
