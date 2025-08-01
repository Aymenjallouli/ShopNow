/**
 * Optimisateur de performance pour améliorer le LCP et réduire les re-renders
 */

// Preloader pour les ressources critiques
export const preloadCriticalResources = () => {
  // Preload des fonts critiques
  const fonts = [
    '/fonts/inter-variable.woff2',
    '/fonts/inter-regular.woff2'
  ];
  
  fonts.forEach(font => {
    if (document.querySelector(`link[href="${font}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });
};

// Optimisateur de mémoire pour les composants lourds
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Cache en mémoire pour éviter les recalculs
class MemoryCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Déplacer vers la fin (LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Supprimer le plus ancien
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

export const performanceCache = new MemoryCache(50);

// Optimisation des images avec lazy loading avancé
export const optimizeImageLoading = () => {
  // Observer pour le lazy loading
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    { 
      rootMargin: '50px 0px',
      threshold: 0.1 
    }
  );

  // Observer toutes les images avec data-src
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => imageObserver.observe(img));

  return () => {
    imageObserver.disconnect();
  };
};

// Optimisation des métriques Web Vitals
export const optimizeWebVitals = () => {
  // Préventions des CLS
  const preventLayoutShift = () => {
    // Réserver l'espace pour les images
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      img.addEventListener('load', () => {
        if (!img.width || !img.height) {
          img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        }
      });
    });
  };

  // Optimiser les ressources critiques
  const optimizeCriticalPath = () => {
    // Preload des CSS critiques
    const criticalCSS = document.createElement('style');
    criticalCSS.textContent = `
      /* CSS critique inline pour LCP */
      .checkout-container { 
        min-height: 100vh; 
        display: flex; 
        flex-direction: column; 
      }
      .loading-skeleton { 
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(criticalCSS);
  };

  preventLayoutShift();
  optimizeCriticalPath();
};

// Throttle pour les événements fréquents
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Préchargement intelligent des routes - avec vite-ignore pour éviter l'avertissement
export const preloadRoute = (routePath) => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      // Utiliser vite-ignore pour supprimer l'avertissement d'analyse dynamique
      import(/* @vite-ignore */ routePath).catch(console.error);
    });
  }
};
