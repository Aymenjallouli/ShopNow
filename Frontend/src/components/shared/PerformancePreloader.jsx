import { useEffect } from 'react';

const PerformancePreloader = () => {
  useEffect(() => {
    // Précharger les ressources critiques
    const preloadResources = [
      // Images critiques
      '/placeholder.svg',
      // Fonts
      '/fonts/inter-variable.woff2',
      // CSS critique (déjà chargé mais on s'assure)
    ];

    preloadResources.forEach(resource => {
      if (resource.endsWith('.woff2')) {
        // Précharger les fonts
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = resource;
        document.head.appendChild(link);
      } else if (resource.endsWith('.svg') || resource.includes('image')) {
        // Précharger les images
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = resource;
        document.head.appendChild(link);
      }
    });

    // Optimiser les images existantes
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      // Ajouter un aspect ratio si pas déjà défini
      if (!img.style.aspectRatio && img.width && img.height) {
        img.style.aspectRatio = `${img.width} / ${img.height}`;
      }
      
      // Observer l'intersection pour un lazy loading optimisé
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src && !img.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        },
        { 
          rootMargin: '50px 0px',
          threshold: 0.1 
        }
      );
      
      if (img.dataset.src) {
        observer.observe(img);
      }
    });

    // Optimiser les métriques Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log des métriques importantes
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('🎯 LCP:', entry.startTime, 'ms');
          }
          if (entry.entryType === 'first-input') {
            console.log('👆 FID:', entry.processingStart - entry.startTime, 'ms');
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Browser doesn't support all entry types
        console.warn('Performance Observer limité:', e);
      }

      return () => observer.disconnect();
    }
  }, []);

  // Ce composant ne rend rien, il est juste pour les effets de performance
  return null;
};

export default PerformancePreloader;
