import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop: remet la page en haut à chaque navigation avec défilement fluide.
export default function ScrollToTop({ behavior = 'smooth' }) {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Utiliser requestAnimationFrame pour laisser le layout se stabiliser
    requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior });
      } catch {
        window.scrollTo(0, 0);
      }
    });
  }, [pathname, search, behavior]);
  return null;
}
