import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';
import { logout, fetchCurrentUser } from '../features/auth/authSlice';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug: log user data to see what's available
  console.log('Navbar - isAuthenticated:', isAuthenticated, 'user:', user);
  
  // Fetch user data when authenticated but user data is missing
  useEffect(() => {
    if (isAuthenticated && !user && localStorage.getItem('token')) {
      console.log('Fetching current user data from navbar...');
      // Small delay to prevent race conditions with App.jsx initialization
      const timeoutId = setTimeout(() => {
        dispatch(fetchCurrentUser());
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, dispatch]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
  navigate('/login');
  };
  
  return (
    <Disclosure as="nav" className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50 fixed w-full top-0 z-[9998]">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-all duration-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center space-x-2 group">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      ShopNow
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <form onSubmit={handleSearch} className="hidden sm:block mr-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 lg:w-64 rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-4 border text-slate-700 placeholder-slate-400 transition-all duration-200"
                    />
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600 transition-colors duration-200"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
                
                <Link
                  to="/cart"
                  className="relative rounded-lg bg-slate-50 p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mr-3 transition-all duration-200"
                >
                  <span className="sr-only">View cart</span>
                  <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </Link>
                
                <Link
                  to="/wishlist"
                  className="relative rounded-lg bg-slate-50 p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mr-4 transition-all duration-200"
                >
                  <span className="sr-only">View wishlist</span>
                  <HeartIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
                
                {/* Profile dropdown */}
                {isAuthenticated ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 p-1 hover:bg-emerald-50 transition-all duration-200">
                        <span className="sr-only">Open user menu</span>
                        {user?.avatar ? (
                          <img
                            className="h-7 w-7 rounded-lg object-cover"
                            src={user.avatar}
                            alt={user.first_name || user.name || user.username || 'User'}
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`h-7 w-7 rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-600 ${user?.avatar ? 'hidden' : ''}`}>
                          <UserIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-[9999] mt-2 w-48 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-200 focus:outline-none border border-slate-100">
                        {/* User Info Section - Show loading state if user data not available */}
                        <Menu.Item>
                          {({ active }) => (
                            <div className="px-4 py-3 text-sm text-slate-700 border-b border-slate-100">
                              {user ? (
                                <>
                                  <p className="font-semibold text-slate-900">
                                    {user.first_name && user.last_name 
                                      ? `${user.first_name} ${user.last_name}` 
                                      : user.name || user.username || user.email || 'User'
                                    }
                                  </p>
                                  <p className="text-slate-500 truncate text-xs">{user.email || 'No email'}</p>
                                </>
                              ) : (
                                <div className="animate-pulse">
                                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </Menu.Item>
                        
                        {/* Profile Link */}
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700',
                                'flex items-center px-4 py-2 text-sm transition-colors duration-200'
                              )}
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        
                        {/* Wishlist Link */}
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/wishlist"
                              className={classNames(
                                active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700',
                                'flex items-center px-4 py-2 text-sm transition-colors duration-200'
                              )}
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              Wishlist
                            </Link>
                          )}
                        </Menu.Item>
                        
                        {/* Admin Dashboard Link - Show if user is staff or loading */}
                        {user ? (
                          user.is_staff && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/admin"
                                  className={classNames(
                                    active ? 'bg-emerald-50 text-emerald-600' : 'text-emerald-600',
                                    'flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 border-t border-slate-100 mt-1'
                                  )}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  Admin Dashboard
                                </Link>
                              )}
                            </Menu.Item>
                          )
                        ) : (
                          // Show loading placeholder while checking if user is admin
                          <Menu.Item>
                            {({ active }) => (
                              <div className="flex items-center px-4 py-2 text-sm text-slate-400 border-t border-slate-100 mt-1">
                                <div className="animate-pulse flex items-center">
                                  <div className="w-4 h-4 bg-slate-200 rounded mr-3"></div>
                                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                                </div>
                              </div>
                            )}
                          </Menu.Item>
                        )}
                        
                        {/* Sign Out Button */}
                        {user?.role === 'shop_owner' && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/my-shop"
                                className={classNames(
                                  active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700',
                                  'flex items-center px-4 py-2 text-sm transition-colors duration-200'
                                )}
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4" />
                                </svg>
                                My Shop
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                       
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-red-50 text-red-600' : 'text-slate-700',
                                'flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-200 border-t border-slate-100 mt-1'
                              )}
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="text-slate-600 hover:text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-emerald-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-emerald-200"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 bg-white/95 backdrop-blur-lg border-t border-slate-200/50">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
                >
                  {item.name}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="mt-3 px-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border-slate-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-4 border text-slate-700 placeholder-slate-400 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
