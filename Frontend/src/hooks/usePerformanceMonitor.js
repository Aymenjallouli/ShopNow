import { useEffect, useRef, useCallback } from 'react';

// Hook pour surveiller les Web Vitals et optimiser les performances
export const usePerformanceMonitor = () => {
  const performanceObserver = useRef(null);
  const metricsRef = useRef({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    inp: null
  });

  const reportMetric = useCallback((metric) => {
    metricsRef.current[metric.name.toLowerCase()] = metric.value;
    
    // Envoyer les métriques en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${metric.name}:`, metric.value, metric.rating || 'N/A');
    }
    
    // Alertes pour les métriques problématiques
    if (metric.name === 'LCP' && metric.value > 2500) {
      console.warn('⚠️ LCP élevé détecté:', metric.value, 'ms');
    }
    if (metric.name === 'CLS' && metric.value > 0.1) {
      console.warn('⚠️ CLS élevé détecté:', metric.value);
    }
    if (metric.name === 'INP' && metric.value > 200) {
      console.warn('⚠️ INP élevé détecté:', metric.value, 'ms');
    }
  }, []);

  useEffect(() => {
    // Observer les métriques de performance
    if ('PerformanceObserver' in window) {
      try {
        // Observer LCP
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          reportMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor'
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Observer FCP
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              reportMetric({
                name: 'FCP',
                value: entry.startTime,
                rating: entry.startTime <= 1800 ? 'good' : entry.startTime <= 3000 ? 'needs-improvement' : 'poor'
              });
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Observer CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          reportMetric({
            name: 'CLS',
            value: clsValue,
            rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        performanceObserver.current = { lcpObserver, fcpObserver, clsObserver };
      } catch (error) {
        console.warn('Performance Observer non supporté:', error);
      }
    }

    return () => {
      if (performanceObserver.current) {
        Object.values(performanceObserver.current).forEach(observer => {
          try {
            observer.disconnect();
          } catch (error) {
            console.warn('Erreur lors de la déconnexion de l\'observer:', error);
          }
        });
      }
    };
  }, [reportMetric]);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const markFeature = useCallback((featureName) => {
    if ('performance' in window && performance.mark) {
      performance.mark(`feature-${featureName}-start`);
      
      return () => {
        performance.mark(`feature-${featureName}-end`);
        performance.measure(
          `feature-${featureName}`,
          `feature-${featureName}-start`,
          `feature-${featureName}-end`
        );
      };
    }
    return () => {};
  }, []);

  return {
    getMetrics,
    markFeature,
    reportMetric
  };
};

// Hook pour optimiser les re-renders
export const useRenderOptimization = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} render #${renderCount.current} (${timeSinceLastRender}ms depuis le dernier)`);
      
      // Alerte si trop de re-renders rapides
      if (renderCount.current > 5 && timeSinceLastRender < 100) {
        console.warn(`⚠️ ${componentName} se re-render trop fréquemment`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => { renderCount.current = 0; }
  };
};

// Hook pour la détection de problèmes de performance
export const usePerformanceIssueDetection = () => {
  const longTasksRef = useRef([]);
  const memoryRef = useRef(null);

  useEffect(() => {
    // Détecter les long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              longTasksRef.current.push({
                duration: entry.duration,
                timestamp: entry.startTime,
                name: entry.name
              });
              
              if (process.env.NODE_ENV === 'development') {
                console.warn('🐌 Long task détecté:', entry.duration, 'ms');
              }
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });

        return () => observer.disconnect();
      } catch (error) {
        console.warn('Long task observer non supporté:', error);
      }
    }

    // Surveiller l'utilisation mémoire
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        memoryRef.current = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };

        // Alerte si utilisation mémoire élevée
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usage > 0.8 && process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Utilisation mémoire élevée:', Math.round(usage * 100), '%');
        }
      }
    };

    checkMemory();
    const memoryInterval = setInterval(checkMemory, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(memoryInterval);
  }, []);

  const getPerformanceReport = useCallback(() => {
    return {
      longTasks: longTasksRef.current,
      memory: memoryRef.current,
      recommendations: generateRecommendations()
    };
  }, []);

  const generateRecommendations = useCallback(() => {
    const recommendations = [];
    
    if (longTasksRef.current.length > 0) {
      recommendations.push('Optimiser les tâches longues qui bloquent le thread principal');
    }
    
    if (memoryRef.current && memoryRef.current.used / memoryRef.current.limit > 0.7) {
      recommendations.push('Surveiller l\'utilisation mémoire - nettoyage potentiellement nécessaire');
    }
    
    return recommendations;
  }, []);

  return {
    getPerformanceReport,
    longTasks: longTasksRef.current,
    memory: memoryRef.current
  };
};
