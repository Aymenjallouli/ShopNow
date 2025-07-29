import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Dashboard components
import Sidebar from './components/Sidebar';
import Stats from './components/Stats';
import { adminService } from '../../services/adminService';

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    newUsers: [],
    topCategories: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getStats();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Redirect if not admin
  if (!isAuthenticated || !user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <Stats stats={stats} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.recentOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{order.id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {order.customer}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                ${order.total.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === 'delivered'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent orders found.</p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">New Users</h2>
                  {stats.newUsers && stats.newUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.newUsers.map((user) => (
                            <tr key={user.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.name || 'N/A'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {user.email}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No new users found.</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
                  {stats.topCategories && stats.topCategories.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Products Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.topCategories.map((category) => (
                            <tr key={category.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {category.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {category.productsCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No categories found.</p>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
                  {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.lowStockProducts.map((product) => (
                            <tr key={product.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.stock === 0
                                    ? 'bg-red-100 text-red-800'
                                    : product.stock < 5
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                ${product.price.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No low stock products found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
