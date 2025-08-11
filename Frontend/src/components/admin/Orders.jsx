import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import api from '../../services/api';

const OrderManagement = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch orders function hoisted so it can be reused
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/admin/');
      setOrders(response.data.orders || []);
      setStats(response.data.stats || null);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Redirect if not admin
  if (!isAuthenticated || !user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await api.patch('/orders/admin/', { order_id: orderId, status: newStatus });
      // refresh list quickly
      await fetchOrders();
      // keep selected order updated
      const updated = orders.find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);
      setError(null);
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Get order status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          <h1 className="text-3xl font-semibold text-gray-800">Order Management</h1>
          {stats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <p className="text-xs uppercase text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold">{stats.total_orders}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-xs uppercase text-gray-500">Revenue</p>
                <p className="text-2xl font-semibold">${stats.total_revenue.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-xs uppercase text-gray-500">30d Orders</p>
                <p className="text-2xl font-semibold">{stats.orders_last_30d}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-xs uppercase text-gray-500">30d Revenue</p>
                <p className="text-2xl font-semibold">${stats.revenue_last_30d.toFixed(2)}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order List */}
            <div className="col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Orders</h2>
                
                {loading && !orders.length ? (
                  <p className="text-gray-500">Loading orders...</p>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-gray-500">No orders found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
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
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className={selectedOrder?.id === order.id ? 'bg-indigo-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.customer_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customer_email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${parseFloat(order.total_price).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleSelectOrder(order)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View
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
            
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Order Details
                </h2>
                
        {selectedOrder ? (
                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Order #{selectedOrder.id}</h3>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Customer:</span> {selectedOrder.customer_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {selectedOrder.customer_email || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span> {selectedOrder.customer_phone || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <address className="text-sm text-gray-600 not-italic">
                        {selectedOrder.shipping_address || 'No shipping address provided.'}
                      </address>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Order Items</h4>
          {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
          {selectedOrder.items.map((item, index) => (
            <li key={index} className="py-2">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
              {parseFloat(item.subtotal).toFixed(2)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No items in this order.</p>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-base font-medium mt-4">
                        <p>Total</p>
        <p>${parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium mb-2">Update Status</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {['pending','processing','shipped','delivered','cancelled'].map((st,idx,array)=>{
                          const isActive = selectedOrder.status === st;
                          const colorMap = {
                            pending: 'text-yellow-600 hover:text-yellow-700',
                            processing: 'text-blue-600 hover:text-blue-700',
                            shipped: 'text-purple-600 hover:text-purple-700',
                            delivered: 'text-green-600 hover:text-green-700',
                            cancelled: 'text-red-600 hover:text-red-700'
                          };
                          return (
                            <div key={st} className="flex items-center">
                              <button
                                disabled={isActive}
                                onClick={()=>!isActive && handleStatusChange(selectedOrder.id, st)}
                                className={`font-medium transition-colors ${isActive ? 'text-gray-400 cursor-default' : colorMap[st]} ${!isActive ? 'hover:underline' : ''}`}
                              >
                                {st.charAt(0).toUpperCase() + st.slice(1)}
                              </button>
                              {idx < array.length -1 && <span className="mx-2 text-gray-300">|</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="font-medium mb-2">Status History</h4>
                        <ol className="space-y-2 text-sm">
                          {selectedOrder.status_history.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                              <div>
                                <p className="font-medium">{(h.to || '').charAt(0).toUpperCase() + (h.to || '').slice(1)}</p>
                                <p className="text-gray-500 text-xs">{new Date(h.changed_at).toLocaleString()}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Select an order to view details</p>
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

export default OrderManagement;
