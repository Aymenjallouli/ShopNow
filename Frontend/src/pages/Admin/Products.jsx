import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import api from '../../services/api';

const ProductManagement = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category: '',
  shop: '',
    status: 'available',
    featured: false,
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await api.get('/products/');
        setProducts(Array.isArray(productsResponse.data.products) ? productsResponse.data.products : []);
        setCategories(Array.isArray(productsResponse.data.categories) ? productsResponse.data.categories : []);
        try {
          const shopsRes = await api.get('/shops/');
            const shopsData = shopsRes.data;
            const list = Array.isArray(shopsData?.results) ? shopsData.results : (Array.isArray(shopsData) ? shopsData : []);
            setShops(list);
        } catch(fetchShopsErr) {
          console.warn('Failed to fetch shops for product assignment', fetchShopsErr);
          setShops([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Redirect if not admin
  if (!isAuthenticated || !user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      stock: '',
      category: '',
  shop: '',
      status: 'available',
      featured: false,
      image: null,
    });
    setPreviewImage(null);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      stock: product.stock || '',
      category: product.category || '',
  shop: product.shop || product.shop_id || '',
      status: product.status || 'available',
      featured: product.featured,
      image: null, // Don't set the image here, just keep the existing one
    });
    setPreviewImage(product.image);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreateProduct = () => {
    resetForm();
    setSelectedProduct(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files && files[0]) {
        setFormData({
          ...formData,
          [name]: files[0],
        });
        
        // Create a preview URL for the image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: name === 'featured' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let imageUrl = formData.image;
      // Si une nouvelle image (File) est sélectionnée, uploader sur Cloudinary
      if (formData.image && typeof formData.image !== 'string') {
        const cloudData = new FormData();
        cloudData.append('file', formData.image);
        cloudData.append('upload_preset', 'ml_default');
        cloudData.append('api_key', '411164346446782');
        cloudData.append('timestamp', Math.floor(Date.now() / 1000));
        const res = await fetch('https://api.cloudinary.com/v1_1/duluvuhp4/image/upload', {
          method: 'POST',
          body: cloudData
        });
        const data = await res.json();
        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          // Log détaillé Cloudinary
          console.error('Cloudinary upload error:', data);
          if (res.status !== 200) {
            console.error('Cloudinary HTTP status:', res.status, res.statusText);
          }
          throw new Error('Cloudinary upload failed: ' + (data.error?.message || JSON.stringify(data)));
        }
      }
      // Préparer les données à envoyer au backend (image = url Cloudinary)
      const payload = { ...formData, image: imageUrl };
      if(payload.shop === '') {
        // Prevent sending empty string, backend expects null or omitted
        delete payload.shop;
      }
      // Si image n'a pas changé (string déjà url), on garde
      // Si image supprimée, envoyer null
      if (!imageUrl) payload.image = null;
      let response;
      if (isCreating) {
        response = await api.post('/products/', payload);
        setProducts([...products, response.data]);
      } else {
        response = await api.put(`/products/${selectedProduct.id}/`, payload);
        setProducts(products.map(p => p.id === selectedProduct.id ? response.data : p));
      }
      setIsEditing(false);
      setIsCreating(false);
      setSelectedProduct(null);
      resetForm();
      setError(null);
    } catch (err) {
      setError(`Failed to ${isCreating ? 'create' : 'update'} product`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/products/${productId}/`);
      
      // Remove the product from the list
      setProducts(products.filter(p => p.id !== productId));
      
      if (selectedProduct && selectedProduct.id === productId) {
        setIsEditing(false);
        setSelectedProduct(null);
        resetForm();
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent">
              Product Management
            </h1>
            
            <button
              onClick={handleCreateProduct}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4.5M20 7v10l-8 4.5M4 7v10l-8 4.5m8-4.5v10" />
                  </svg>
                  Products ({Array.isArray(products) ? products.length : 0})
                </h2>
                
                {loading && !products.length ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {Array.isArray(products) && products.length > 0 && products.map((product) => (
                          <tr 
                            key={product.id} 
                            className={`hover:bg-slate-50/50 transition-all duration-200 ${
                              selectedProduct?.id === product.id ? 'bg-emerald-50 ring-2 ring-emerald-200/50' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img
                                    className="h-12 w-12 rounded-xl object-cover shadow-md border border-slate-200"
                                    src={product.image || 'https://via.placeholder.com/150'}
                                    alt={product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {product.category_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-slate-900">${product.price}</div>
                              {product.discount_price && (
                                <div className="text-sm font-medium text-emerald-600">${product.discount_price}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-700">{product.stock}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.status === 'available' ? (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Available
                                </span>
                              ) : (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                  Unavailable
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSelectProduct(product)}
                                  className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors hover:underline"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-800 font-medium transition-colors hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Edit/Create Form */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 15H9v-2l8.586-8.586z" />
                  </svg>
                  {isCreating ? 'Add New Product' : isEditing ? 'Edit Product' : 'Product Details'}
                </h2>
                
                {(isEditing || isCreating) ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 appearance-none"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Shop <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="shop"
                          value={formData.shop}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 appearance-none"
                        >
                          <option value="">Select a shop</option>
                          {shops.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none"
                        placeholder="Enter product description"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Discount Price ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                          <input
                            type="number"
                            name="discount_price"
                            value={formData.discount_price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                        placeholder="Enter stock quantity"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Product Image
                      </label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                      
                      {previewImage && (
                        <div className="mt-4">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-xl shadow-md border border-slate-200"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 appearance-none"
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                      <input
                        id="featured"
                        name="featured"
                        type="checkbox"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-3 text-sm font-medium text-slate-700">
                        Featured Product
                      </label>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                          setSelectedProduct(null);
                          resetForm();
                        }}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 border border-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {isCreating ? 'Create Product' : 'Save Changes'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4.5M20 7v10l-8 4.5M4 7v10l-8 4.5m8-4.5v10" />
                    </svg>
                    <p className="mt-4 text-slate-600 font-medium">Select a product to edit or click 'Add New Product'</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductManagement;
