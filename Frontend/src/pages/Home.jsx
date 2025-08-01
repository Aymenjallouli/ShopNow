import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productsSlice';
import ProductCard from '../components/ProductCard/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import FloatingNav from '../components/FloatingNav';
import Footer from '../components/Footer';

const Home = () => {
  const dispatch = useDispatch();
  const { products = [], categories = [], status, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in-stock', 'out-of-stock', 'low-stock'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price-low', 'price-high', 'stock'

  // Refs for smooth scrolling
  const categoriesRef = useRef(null);
  const productsRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts());
    // Fetch categories if not already loaded
    // dispatch(fetchCategories());
  }, [dispatch]);

  // Hero button handlers
  const handleShopNowClick = () => {
    productsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleBrowseCategoriesClick = () => {
    if (categories && categories.length > 0) {
      categoriesRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // If no categories, scroll to products
      productsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (!product) return false;
    
    // Debug: log product structure
    console.log('Filtering product:', product);
    console.log('Selected category:', selectedCategory);
    console.log('Product category:', product.category);
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      product.category?.toString() === selectedCategory;
       
    // Search filter
    const matchesSearch = 
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Price range filter
    const productPrice = parseFloat(product.price) || 0;
    const matchesPrice = 
      (!priceRange.min || productPrice >= parseFloat(priceRange.min)) &&
      (!priceRange.max || productPrice <= parseFloat(priceRange.max));
    
    // Stock filter
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.stock > 5) ||
      (stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 5) ||
      (stockFilter === 'out-of-stock' && product.stock <= 0);
    
    console.log('Filter results:', { matchesCategory, matchesSearch, matchesPrice, matchesStock });
      
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
  }) : [];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
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
        {categories && categories.length > 0 && (
          <div ref={categoriesRef} className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">Shop by Category</h2>
              <p className="text-lg text-slate-600">Find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`group flex flex-col items-center bg-white rounded-xl shadow-sm hover:shadow-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 ${
                    selectedCategory === cat.id.toString() ? 'ring-2 ring-emerald-500 bg-emerald-50 shadow-xl border-emerald-200' : 'hover:border-emerald-200'
                  }`}
                  onClick={() => handleCategoryChange(cat.id.toString())}
                >
                  <div className="relative mb-4">
                    <img
                      src={cat.image && cat.image.startsWith('http') ? cat.image : 'https://via.placeholder.com/120'}
                      alt={cat.name}
                      className="h-20 w-20 object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                    />
                    {selectedCategory === cat.id.toString() && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-sm font-semibold text-center transition-colors duration-200 ${
                    selectedCategory === cat.id.toString() ? 'text-emerald-600' : 'text-slate-800 group-hover:text-emerald-600'
                  }`}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Products Section */}
        <div ref={productsRef} className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Our Products</h1>
              <p className="text-lg text-slate-600">Discover our amazing collection</p>
            </div>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-all duration-200 flex items-center gap-2 border border-slate-200 hover:border-emerald-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All Filters
            </button>
          </div>
          
          {/* Advanced Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Smart Filters</h3>
                  <p className="text-sm text-slate-600">Find exactly what you're looking for</p>
                </div>
              </div>
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset All</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Search Products</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or description..."
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
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Categories</option>
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
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Availability</label>
                <div className="relative">
                  <select
                    value={stockFilter}
                    onChange={(e) => handleStockFilterChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Products</option>
                    <option value="in-stock">✅ In Stock (5+)</option>
                    <option value="low-stock">⚠️ Low Stock (1-5)</option>
                    <option value="out-of-stock">❌ Out of Stock</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Sort By */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Sort By</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="name">📝 Name (A-Z)</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="stock">📦 Stock: High to Low</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Price Range */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-6 border border-slate-200/50">
              <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center space-x-2">
                <span>💵</span>
                <span>Price Range</span>
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="w-full px-4 py-3 pl-8 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 transition-all duration-200"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">$</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Max price"
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="w-full px-4 py-3 pl-8 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 transition-all duration-200"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">$</span>
                </div>
              </div>
            </div>
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
                    <span className="text-2xl text-emerald-600">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                  {selectedCategory !== 'all' && (
                    <p className="text-sm text-slate-600">
                      in <span className="font-semibold text-emerald-700">{categories.find(c => c.id.toString() === selectedCategory)?.name}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {(searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max || stockFilter !== 'all') && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-700">Filters Active</span>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Products Grid */}
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
                <h3 className="text-xl font-bold text-slate-900 mb-3">No products found</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  We couldn't find any products matching your criteria. <br />
                  Try adjusting your filters or search terms.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-105 transition-all duration-200"
                  >
                    🔄 Clear All Filters
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors duration-200"
                  >
                    🏠 Browse All Products
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product?.id || Math.random()} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Section */}
      <div ref={statsRef}>
        <StatsSection products={products} categories={categories} />
      </div>
      
      {/* Floating Navigation */}
      <FloatingNav 
        categoriesRef={categoriesRef}
        productsRef={productsRef}
        statsRef={statsRef}
      />
      
      {/* Footer */}
  
    </div>
  );
};

export default Home;
