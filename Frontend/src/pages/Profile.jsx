import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../features/auth/authSlice';
import { fetchUserOrders } from '../features/orders/ordersSlice';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import OrderHistory from '../components/OrderHistory';
import { toast } from 'react-toastify';

const Profile = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, status: authStatus, error: authError } = useSelector((state) => state.auth);
  const { orders, status: ordersStatus, error: ordersError } = useSelector((state) => state.orders);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Check if there's a success message from checkout
    if (location.state?.orderSuccess) {
      toast.success('Your order was placed successfully!');
    }
    
    // Fetch user profile and orders
    dispatch(getUserProfile());
    dispatch(fetchUserOrders());
  }, [dispatch, location.state]);
  
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Only validate password fields if user is changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Only include password fields if user is changing password
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
      };
      
      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }
      
      dispatch(updateUserProfile(updateData))
        .unwrap()
        .then(() => {
          setIsEditing(false);
          alert('Profile updated successfully');
          
          // Clear password fields
          setFormData((prev) => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        })
        .catch((error) => {
          // Show error message
          alert(`Failed to update profile: ${error}`);
        });
    }
  };
  
  if (authStatus === 'loading' || !user) {
    return <Loader />;
  }
  
  if (authStatus === 'failed') {
    return <ErrorMessage message={authError} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-1">
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleTabChange('profile')}
              >
                Profile Information
              </button>
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeTab === 'orders'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleTabChange('orders')}
              >
                Order History
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${
                            formErrors.first_name ? 'border-red-300' : 'border-gray-200'
                          } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                        />
                        {formErrors.first_name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${
                            formErrors.last_name ? 'border-red-300' : 'border-gray-200'
                          } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                        />
                        {formErrors.last_name && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${
                            formErrors.username ? 'border-red-300' : 'border-gray-200'
                          } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                        />
                        {formErrors.username && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${
                            formErrors.email ? 'border-red-300' : 'border-gray-200'
                          } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password (Optional)</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleChange}
                              className={`mt-1 block w-full border ${
                                formErrors.currentPassword ? 'border-red-300' : 'border-gray-200'
                              } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                            />
                            {formErrors.currentPassword && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                              New Password
                            </label>
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className={`mt-1 block w-full border ${
                                formErrors.newPassword ? 'border-red-300' : 'border-gray-200'
                              } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                            />
                            {formErrors.newPassword && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`mt-1 block w-full border ${
                                formErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                              } bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700`}
                            />
                            {formErrors.confirmPassword && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            username: user.username || '',
                            email: user.email || '',
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                          setFormErrors({});
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={authStatus === 'loading'}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {authStatus === 'loading' ? (
                          <Loader size="sm" />
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.first_name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.last_name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-6">Order History</h2>
                
                <OrderHistory orders={orders} status={ordersStatus} error={ordersError} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
