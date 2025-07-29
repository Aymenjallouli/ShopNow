import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import api from '../../services/api';

const CategoryManagement = () => {
  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
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
        [name]: value,
      });
    }
  };
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch categories
  // Handler to start creating a new category
  const handleCreateCategory = () => {
    resetForm();
    setSelectedCategory(null);
    setIsEditing(false);
    setIsCreating(true);
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories/');
        setCategories(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Redirect if not admin
  if (!isAuthenticated || !user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      image: null,
    });
    setPreviewImage(null);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      status: category.status || 'active',
      image: null, // Don't set the image here, just keep the existing one
    });
    setPreviewImage(category.image);
    setIsEditing(true);
    setIsCreating(false);
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
          throw new Error('Cloudinary upload failed');
        }
      }
      // Préparer les données à envoyer au backend (image = url Cloudinary)
      const payload = { ...formData, image: imageUrl };
      if (!imageUrl) payload.image = null;
      let response;
      if (isCreating) {
        response = await api.post('/categories/', payload);
        setCategories([...categories, response.data]);
      } else {
        response = await api.put(`/categories/${selectedCategory.id}/`, payload);
        setCategories(categories.map(c => c.id === selectedCategory.id ? response.data : c));
      }
      setIsEditing(false);
      setIsCreating(false);
      setSelectedCategory(null);
      resetForm();
      setError(null);
    } catch (err) {
      setError(`Failed to ${isCreating ? 'create' : 'update'} category`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
// ...existing code...

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) return;
    
    try {
      setLoading(true);
      await api.delete(`/categories/${categoryId}/`);
      
      // Remove the category from the list
      setCategories(categories.filter(c => c.id !== categoryId));
      
      if (selectedCategory && selectedCategory.id === categoryId) {
        setIsEditing(false);
        setSelectedCategory(null);
        resetForm();
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to delete category. It may have products associated with it.');
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
            <h1 className="text-3xl font-semibold text-gray-800">Category Management</h1>
            
            <button
              onClick={handleCreateCategory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add New Category
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category List */}
            <div className="col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                
                {loading && !categories.length ? (
                  <p className="text-gray-500">Loading categories...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
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
                        {categories.map((category) => (
                          <tr key={category.id} className={selectedCategory?.id === category.id ? 'bg-indigo-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={category.image && category.image.startsWith('http') ? category.image : 'https://via.placeholder.com/150'}
                                    alt={category.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {category.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {category.description || 'No description'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {category.status === 'active' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleSelectCategory(category)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
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
            
            {/* Category Edit/Create Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isCreating ? 'Add New Category' : isEditing ? 'Edit Category' : 'Category Details'}
                </h2>
                
                {(isEditing || isCreating) ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Nom de la catégorie"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Description"
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Image
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
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                          setSelectedCategory(null);
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
                        {loading ? 'Saving...' : isCreating ? 'Create Category' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Select a category to edit or click 'Add New Category'</p>
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

export default CategoryManagement;
