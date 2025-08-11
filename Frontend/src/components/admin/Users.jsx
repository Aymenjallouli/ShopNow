import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
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
  role: 'customer',
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
  const response = await api.get('/users/');
  const data = response.data;
  const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
  setUsers(list);
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

  // Update form when selectedUser changes
  useEffect(() => {
    if (selectedUser && isEditing) {
      setFormData({
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        email: selectedUser.email || '',
        username: selectedUser.username || '',
        status: selectedUser.status || 'active',
        is_staff: Boolean(selectedUser.is_staff),
  role: selectedUser.role || 'customer',
      });
    }
  }, [selectedUser, isEditing]);

  // Redirect if not admin
  if (!isAuthenticated || !user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  const handleSelectUser = (selectedUserData) => {
    setSelectedUser(selectedUserData);
    setFormData({
      first_name: selectedUserData.first_name || '',
      last_name: selectedUserData.last_name || '',
      email: selectedUserData.email || '',
      username: selectedUserData.username || '',
      status: selectedUserData.status || 'active',
      is_staff: Boolean(selectedUserData.is_staff),
  role: selectedUserData.role || 'customer',
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-slate-600 mt-2">Manage users, permissions, and account status.</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Users List */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50">
                <div className="px-6 py-4 border-b border-slate-200/50">
                  <h2 className="text-xl font-bold text-slate-900">All Users</h2>
                  <p className="text-sm text-slate-600 mt-1">Click on a user to edit their details</p>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Array.isArray(users) ? users.map((user) => (
                          <tr
                            key={user.id}
                            className={`hover:bg-emerald-50 transition-colors duration-150 ${
                              selectedUser?.id === user.id ? 'bg-emerald-50 ring-2 ring-emerald-200' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {(user.first_name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900">
                                    {user.first_name && user.last_name
                                      ? `${user.first_name} ${user.last_name}`
                                      : user.username || 'N/A'
                                    }
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : user.status === 'inactive'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.is_staff ? 'bg-slate-100 text-slate-800' : user.role === 'shop_owner' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {user.is_staff ? 'Admin' : user.role === 'shop_owner' ? 'Shop Owner' : 'Client'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleSelectUser(user)}
                                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors hover:underline"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700 font-medium transition-colors hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Aucun utilisateur</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Edit User Form */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 sticky top-6">
                <div className="px-6 py-4 border-b border-slate-200/50">
                  <h2 className="text-xl font-bold text-slate-900">
                    {isEditing ? 'Edit User' : 'Select a User'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {isEditing ? 'Update user information and permissions' : 'Choose a user from the list to edit'}
                  </p>
                </div>
                
                {!isEditing ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto h-12 w-12 text-slate-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                      Select a user from the table to view and edit their details.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* SECTION: Identité */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2 uppercase">Prénom</label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder="Entrez le prénom"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 caret-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2 uppercase">Nom</label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder="Entrez le nom"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 caret-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2 uppercase">Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="utilisateur@exemple.com"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 caret-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                            />
                            <svg className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2 uppercase">Nom d'utilisateur</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="nom_utilisateur"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 placeholder:text-slate-400 caret-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                            />
                            <svg className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION: Permissions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2 uppercase">Rôle</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm transition"
                        >
                          <option value="customer">Client</option>
                          <option value="shop_owner">Shop Owner</option>
                        </select>
                        <p className="text-[11px] text-slate-400 mt-1">Cochez Admin pour les privilèges complets.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2 uppercase">Statut</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 shadow-sm transition"
                        >
                          <option value="active">🟢 Actif</option>
                          <option value="inactive">🔴 Inactif</option>
                          <option value="suspended">⏸️ Suspendu</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200/70">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="is_staff"
                          id="is_staff"
                          checked={formData.is_staff}
                          onChange={handleInputChange}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <div>
                          <label htmlFor="is_staff" className="text-sm font-semibold text-slate-700">Privilèges administrateur</label>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">Octroie l'accès complet au tableau de bord d'administration et aux actions sensibles.</p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedUser(null);
                        }}
                        className="inline-flex justify-center items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0 transition shadow-sm"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl hover:from-emerald-500 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sauvegarde...
                          </>
                        ) : (
                          'Sauvegarder les modifications'
                        )}
                      </button>
                    </div>
                  </form>
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
