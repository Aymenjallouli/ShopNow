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
    if (location.state?.activeTab === 'orders' || location.state?.orderSuccess) {
      setActiveTab('orders');
    }
    // Fetch user profile and orders
    dispatch(getUserProfile());
    dispatch(fetchUserOrders());
  }, [dispatch, location.state]);
  
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        // Keep password fields as they are (don't reset them unless user cancels)
        currentPassword: prevData.currentPassword || '',
        newPassword: prevData.newPassword || '',
        confirmPassword: prevData.confirmPassword || '',
      }));
    }
  }, [user]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const resetFormToUserData = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setFormErrors({});
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
          
          // Clear only password fields, keep the updated user data
          setFormData((prev) => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
          
          // Refresh user profile data to get the latest information
          dispatch(getUserProfile());
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-8 text-center">
          My Account
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </h2>
                <p className="text-slate-600 text-sm">{user.email}</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 shadow-sm border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                  }`}
                  onClick={() => handleTabChange('profile')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Information
                </button>
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 shadow-sm border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                  }`}
                  onClick={() => handleTabChange('orders')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Order History
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        resetFormToUserData();
                        setIsEditing(true);
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 15H9v-2l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                            formErrors.first_name 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                          }`}
                        />
                        {formErrors.first_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.first_name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                            formErrors.last_name 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                          }`}
                        />
                        {formErrors.last_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.last_name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                            formErrors.username 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                          }`}
                        />
                        {formErrors.username && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.username}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                            formErrors.email 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                          }`}
                        />
                        {formErrors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                      
                      <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Change Password (Optional)
                        </h3>
                        
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                                formErrors.currentPassword 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                              }`}
                            />
                            {formErrors.currentPassword && (
                              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formErrors.currentPassword}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                                formErrors.newPassword 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                              }`}
                            />
                            {formErrors.newPassword && (
                              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formErrors.newPassword}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white/70 backdrop-blur-sm border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 text-slate-800 placeholder-slate-400 ${
                                formErrors.confirmPassword 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'
                              }`}
                            />
                            {formErrors.confirmPassword && (
                              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          resetFormToUserData();
                        }}
                        className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-slate-300 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={authStatus === 'loading'}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl disabled:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center gap-2"
                      >
                        {authStatus === 'loading' ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          First Name
                        </h3>
                        <p className="text-slate-800 font-medium">{user.first_name}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Last Name
                        </h3>
                        <p className="text-slate-800 font-medium">{user.last_name}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                          Username
                        </h3>
                        <p className="text-slate-800 font-medium">{user.username}</p>
                      </div>
                      <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          Email Address
                        </h3>
                        <p className="text-slate-800 font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50/60 to-emerald-100/40 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/30">
                      <h3 className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0 4 4 0 018 0zm8-12v12h4a2 2 0 002-2V7a2 2 0 00-2-2h-4z" />
                        </svg>
                        Account Created
                      </h3>
                      <p className="text-emerald-800 font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Order History
                </h2>
                
                <OrderHistory orders={orders} status={ordersStatus} error={ordersError} />
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
