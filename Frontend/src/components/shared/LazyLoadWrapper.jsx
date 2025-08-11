import React, { memo, useState, useCallback, useRef, useEffect } from 'react';

const LazyLoadWrapper = memo(({ 
  children, 
  placeholder = null, 
  rootMargin = '50px',
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible || hasLoaded ? children : placeholder}
    </div>
  );
});

LazyLoadWrapper.displayName = 'LazyLoadWrapper';

// Composant OptimizedImage avec lazy loading et optimisations
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback((e) => {
    setLoaded(true);
    onLoad(e);
  }, [onLoad]);

  const handleError = useCallback((e) => {
    setError(true);
    onError(e);
  }, [onError]);

  const defaultPlaceholder = (
    <div className={`bg-slate-100 animate-pulse flex items-center justify-center ${className}`}>
      <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
    </div>
  );

  return (
    <LazyLoadWrapper 
      placeholder={placeholder || defaultPlaceholder}
      className="relative overflow-hidden"
    >
      <div className="relative">
        {!loaded && !error && (placeholder || defaultPlaceholder)}
        <img
          src={src}
          alt={alt}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      </div>
    </LazyLoadWrapper>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { LazyLoadWrapper, OptimizedImage };
export default LazyLoadWrapper;
