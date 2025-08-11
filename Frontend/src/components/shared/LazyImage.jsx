import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  onLoad = () => {},
  onError = () => {},
  placeholder = '/placeholder.svg',
  priority = false
}) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [imageRef, setImageRef] = useState();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let observer;
    
    if (imageRef && !priority) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { 
          threshold: 0.1,
          rootMargin: '50px'
        }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    };
  }, [imageRef, src, priority]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setError(true);
    setImageSrc(placeholder);
    onError();
  };

  // Calculer les dimensions avec aspect ratio
  const getImageStyle = () => {
    const style = {};
    
    if (width && height) {
      style.width = width;
      style.height = height;
      style.aspectRatio = `${width} / ${height}`;
    }
    
    return style;
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={getImageStyle()}
    >
      {/* Skeleton loader */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
        </div>
      )}
      
      {/* Image principale */}
      <img
        ref={setImageRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={getImageStyle()}
      />
      
      {/* Fallback en cas d'erreur */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyImage);
