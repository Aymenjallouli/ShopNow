import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import api from '../../services/api';

const UserManagement = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    status: 'active',
    is_staff: false,
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/');
        setUsers(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Redirect if not admin
  if (!isAuthenticated || !user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      username: user.username || '',
      status: user.status || 'active',
      is_staff: user.is_staff,
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'is_staff' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await api.put(`/users/${selectedUser.id}/`, formData);
      
      // Update the user in the list
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
      
      setIsEditing(false);
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/users/${userId}/`);
      
      // Remove the user from the list
      setUsers(users.filter(u => u.id !== userId));
      
      if (selectedUser && selectedUser.id === userId) {
        setIsEditing(false);
        setSelectedUser(null);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to delete user');
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
          <h1 className="text-3xl font-semibold text-gray-800">User Management</h1>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List */}
            <div className="col-span-2 bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                
                {loading && !users.length ? (
                  <p className="text-gray-500">Loading users...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
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
                        {users.map((user) => (
                          <tr key={user.id} className={selectedUser?.id === user.id ? 'bg-indigo-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.is_staff ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  Admin
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  User
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.status === 'active' ? (
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
                                onClick={() => handleSelectUser(user)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
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
            
            {/* User Edit Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? 'Edit User' : 'User Details'}
                </h2>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Prénom"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Nom"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Nom d'utilisateur"
                      />
                    </div>
                    
                    <div className="mb-4">
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
                    
                    <div className="mb-6">
                      <div className="flex items-center">
                        <input
                          id="is_staff"
                          name="is_staff"
                          type="checkbox"
                          checked={formData.is_staff}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-900">
                          Admin
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedUser(null);
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
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Select a user to edit</p>
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

export default UserManagement;
