import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';

const PerformanceContext = createContext();

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export const PerformanceProvider = ({ children }) => {
  const metricsRef = useRef({
    renders: 0,
    apiCalls: 0,
    errors: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  const observerRef = useRef(null);

  // Fonction pour mesurer les performances
  const measurePerformance = useCallback((name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`🚀 Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    
    return result;
  }, []);

  // Fonction pour mesurer les performances async
  const measureAsync = useCallback(async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`🚀 Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    
    return result;
  }, []);

  // Moniteur de mémoire
  const checkMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const memInfo = performance.memory;
      metricsRef.current.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
      
      if (metricsRef.current.memoryUsage > 100) { // Plus de 100MB
        console.warn(`⚠️ High memory usage: ${metricsRef.current.memoryUsage.toFixed(2)}MB`);
      }
    }
  }, []);

  // Observer les mutations DOM pour détecter les re-renders excessifs
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (mutations.length > 10) {
        console.warn(`⚠️ High DOM mutations detected: ${mutations.length}`);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    observerRef.current = observer;

    // Nettoyage
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Moniteur des Web Vitals
  const measureWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`📊 FID: ${entry.processingStart - entry.startTime}ms`);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log(`📊 CLS: ${clsValue.toFixed(4)}`);
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  // Hook pour optimiser les composants
  const optimizeComponent = useCallback((componentName, renderFn) => {
    metricsRef.current.renders++;
    
    if (metricsRef.current.renders % 100 === 0) {
      console.log(`📈 Total renders: ${metricsRef.current.renders}`);
      checkMemoryUsage();
    }

    return measurePerformance(`${componentName}-render`, renderFn);
  }, [measurePerformance, checkMemoryUsage]);

  // API call optimizer
  const optimizeAPICall = useCallback(async (name, apiCall) => {
    metricsRef.current.apiCalls++;
    return measureAsync(`API-${name}`, apiCall);
  }, [measureAsync]);

  // Error tracker
  const trackError = useCallback((error, context) => {
    metricsRef.current.errors++;
    console.error(`❌ Error in ${context}:`, error);
  }, []);

  // Performance report
  const getPerformanceReport = useCallback(() => {
    return {
      ...metricsRef.current,
      timestamp: Date.now()
    };
  }, []);

  useEffect(() => {
    // Initialiser le monitoring des Web Vitals
    const cleanup = measureWebVitals();
    
    // Vérifier périodiquement la mémoire
    const memoryInterval = setInterval(checkMemoryUsage, 30000); // Toutes les 30s
    
    return () => {
      cleanup();
      clearInterval(memoryInterval);
    };
  }, [measureWebVitals, checkMemoryUsage]);

  const value = {
    measurePerformance,
    measureAsync,
    optimizeComponent,
    optimizeAPICall,
    trackError,
    getPerformanceReport,
    metrics: metricsRef.current
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};
