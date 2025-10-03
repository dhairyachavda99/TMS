import { useState } from 'react';
import { Users, UserPlus, Shield, Edit2, Trash2, Save, X, Plus } from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  // Sample data - in a real app, this would come from an API
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active', lastLogin: '2025-09-27' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Editor', status: 'Active', lastLogin: '2025-09-26' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Viewer', status: 'Inactive', lastLogin: '2025-09-20' },
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', description: 'Full system access', permissions: ['Create', 'Read', 'Update', 'Delete', 'Manage Users'] },
    { id: 2, name: 'Editor', description: 'Can edit content', permissions: ['Create', 'Read', 'Update'] },
    { id: 3, name: 'Viewer', description: 'Read-only access', permissions: ['Read'] },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer', status: 'Active' });
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });

  const availablePermissions = ['Create', 'Read', 'Update', 'Delete', 'Manage Users', 'Manage Roles', 'Export Data', 'Import Data'];

  const addUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: users.length + 1,
        ...newUser,
        lastLogin: 'Never'
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'Viewer', status: 'Active' });
      setShowAddUserModal(false);
    }
  };

  const updateUser = (id, updatedUser) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updatedUser } : user));
    setEditingUser(null);
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const addRole = () => {
    if (newRole.name && newRole.description) {
      const role = {
        id: roles.length + 1,
        ...newRole
      };
      setRoles([...roles, role]);
      setNewRole({ name: '', description: '', permissions: [] });
      setShowAddRoleModal(false);
    }
  };

  const updateRole = (id, updatedRole) => {
    setRoles(roles.map(role => role.id === id ? { ...role, ...updatedRole } : role));
    setEditingRole(null);
  };

  const deleteRole = (id) => {
    // Don't allow deletion if users are assigned to this role
    const roleInUse = users.some(user => user.role === roles.find(r => r.id === id)?.name);
    if (!roleInUse) {
      setRoles(roles.filter(role => role.id !== id));
    } else {
      alert('Cannot delete role: it is currently assigned to users');
    }
  };

  const togglePermission = (permission, isRole = false) => {
    if (isRole) {
      const currentPermissions = editingRole?.permissions || newRole.permissions;
      const updatedPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];
      
      if (editingRole) {
        setEditingRole({ ...editingRole, permissions: updatedPermissions });
      } else {
        setNewRole({ ...newRole, permissions: updatedPermissions });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#272757] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <p className="text-[#8686AC] mt-2">Manage users, roles, and system permissions</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-8 py-4 font-medium ${
                  activeTab === 'users'
                    ? 'text-[#272757] border-b-2 border-[#272757] bg-[#8686AC]/10'
                    : 'text-gray-500 hover:text-[#505081]'
                }`}
              >
                <Users className="inline-block w-5 h-5 mr-2" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`px-8 py-4 font-medium ${
                  activeTab === 'roles'
                    ? 'text-[#272757] border-b-2 border-[#272757] bg-[#8686AC]/10'
                    : 'text-gray-500 hover:text-[#505081]'
                }`}
              >
                <Shield className="inline-block w-5 h-5 mr-2" />
                Role Management
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#272757] hover:bg-[#0F0E47] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Last Login</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser?.id === user.id ? (
                              <input
                                type="text"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                className="border rounded px-2 py-1 w-full"
                              />
                            ) : (
                              <div className="font-medium text-gray-900">{user.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser?.id === user.id ? (
                              <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                className="border rounded px-2 py-1 w-full"
                              />
                            ) : (
                              <div className="text-gray-600">{user.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser?.id === user.id ? (
                              <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                className="border rounded px-2 py-1"
                              >
                                {roles.map(role => (
                                  <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-[#8686AC]/20 text-[#272757] rounded-full">
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser?.id === user.id ? (
                              <select
                                value={editingUser.status}
                                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                                className="border rounded px-2 py-1"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              {editingUser?.id === user.id ? (
                                <>
                                  <button
                                    onClick={() => updateUser(user.id, editingUser)}
                                    className="text-[#505081] hover:text-[#272757]"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(null)}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingUser({ ...user })}
                                    className="text-[#505081] hover:text-[#272757]"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Roles</h2>
                  <button
                    onClick={() => setShowAddRoleModal(true)}
                    className="bg-[#505081] hover:bg-[#272757] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                  </button>
                </div>

                <div className="grid gap-6">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          {editingRole?.id === role.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingRole.name}
                                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                className="text-xl font-bold border rounded px-3 py-2 w-full"
                                placeholder="Role name"
                              />
                              <input
                                type="text"
                                value={editingRole.description}
                                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                className="text-gray-600 border rounded px-3 py-2 w-full"
                                placeholder="Role description"
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="text-xl font-bold text-gray-800">{role.name}</h3>
                              <p className="text-gray-600 mt-1">{role.description}</p>
                            </>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {editingRole?.id === role.id ? (
                            <>
                              <button
                                onClick={() => updateRole(role.id, editingRole)}
                                className="text-[#505081] hover:text-[#272757]"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setEditingRole(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingRole({ ...role })}
                                className="text-[#505081] hover:text-[#272757]"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteRole(role.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Permissions</h4>
                        <div className="flex flex-wrap gap-2">
                          {editingRole?.id === role.id ? (
                            availablePermissions.map((permission) => (
                              <button
                                key={permission}
                                onClick={() => togglePermission(permission, true)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                  editingRole.permissions.includes(permission)
                                    ? 'bg-[#8686AC]/20 text-[#272757] border border-[#8686AC]'
                                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-[#8686AC]/10'
                                }`}
                              >
                                {permission}
                              </button>
                            ))
                          ) : (
                            role.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-3 py-1 text-sm bg-[#505081]/20 text-[#272757] rounded-full border border-[#505081]/30"
                              >
                                {permission}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505081]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505081]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505081]"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505081]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                className="px-4 py-2 bg-[#272757] text-white rounded-md hover:bg-[#0F0E47]"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505081]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#505081]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="mr-2 text-[#505081] focus:ring-[#505081]"
                      />
                      <span className="text-sm text-gray-700">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addRole}
                className="px-4 py-2 bg-[#505081] text-white rounded-md hover:bg-[#272757]"
              >
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;