import React, { useState, useEffect } from 'react';
import { Users, Shield, ArrowLeft, UserPlus, Plus, Edit, Trash2, AlertCircle, CheckCircle, RefreshCw, User } from 'lucide-react';

const SystemSettings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'user', password: '' });

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    if (activeTab === 'roles') {
      fetchRoleStats();
    }
  }, [activeTab]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data.user);
        if (data.data.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
        }
      }
    } catch (err) {
      setError('Failed to verify admin access');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/roles/stats', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setRoles(data.data.roles);
      } else {
        setError(data.message || 'Failed to fetch role statistics');
      }
    } catch (err) {
      setError('Failed to fetch role statistics');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.email || !newUser.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();
      if (data.success) {
        setUsers([data.data.user, ...users]);
        setNewUser({ username: '', email: '', role: 'user', password: '' });
        setShowAddUserModal(false);
        setMessage({ type: 'success', text: 'User created successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create user' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        if (data.success) {
          setUsers(users.filter(user => user._id !== userId));
          setMessage({ type: 'success', text: 'User deleted successfully' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to delete user' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        setMessage({ type: 'success', text: 'User role updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update user role' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update user role' });
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'it_staff': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (error && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full px-6 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Manage users and system configuration</p>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Role Management
              </button>
            </nav>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-lg border-l-4 shadow-sm mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-700' 
              : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 flex items-center gap-2 transition-all"
                style={{ backgroundColor: '#272757' }}
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getRoleColor(user.role)}`}
                          disabled={user._id === currentUser?._id}
                        >
                          <option value="user">User</option>
                          <option value="support">Support</option>
                          <option value="it_staff">IT Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user._id === currentUser?._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user._id === currentUser?._id ? "Cannot delete your own account" : "Delete user"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
              <button
                onClick={fetchRoleStats}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Stats
              </button>
            </div>

            <div className="grid gap-6">
              {Object.entries({
                admin: { name: 'Admin', description: 'Full system access including user management and system settings', color: 'red' },
                support: { name: 'Support', description: 'Support users with same rights as regular users', color: 'blue' },
                it_staff: { name: 'IT Staff', description: 'Technical staff with ticket management and system access', color: 'purple' },
                user: { name: 'User', description: 'Standard user with basic ticket creation and viewing', color: 'green' }
              }).map(([roleKey, roleInfo]) => {
                const roleData = roles[roleKey] || { count: 0, users: [], permissions: [] };
                return (
                  <div key={roleKey} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{roleInfo.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
                            {roleData.count} user{roleData.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{roleInfo.description}</p>
                      </div>
                    </div>
                    
                    {/* Permissions */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {roleData.permissions.map((permission) => (
                          <span key={permission} className={`px-3 py-1 text-xs bg-${roleInfo.color}-100 text-${roleInfo.color}-800 rounded-full`}>
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Users in this role */}
                    {roleData.users.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Users with this role</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {roleData.users.slice(0, 6).map((user) => (
                              <div key={user._id} className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-gray-600" />
                                </div>
                                <span className="text-gray-700">{user.username}</span>
                              </div>
                            ))}
                            {roleData.users.length > 6 && (
                              <div className="text-sm text-gray-500 col-span-2">
                                +{roleData.users.length - 6} more users...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="support">Support</option>
                    <option value="it_staff">IT Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#272757' }}
                  >
                    Add User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;