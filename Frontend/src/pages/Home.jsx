import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../features/products/productsSlice';
import { fetchShops } from '../features/shops/shopsSlice';
import ProductCard from '../components/ProductCard/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';
import CategorySection from '../components/products/CategorySection';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';
import Hero from '../components/shared/Hero';
import StatsSection from '../components/shared/StatsSection';
import FloatingNav from '../components/navigation/FloatingNav';
import BrowseStores from '../components/products/BrowseStores';
// Footer is now imported in App.jsx only
import { useOptimizedProducts } from '../hooks/useOptimizedSelectors';
import { useDebounce } from '../hooks/useOptimizedHooks';

const Home = memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { products, categories, status, error } = useOptimizedProducts(); // Sélecteur optimisé
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Debounce pour la recherche pour éviter les recalculs excessifs
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Refs for smooth scrolling
  const categoriesRef = useRef(null);
  const storesRef = useRef(null);
  const productsRef = useRef(null);
  const statsRef = useRef(null);

  const { list: shops, loading: shopsLoading, error: shopsError } = useSelector(s=>s.shops);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    if(!shops || !shops.length) dispatch(fetchShops());
  }, [dispatch]);

  // Hero button handlers - memoized
  const handleShopNowClick = useCallback(() => {
    productsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  const handleBrowseCategoriesClick = useCallback(() => {
    categoriesRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  // OPTIMISATION MAJEURE: Memoization des produits filtrés avec debounce
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    // Build a map of inactive shop ids for instant filtering without full refetch
    const inactiveShopIds = new Set((shops || []).filter(sh => sh.is_active === false).map(sh => sh.id));
    return products.filter(product => {
      if (!product) return false;
      // Hide product if its shop is now inactive (either via flag from API or via shops slice)
      if (product.shop_is_active === false) return false;
      if (product.shop_id && inactiveShopIds.has(product.shop_id)) return false;
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        product.category?.toString() === selectedCategory;
         
      // Search filter avec debounce
      const matchesSearch = !debouncedSearchQuery || 
        (product.name && product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      // Price range filter avec debounce
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = 
        (!debouncedPriceRange.min || productPrice >= parseFloat(debouncedPriceRange.min)) &&
        (!debouncedPriceRange.max || productPrice <= parseFloat(debouncedPriceRange.max));
      
      // Stock filter
      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.stock > 5) ||
        (stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 5) ||
        (stockFilter === 'out-of-stock' && product.stock <= 0);
        
      return matchesCategory && matchesSearch && matchesPrice && matchesStock;
    }).sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'stock':
          return (b.stock || 0) - (a.stock || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }, [products, selectedCategory, debouncedSearchQuery, debouncedPriceRange, stockFilter, sortBy, shops]);  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Faire défiler vers la section des produits avec un léger délai
    // pour laisser le temps à la liste des produits de se mettre à jour
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
  };

  const handleStockFilterChange = (filter) => {
    setStockFilter(filter);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setStockFilter('all');
    setSortBy('name');
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (status === 'failed') {
    return <ErrorMessage message={error || 'Failed to load products. Please try again later.'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Hero 
        onShopNowClick={handleShopNowClick}
        onBrowseCategoriesClick={handleBrowseCategoriesClick}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Categories Section */}
        <div ref={categoriesRef}>
          <CategorySection 
            categories={categories} 
            onCategorySelect={handleCategoryChange}
            selectedCategory={selectedCategory}
          />
        </div>
        
        {/* Browse Stores Section */}
        <div ref={storesRef}>
          <BrowseStores shops={shops} loading={shopsLoading} error={shopsError} limit={shops.length || 8} showAll />
        </div>

  {/* Products Section */}
        <div ref={productsRef} className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">{t('home.productsTitle')}</h1>
              <p className="text-lg text-slate-600">{t('home.productsSubtitle')}</p>
            </div>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all duration-200 flex items-center gap-2 border border-slate-200 hover:border-emerald-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('home.clearAllFilters')}
            </button>
          </div>
          
          {/* Results Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {t('home.productsFound', { count: filteredProducts.length })}
                  </p>
                  {selectedCategory !== 'all' && (
                    <p className="text-sm text-slate-600">
                      {t('home.in')} <span className="font-semibold text-emerald-700">{categories.find(c => c.id.toString() === selectedCategory)?.name}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max || stockFilter !== 'all') && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-700">{t('home.filtersActive')}</span>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                  >
                    {t('home.clear')}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Products Grid with Sidebar Filters */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Vertical Filters Sidebar */}
            <div className="lg:w-1/4 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{t('home.smartFilters')}</h3>
                      <p className="text-sm text-slate-600">{t('home.findExactly')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('home.searchProducts')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('home.searchPlaceholder')}
                      className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 placeholder-slate-400 transition-all duration-200"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('home.category')}</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 appearance-none cursor-pointer transition-all duration-200"
                    >
                      <option value="all">{t('home.allCategories')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Stock Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('home.availability')}</label>
                  <div className="relative">
                    <select
                      value={stockFilter}
                      onChange={(e) => handleStockFilterChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 appearance-none cursor-pointer transition-all duration-200"
                    >
                      <option value="all">{t('home.allProducts')}</option>
                      <option value="in-stock">{t('home.inStock')}</option>
                      <option value="low-stock">{t('home.lowStock')}</option>
                      <option value="out-of-stock">{t('home.outOfStock')}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('home.sortBy')}</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 appearance-none cursor-pointer transition-all duration-200"
                    >
                      <option value="name">{t('home.nameAZ')}</option>
                      <option value="price-low">{t('home.priceLow')}</option>
                      <option value="price-high">{t('home.priceHigh')}</option>
                      <option value="stock">{t('home.stockHigh')}</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
                    <span>💵</span>
                    <span>{t('home.priceRange')}</span>
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={t('home.minPrice')}
                        value={priceRange.min}
                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                        className="w-full px-4 py-3 pl-8 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 transition-all duration-200"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">$</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={t('home.maxPrice')}
                        value={priceRange.max}
                        onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                        className="w-full px-4 py-3 pl-8 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 transition-all duration-200"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">$</span>
                    </div>
                  </div>
                </div>
                
                {/* Reset Filters Button */}
                <button
                  onClick={clearAllFilters}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('home.resetAllFilters')}
                </button>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="lg:w-3/4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                  <div className="max-w-md mx-auto">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-sm">🔍</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.noProductsFound')}</h3>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                      {t('home.noProductsFoundDesc')} <br />
                      {t('home.tryAdjusting')}
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={clearAllFilters}
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
                      >
                        🔄 {t('home.clearAllFilters')}
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors duration-200"
                      >
                        🏠 {t('home.browseAllProducts')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product?.id || Math.random()} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div ref={statsRef}>
        <StatsSection products={products} categories={categories} />
      </div>
      
      {/* Floating Navigation */}
      <FloatingNav 
        categoriesRef={categoriesRef}
        storesRef={storesRef}
        productsRef={productsRef}
        statsRef={statsRef}
      />
      
      {/* Footer */}
  
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
