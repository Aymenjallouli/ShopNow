import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../features/auth/authSlice';

// Icons
import { 
  UserIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UserIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon },
    { name: 'Orders', href: '/admin/orders', icon: CurrencyDollarIcon },
  ];
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-indigo-700 text-white">
      <div className="flex items-center justify-center h-16 border-b border-indigo-600">
        <h2 className="text-2xl font-bold">ShopNow Admin</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-5 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location.pathname === item.href
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-6 w-6"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-indigo-600">
        <Link
          to="/"
          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
        >
          <ArrowLeftIcon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
          Back to Shop
        </Link>
        
        <Link
          to="/admin/settings"
          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
        >
          <Cog6ToothIcon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
          Settings
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
