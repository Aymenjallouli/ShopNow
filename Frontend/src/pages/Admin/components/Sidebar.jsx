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
  { name: 'Shops', href: '/admin/shops', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/admin/orders', icon: CurrencyDollarIcon },
  ];
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white border-r border-slate-700">
      <div className="flex items-center justify-center h-16 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            ShopNow Admin
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location.pathname === item.href
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-700 bg-slate-800/30 space-y-1">
        <Link
          to="/"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <ArrowLeftIcon className="mr-3 flex-shrink-0 h-4 w-4" aria-hidden="true" />
          Back to Shop
        </Link>
        
        <Link
          to="/admin/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <Cog6ToothIcon className="mr-3 flex-shrink-0 h-4 w-4" aria-hidden="true" />
          Settings
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 flex-shrink-0 h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
