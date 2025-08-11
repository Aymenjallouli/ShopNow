import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FloatingNav = ({ categoriesRef, storesRef, productsRef, statsRef }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true); // Toujours visible par défaut
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      // Determine active section
      const scrollPosition = window.pageYOffset + 100;
      
      if (categoriesRef?.current && productsRef?.current && statsRef?.current) {
        const categoriesTop = categoriesRef.current.offsetTop;
        const storesTop = storesRef?.current ? storesRef.current.offsetTop : null;
        const productsTop = productsRef.current.offsetTop;
        const statsTop = statsRef.current.offsetTop;
        
        if (scrollPosition >= statsTop) {
          setActiveSection('stats');
        } else if (storesTop !== null && scrollPosition >= storesTop && scrollPosition < productsTop) {
          setActiveSection('stores');
        } else if (scrollPosition >= productsTop) {
          setActiveSection('products');
        } else if (scrollPosition >= categoriesTop) {
          setActiveSection('categories');
        } else {
          setActiveSection('');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categoriesRef, productsRef, statsRef]);

  const scrollToSection = (ref, section) => {
    ref?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    setActiveSection(section);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setActiveSection('');
  };

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 py-4 px-3">
        <div className="flex flex-col space-y-3">
          {/* Home */}
          <button
            onClick={scrollToTop}
            className={`p-3 rounded-xl transition-all duration-200 group relative ${
              activeSection === '' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title="Go to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="absolute right-full mr-4 px-3 py-2 text-xs bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              🏠 {t('navigation.home', 'Home')}
            </span>
          </button>

          {/* Categories */}
          {categoriesRef?.current && (
            <button
              onClick={() => scrollToSection(categoriesRef, 'categories')}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                activeSection === 'categories' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title="Browse categories"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="absolute right-full mr-4 px-3 py-2 text-xs bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                📂 {t('navigation.categories', 'Categories')}
              </span>
            </button>
          )}

          {/* Stores */}
          {storesRef?.current && (
            <button
              onClick={() => scrollToSection(storesRef, 'stores')}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                activeSection === 'stores' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title="Browse stores"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l1-4a1 1 0 011-.75h14a1 1 0 011 .75l1 4M4 9h16v10a1 1 0 01-1 1h-5v-5H10v5H5a1 1 0 01-1-1V9z" />
              </svg>
              <span className="absolute right-full mr-4 px-3 py-2 text-xs bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                🏬 {t('navigation.stores', 'Stores')}
              </span>
            </button>
          )}

          {/* Products */}
          <button
            onClick={() => scrollToSection(productsRef, 'products')}
            className={`p-3 rounded-xl transition-all duration-200 group relative ${
              activeSection === 'products' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title="View products"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="absolute right-full mr-4 px-3 py-2 text-xs bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              🛍️ {t('navigation.products', 'Products')}
            </span>
          </button>

          {/* Stats */}
          {statsRef?.current && (
            <button
              onClick={() => scrollToSection(statsRef, 'stats')}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                activeSection === 'stats' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title="View stats"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="absolute right-full mr-4 px-3 py-2 text-xs bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                📊 {t('navigation.statistics', 'Statistics')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;
