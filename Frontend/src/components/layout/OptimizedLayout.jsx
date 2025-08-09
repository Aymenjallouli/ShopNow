import React, { Suspense } from 'react';
import { useWebVitals, useCLSOptimization } from '../hooks/useWebVitals';
import OptimizedFooter from './OptimizedFooter';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Layout principal optimisé pour les Core Web Vitals
 * - Prévient les décalages de mise en page (CLS)
 * - Optimise le temps de chargement (LCP)
 * - Améliore les interactions (INP)
 */
const OptimizedLayout = ({ children, className = '' }) => {
  // Hooks d'optimisation des performances
  useWebVitals();
  useCLSOptimization();

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Header avec dimensions fixes pour éviter CLS */}
      <header 
        className="sticky top-0 z-50 bg-white shadow-sm"
        style={{ minHeight: '64px' }} // Hauteur fixe pour éviter CLS
      >
        <Suspense fallback={
          <div className="h-16 bg-white border-b border-gray-200 animate-pulse">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="w-32 h-8 bg-gray-200 rounded"></div>
                <div className="hidden md:flex space-x-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-16 h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        }>
          {/* Le header sera chargé de manière lazy si nécessaire */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Contenu du header */}
            </div>
          </div>
        </Suspense>
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        {/* Conteneur avec dimensions minimales pour éviter CLS */}
        <div 
          className="min-h-screen"
          style={{ minHeight: 'calc(100vh - 64px - 320px)' }} // Hauteur - header - footer
        >
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </div>
      </main>

      {/* Footer optimisé */}
      <OptimizedFooter />
    </div>
  );
};

/**
 * Composant de chargement optimisé
 */
const LoadingSpinner = () => (
  <div 
    className="flex items-center justify-center"
    style={{ minHeight: '400px' }} // Hauteur fixe pour éviter CLS
  >
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
  </div>
);

/**
 * HOC pour optimiser automatiquement les composants
 */
export const withPerformanceOptimization = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const { optimizeElement } = useWebVitals();
    const elementRef = React.useRef();

    React.useEffect(() => {
      if (elementRef.current) {
        optimizeElement(elementRef.current);
      }
    }, [optimizeElement]);

    return (
      <div ref={elementRef}>
        <WrappedComponent {...props} ref={ref} />
      </div>
    );
  });
};

/**
 * Container avec dimensions fixes pour éviter CLS
 */
export const FixedContainer = ({ 
  children, 
  minHeight = '200px', 
  className = '',
  ...props 
}) => (
  <div 
    className={`${className}`}
    style={{ minHeight, ...props.style }}
    {...props}
  >
    {children}
  </div>
);

/**
 * Image optimisée avec lazy loading et dimensions fixes
 */
export const OptimizedImage = React.forwardRef(({ 
  src, 
  alt, 
  className = '',
  priority = false,
  aspectRatio = '16/9',
  ...props 
}, ref) => {
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`${className}`}
      loading={priority ? 'eager' : 'lazy'}
      data-priority={priority ? 'high' : 'low'}
      style={{
        aspectRatio,
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        ...props.style
      }}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { LoadingSpinner };
export default OptimizedLayout;
