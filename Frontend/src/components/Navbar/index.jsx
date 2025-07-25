import React, { useState, Fragment, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, Popover, Transition, Menu } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../features/auth/authSlice';

const navigation = {
  categories: [
    {
      id: 'products',
      name: 'Products',
      featured: [
        {
          name: 'Electronics',
          href: '/products?category=electronics',
          imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-01.jpg',
          imageAlt: 'Electronics and gadgets category thumbnail',
        },
        {
          name: 'Clothing',
          href: '/products?category=clothing',
          imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-02.jpg',
          imageAlt: 'Clothing category thumbnail',
        },
        {
          name: 'Home & Kitchen',
          href: '/products?category=home',
          imageSrc: 'https://tailwindui.com/img/ecommerce-images/mega-menu-category-03.jpg',
          imageAlt: 'Home and kitchen category thumbnail',
        },
      ],
      sections: [
        {
          id: 'electronics',
          name: 'Electronics',
          items: [
            { name: 'Smartphones', href: '/products?category=electronics&subcategory=smartphones' },
            { name: 'Laptops', href: '/products?category=electronics&subcategory=laptops' },
            { name: 'Audio', href: '/products?category=electronics&subcategory=audio' },
            { name: 'Cameras', href: '/products?category=electronics&subcategory=cameras' },
            { name: 'Accessories', href: '/products?category=electronics&subcategory=accessories' },
          ],
        },
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Men', href: '/products?category=clothing&subcategory=men' },
            { name: 'Women', href: '/products?category=clothing&subcategory=women' },
            { name: 'Kids', href: '/products?category=clothing&subcategory=kids' },
            { name: 'Shoes', href: '/products?category=clothing&subcategory=shoes' },
            { name: 'Accessories', href: '/products?category=clothing&subcategory=accessories' },
          ],
        },
        {
          id: 'home',
          name: 'Home & Kitchen',
          items: [
            { name: 'Furniture', href: '/products?category=home&subcategory=furniture' },
            { name: 'Decor', href: '/products?category=home&subcategory=decor' },
            { name: 'Kitchen', href: '/products?category=home&subcategory=kitchen' },
            { name: 'Bedding', href: '/products?category=home&subcategory=bedding' },
            { name: 'Lighting', href: '/products?category=home&subcategory=lighting' },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Deals', href: '/products?on_sale=true' },
  ],
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth and cart state from Redux
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items = [] } = useSelector(state => state.cart);
  
  const cartItemsCount = items.length;
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                <div className="flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile navigation categories */}
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {navigation.pages.map((page) => (
                    <div key={page.name} className="flow-root">
                      <Link to={page.href} className="-m-2 block p-2 font-medium text-gray-900">
                        {page.name}
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Mobile navigation sections */}
                {navigation.categories.map((category) => (
                  <div key={category.id} className="space-y-6 border-t border-gray-200 px-4 py-6">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                            <img
                              src={item.imageSrc}
                              alt={item.imageAlt}
                              className="object-cover object-center"
                            />
                          </div>
                          <Link to={item.href} className="mt-2 block font-medium text-gray-900">
                            {item.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                    
                    {category.sections.map((section) => (
                      <div key={section.id}>
                        <p className="font-medium text-gray-900">{section.name}</p>
                        <ul className="mt-2 space-y-2">
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <Link to={item.href} className="-m-2 block p-2 text-gray-500">
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Mobile auth links */}
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  <div className="flow-root">
                    {isAuthenticated ? (
                      <Link to="/profile" className="-m-2 block p-2 font-medium text-gray-900">
                        My Account
                      </Link>
                    ) : (
                      <Link to="/login" className="-m-2 block p-2 font-medium text-gray-900">
                        Sign in
                      </Link>
                    )}
                  </div>
                  {isAuthenticated && (
                    <div className="flow-root">
                      <button
                        onClick={handleLogout}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <header className="relative bg-white">
        {/* Top navigation */}
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex flex-1 items-center lg:flex-none">
                <Link to="/" className="flex items-center">
                  <span className="sr-only">ShopNow</span>
                  <span className="text-2xl font-bold text-indigo-600">ShopNow</span>
                </Link>
              </div>

              {/* Flyout menus */}
              <Popover.Group className="hidden lg:flex lg:gap-x-8">
                {/* Products dropdown */}
                <Popover className="relative">
                  <Popover.Button className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-indigo-600">
                    Products
                    <svg
                      className="h-5 w-5 flex-none text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Popover.Panel className="absolute -left-8 top-full z-10 w-screen max-w-screen-xl overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-900/5">
                      <div className="p-4">
                        {navigation.categories[0].sections.map((section) => (
                          <div
                            key={section.id}
                            className="relative flex items-start p-4 rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{section.name}</p>
                              <ul className="mt-2 space-y-2">
                                {section.items.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      to={item.href}
                                      className="text-sm text-gray-500 hover:text-indigo-600"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-gray-900/5 bg-gray-50">
                        {navigation.categories[0].featured.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>

                {/* Static navigation pages */}
                {navigation.pages.map((page) => (
                  <NavLink
                    key={page.name}
                    to={page.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600',
                        'flex items-center text-sm font-medium'
                      )
                    }
                  >
                    {page.name}
                  </NavLink>
                ))}
              </Popover.Group>

              {/* Search, account, and cart */}
              <div className="flex flex-1 items-center justify-end">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex lg:ml-6">
                  <div className="relative mr-3 flex-1 rounded-md shadow-sm">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Account */}
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  {isAuthenticated ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex items-center rounded-full text-gray-700 hover:text-indigo-600">
                          <span className="sr-only">Open user menu</span>
                          <UserIcon className="h-6 w-6" aria-hidden="true" />
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
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                My Account
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/orders"
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                My Orders
                              </Link>
                            )}
                          </Menu.Item>
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
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                    >
                      Sign in
                    </Link>
                  )}
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <Link to="/cart" className="group -m-2 flex items-center p-2">
                    <ShoppingBagIcon
                      className="h-6 w-6 flex-shrink-0 text-gray-700 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                      {cartItemsCount}
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </Link>
                </div>
                
                {/* Mobile menu button */}
                <div className="ml-4 lg:hidden">
                  <button
                    type="button"
                    className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setOpen(true)}
                  >
                    <span className="sr-only">Open menu</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
