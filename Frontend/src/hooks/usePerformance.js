import { useCallback, useRef, useEffect } from 'react';

// Hook pour debouncer les appels de fonctions
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Hook pour éviter les appels API dupliqués
export const useApiCache = () => {
  const cacheRef = useRef(new Map());
  const pendingRef = useRef(new Map());

  const cachedApiCall = useCallback(async (key, apiCall, cacheDuration = 5 * 60 * 1000) => {
    // Vérifier le cache
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }

    // Vérifier si la requête est déjà en cours
    if (pendingRef.current.has(key)) {
      return pendingRef.current.get(key);
    }

    // Faire l'appel API
    const promise = apiCall().then(data => {
      // Mettre en cache
      cacheRef.current.set(key, {
        data,
        timestamp: Date.now()
      });
      // Supprimer de pending
      pendingRef.current.delete(key);
      return data;
    }).catch(error => {
      // Supprimer de pending même en cas d'erreur
      pendingRef.current.delete(key);
      throw error;
    });

    // Ajouter à pending
    pendingRef.current.set(key, promise);
    return promise;
  }, []);

  const clearCache = useCallback((key) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { cachedApiCall, clearCache };
};
