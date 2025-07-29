import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productsSlice';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Hero from '../components/Hero';

const Home = () => {
  const dispatch = useDispatch();
  const { products = [], categories = [], status, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    // Fetch categories if not already loaded
    // dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (!product) return false;
    
    const matchesCategory = selectedCategory === 'all' || 
      (product.category && 
       product.category.id && 
       product.category.id.toString() === selectedCategory);
       
    const matchesSearch = 
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesCategory && matchesSearch;
  }) : [];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (status === 'failed') {
    return <ErrorMessage message={error || 'Failed to load products. Please try again later.'} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center bg-white rounded-lg shadow p-3">
                <img
                  src={cat.image && cat.image.startsWith('http') ? cat.image : 'https://via.placeholder.com/100'}
                  alt={cat.name}
                  className="h-16 w-16 object-cover rounded-full mb-2"
                />
                <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Products Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h1>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 placeholder-gray-400"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found. Try changing your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product?.id || Math.random()} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
