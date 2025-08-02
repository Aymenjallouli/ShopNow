import React from 'react';

/**
 * Composant SVG optimisé pour éviter les décalages de mise en page (CLS)
 * Définit des dimensions fixes et utilise viewBox pour la mise à l'échelle
 */
const OptimizedSVG = ({ 
  children, 
  className = '', 
  width = 20, 
  height = 20, 
  viewBox = '0 0 20 20',
  'aria-hidden': ariaHidden = true,
  ...props 
}) => {
  return (
    <svg
      className={`inline-block ${className}`}
      width={width}
      height={height}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden={ariaHidden}
      style={{
        // Réserve l'espace immédiatement pour éviter le CLS
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
      {...props}
    >
      {children}
    </svg>
  );
};

// Icônes communes optimisées
export const ChevronDownIcon = (props) => (
  <OptimizedSVG {...props}>
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </OptimizedSVG>
);

export const UserIcon = (props) => (
  <OptimizedSVG {...props}>
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </OptimizedSVG>
);

export const ShoppingCartIcon = (props) => (
  <OptimizedSVG {...props}>
    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </OptimizedSVG>
);

export const SearchIcon = (props) => (
  <OptimizedSVG {...props}>
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </OptimizedSVG>
);

export const HeartIcon = (props) => (
  <OptimizedSVG {...props}>
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </OptimizedSVG>
);

export const MenuIcon = (props) => (
  <OptimizedSVG {...props}>
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </OptimizedSVG>
);

export const XIcon = (props) => (
  <OptimizedSVG {...props}>
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </OptimizedSVG>
);

export const StarIcon = (props) => (
  <OptimizedSVG {...props}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </OptimizedSVG>
);

export default OptimizedSVG;
