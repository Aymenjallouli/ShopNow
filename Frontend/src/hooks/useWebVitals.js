import { useEffect, useRef } from 'react';

/**
 * Hook pour optimiser les métriques Core Web Vitals
 * - LCP (Largest Contentful Paint)
 * - CLS (Cumulative Layout Shift) 
 * - INP (Interaction to Next Paint)
 */
export const useWebVitals = () => {
  const metricsRef = useRef({
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null
  });

  useEffect(() => {
    // Optimisation LCP - Préchargement des ressources critiques
    const preloadCriticalResources = () => {
      const criticalImages = document.querySelectorAll('img[data-priority="high"]');
      criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      });
    };

    // Optimisation CLS - Réservation d'espace pour les éléments dynamiques
    const preventLayoutShifts = () => {
      // Ajouter des dimensions fixes aux conteneurs d'images
      const images = document.querySelectorAll('img:not([width]):not([height])');
      images.forEach(img => {
        if (!img.style.aspectRatio) {
          img.style.aspectRatio = '16/9'; // Ratio par défaut
          img.style.width = '100%';
          img.style.height = 'auto';
        }
      });

      // Réserver de l'espace pour les éléments qui se chargent de manière asynchrone
      const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
      dynamicContainers.forEach(container => {
        if (!container.style.minHeight) {
          container.style.minHeight = container.dataset.minHeight || '200px';
        }
      });
    };

    // Optimisation INP - Debounce pour les interactions
    const optimizeInteractions = () => {
      let interactionTimeout;
      
      const debouncedInteraction = (callback, delay = 16) => {
        return (...args) => {
          clearTimeout(interactionTimeout);
          interactionTimeout = setTimeout(() => callback(...args), delay);
        };
      };

      // Appliquer le debounce aux boutons et inputs
      const interactiveElements = document.querySelectorAll('button, input, select, textarea');
      interactiveElements.forEach(element => {
        if (element.dataset.optimized !== 'true') {
          const originalHandler = element.onclick;
          if (originalHandler) {
            element.onclick = debouncedInteraction(originalHandler);
          }
          element.dataset.optimized = 'true';
        }
      });
    };

    // Mesure des métriques Web Vitals
    const measureWebVitals = () => {
      if ('web-vitals' in window) {
        import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP, getTTFB }) => {
          getCLS((metric) => {
            metricsRef.current.cls = metric;
            console.log('CLS:', metric.value);
          });

          getFCP((metric) => {
            metricsRef.current.fcp = metric;
            console.log('FCP:', metric.value);
          });

          getFID((metric) => {
            metricsRef.current.inp = metric;
            console.log('FID/INP:', metric.value);
          });

          getLCP((metric) => {
            metricsRef.current.lcp = metric;
            console.log('LCP:', metric.value);
          });

          getTTFB((metric) => {
            metricsRef.current.ttfb = metric;
            console.log('TTFB:', metric.value);
          });
        });
      }
    };

    // Observer pour détecter les changements de mise en page
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        
        console.warn('Layout Shift détecté:', {
          value: entry.value,
          sources: entry.sources?.map(source => ({
            element: source.node?.tagName,
            previousRect: source.previousRect,
            currentRect: source.currentRect
          }))
        });
      }
    });

    // Observer pour les plus grands éléments de contenu
    const largestContentfulPaintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP Element:', lastEntry.element, 'Time:', lastEntry.startTime);
    });

    // Démarrer les optimisations
    preloadCriticalResources();
    preventLayoutShifts();
    optimizeInteractions();
    measureWebVitals();

    // Démarrer les observers
    if ('PerformanceObserver' in window) {
      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        largestContentfulPaintObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('Performance Observer not supported:', e);
      }
    }

    // Nettoyage
    return () => {
      layoutShiftObserver?.disconnect();
      largestContentfulPaintObserver?.disconnect();
    };
  }, []);

  // Fonction pour obtenir les métriques actuelles
  const getMetrics = () => metricsRef.current;

  // Fonction pour optimiser un élément spécifique
  const optimizeElement = (element, options = {}) => {
    if (!element) return;

    const {
      fixedDimensions = true,
      preloadImages = true,
      debounceInteractions = true
    } = options;

    // Fixer les dimensions pour éviter le CLS
    if (fixedDimensions && element.tagName === 'IMG') {
      if (!element.width || !element.height) {
        element.style.aspectRatio = '16/9';
        element.style.width = '100%';
        element.style.height = 'auto';
      }
    }

    // Précharger les images importantes
    if (preloadImages && element.tagName === 'IMG' && element.dataset.priority === 'high') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = element.src;
      document.head.appendChild(link);
    }

    // Debounce pour les interactions
    if (debounceInteractions && ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const originalHandler = element.onclick;
      if (originalHandler && element.dataset.optimized !== 'true') {
        element.onclick = (...args) => {
          requestAnimationFrame(() => originalHandler(...args));
        };
        element.dataset.optimized = 'true';
      }
    }
  };

  return {
    getMetrics,
    optimizeElement
  };
};

/**
 * Hook pour surveiller et améliorer le CLS en temps réel
 */
export const useCLSOptimization = () => {
  useEffect(() => {
    let cumulativeScore = 0;
    const shiftThreshold = 0.1; // Seuil d'alerte pour le CLS

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cumulativeScore += entry.value;
          
          if (entry.value > shiftThreshold) {
            console.warn('🚨 Layout Shift Important détecté:', {
              score: entry.value,
              cumulativeScore,
              affectedElements: entry.sources?.map(source => source.node)
            });
            
            // Essayer de corriger automatiquement
            entry.sources?.forEach(source => {
              const element = source.node;
              if (element && element.tagName === 'IMG') {
                element.style.aspectRatio = '16/9';
                element.style.width = '100%';
                element.style.height = 'auto';
              }
            });
          }
        }
      }
    });

    if ('PerformanceObserver' in window) {
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout Shift Observer not supported:', e);
      }
    }

    return () => observer?.disconnect();
  }, []);
};

export default useWebVitals;
