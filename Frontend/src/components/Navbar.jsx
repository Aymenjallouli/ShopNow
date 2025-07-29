import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';
import { logout } from '../features/auth/authSlice';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/' },
  { name: 'About', href: '#' },
  { name: 'Contact', href: '#' },
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
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
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
                  <Link to="/" className="text-xl font-bold text-indigo-600">
                    ShopNow
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
                      className="w-48 lg:w-64 rounded-md border-gray-200 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1 px-3 border text-gray-700 placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
                  className="relative rounded-full bg-white p-1 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-3"
                >
                  <span className="sr-only">View cart</span>
                  <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
                
                <Link
                  to="/wishlist"
                  className="relative rounded-full bg-white p-1 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-4"
                >
                  <span className="sr-only">View wishlist</span>
                  <HeartIcon className="h-6 w-6" aria-hidden="true" />
                </Link>
                
                {/* Profile dropdown */}
                {isAuthenticated ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        {user?.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.avatar}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <UserIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        )}
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                              <p className="font-medium">{user?.name}</p>
                              <p className="text-gray-500 truncate">{user?.email}</p>
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/wishlist"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Wishlist
                            </Link>
                          )}
                        </Menu.Item>
                        {user?.is_staff && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm font-medium text-indigo-600'
                                )}
                              >
                                Admin Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
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
                      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="mt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md bg-gray-50 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
