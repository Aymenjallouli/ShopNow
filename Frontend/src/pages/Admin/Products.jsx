import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import api from '../../services/api';

const ProductManagement = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-gray-800">Product Management</h1>
            
            <button
              onClick={handleCreateProduct}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add New Product
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product List */}
            <div className="col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Products</h2>
                
                {loading && !products.length ? (
                  <p className="text-gray-500">Loading products...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(products) && products.length > 0 && products.map((product) => (
                          <tr key={product.id} className={selectedProduct?.id === product.id ? 'bg-indigo-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={product.image || 'https://via.placeholder.com/150'}
                                    alt={product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.category_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${product.price}</div>
                              {product.discount_price && (
                                <div className="text-sm text-red-600">${product.discount_price}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.status === 'available' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Available
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Unavailable
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleSelectProduct(product)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
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
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isCreating ? 'Add New Product' : isEditing ? 'Edit Product' : 'Product Details'}
                </h2>
                
                {(isEditing || isCreating) ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Nom du produit"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Description"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                          placeholder="Prix"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Price ($)
                        </label>
                        <input
                          type="number"
                          name="discount_price"
                          value={formData.discount_price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                          placeholder="Prix promotionnel"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Stock"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      />
                      
                      {previewImage && (
                        <div className="mt-2">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center">
                        <input
                          id="featured"
                          name="featured"
                          type="checkbox"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                          Featured Product
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                          setSelectedProduct(null);
                          resetForm();
                        }}
                        className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {loading ? 'Saving...' : isCreating ? 'Create Product' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Select a product to edit or click 'Add New Product'</p>
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
