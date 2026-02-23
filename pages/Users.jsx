import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Select, Badge, Checkbox } from '../components/ui';
import { Edit2, Shield, UserPlus, Power, CheckCircle, XCircle, Users, Lock, ShieldCheck, Search, Eye, X } from 'lucide-react';

const UsersPage = () => {
  const { users, addUser, updateUser, authorities, roles, addRole, addAuthority, user: currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('users');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [viewAuthUser, setViewAuthUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [authSearchTerm, setAuthSearchTerm] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: null,
    authorities: [],
    accountActive: true,
  });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', authorities: [] });
  const [authForm, setAuthForm] = useState({ name: '', description: '' });

  const handleOpenUserModal = (user) => {
    setAuthSearchTerm('');
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username || '',
        email: user.email || '',
        role: user.role || null,
        authorities: user.authorities || [],
        accountActive: user.accountActive,
      });
    } else {
      setEditingUser(null);
      const defaultRole = roles.find((r) => r.name === 'EMPLOYEE');
      setUserForm({
        username: '',
        email: '',
        role: defaultRole ? { id: defaultRole.id, name: defaultRole.name } : null,
        authorities: defaultRole
          ? (defaultRole.authorities || [])
              .map((authName) => authorities.find((a) => a.name === authName))
              .filter(Boolean)
              .map((a) => ({ id: a.id, name: a.name }))
          : [],
        accountActive: true,
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    const payload = {
      username: userForm.username,
      email: userForm.email,
      role: userForm.role,
      authorities: userForm.authorities,
      accountActive: userForm.accountActive,
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      addUser({
        id: `u-${Date.now()}`,
        ...payload,
      });
    }
    setIsUserModalOpen(false);
  };

  const toggleUserStatus = (user) => {
    updateUser(user.id, { accountActive: !user.accountActive });
  };

  const handleUserAuthChange = (auth) => {
    const current = userForm.authorities || [];
    const exists = current.some((a) => a.id === auth.id);
    if (exists) {
      setUserForm({ ...userForm, authorities: current.filter((a) => a.id !== auth.id) });
    } else {
      setUserForm({ ...userForm, authorities: [...current, { id: auth.id, name: auth.name }] });
    }
  };

  const handleRoleAuthChange = (authName) => {
    const current = roleForm.authorities || [];
    if (current.includes(authName)) {
      setRoleForm({ ...roleForm, authorities: current.filter((a) => a !== authName) });
    } else {
      setRoleForm({ ...roleForm, authorities: [...current, authName] });
    }
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (roleForm.name) {
      addRole({
        id: `r-${Date.now()}`,
        name: roleForm.name.toUpperCase().replace(/\s+/g, '_'),
        description: roleForm.description || '',
        authorities: roleForm.authorities || [],
      });
      setRoleForm({ name: '', description: '', authorities: [] });
      setIsRoleModalOpen(false);
    }
  };

  const handleSaveAuth = (e) => {
    e.preventDefault();
    if (authForm.name) {
      addAuthority({
        id: `a-${Date.now()}`,
        name: authForm.name.toUpperCase().replace(/\s+/g, '_'),
        description: authForm.description || '',
      });
      setAuthForm({ name: '', description: '' });
      setIsAuthModalOpen(false);
    }
  };

  const filteredAuthorities = authorities.filter(
    (a) =>
      a.name.toLowerCase().includes(authSearchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(authSearchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role?.name === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ? true : statusFilter === 'ACTIVE' ? u.accountActive : !u.accountActive;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Access Management</h1>
        <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Roles
          </button>
          {currentUser?.role?.name === 'SUPERUSER' && (
            <button
              onClick={() => setActiveTab('authorities')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'authorities' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Authorities
            </button>
          )}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 w-full h-10 px-3 bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm text-sm"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select
                className="h-10 px-3 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm bg-white text-slate-900 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                className="h-10 px-3 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm bg-white text-slate-900 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <Button onClick={() => handleOpenUserModal()}>
                <UserPlus className="w-4 h-4 mr-2 inline" /> Add User
              </Button>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Authorities</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{u.username}</div>
                          <div className="text-sm text-slate-500">{u.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            color={
                              u.role?.name === 'SUPERUSER'
                                ? 'red'
                                : u.role?.name === 'ADMIN'
                                ? 'blue'
                                : 'green'
                            }
                          >
                            {u.role?.name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.accountActive ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 text-sm">
                              <XCircle className="w-4 h-4 mr-1" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div className="flex flex-wrap gap-1 max-w-xs items-center">
                            {u.authorities.slice(0, 2).map((auth) => (
                              <span
                                key={auth.id || auth.name}
                                className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-600"
                              >
                                {auth.name}
                              </span>
                            ))}
                            {u.authorities.length > 2 && (
                              <button
                                onClick={() => setViewAuthUser(u)}
                                className="inline-block px-2 py-0.5 rounded text-[10px] bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                +{u.authorities.length - 2} more
                              </button>
                            )}
                            {u.authorities.length <= 2 && u.authorities.length > 0 && (
                              <button
                                onClick={() => setViewAuthUser(u)}
                                className="text-slate-400 hover:text-blue-600 ml-1 p-1 rounded-full hover:bg-slate-100"
                                title="View All"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleOpenUserModal(u)} className="text-blue-600 hover:text-blue-900 mr-4">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`${u.accountActive ? 'text-red-600' : 'text-green-600'} hover:opacity-80`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No users found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsRoleModalOpen(true)}>
              <Shield className="w-4 h-4 mr-2 inline" /> Create Role
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Default Authorities</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color="blue">{r.name}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{r.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-md truncate">{r.authorities.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'authorities' && currentUser?.role?.name === 'SUPERUSER' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAuthModalOpen(true)}>
              <Lock className="w-4 h-4 mr-2 inline" /> Create Authority
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Authority Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {authorities.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-700">{a.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{a.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {viewAuthUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assigned Authorities</h2>
                <p className="text-sm text-slate-500">for @{viewAuthUser.username}</p>
              </div>
              <button onClick={() => setViewAuthUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                  {viewAuthUser.authorities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewAuthUser.authorities.map((auth) => (
                    <Badge key={auth.id || auth.name} color="blue">
                      {auth.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No specific authorities assigned.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setViewAuthUser(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              {editingUser ? 'Edit User' : 'New User'}
            </h2>
            <form onSubmit={handleSaveUser}>
              <Input
                label="Username"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                required
                disabled={!!editingUser}
                placeholder="janedoe"
              />
              <Input
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
                placeholder="jane@example.com"
              />
              <Select
                label="Role"
                value={userForm.role?.id || ''}
                onChange={(e) => {
                  const newRoleId = e.target.value;
                  const roleDef = roles.find((r) => r.id === newRoleId);
                  setUserForm({
                    ...userForm,
                    role: roleDef ? { id: roleDef.id, name: roleDef.name } : null,
                    authorities: roleDef
                      ? (roleDef.authorities || [])
                          .map((authName) => authorities.find((a) => a.name === authName))
                          .filter(Boolean)
                          .map((a) => ({ id: a.id, name: a.name }))
                      : [],
                  });
                }}
                options={roles.map((r) => ({ value: r.id, label: r.name }))}
              />

              <div className="mb-4">
                <Checkbox
                  label="Account Active"
                  checked={userForm.accountActive}
                  onChange={(e) => setUserForm({ ...userForm, accountActive: e.target.checked })}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Authorities</label>
                <div className="mb-2 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={authSearchTerm}
                    onChange={(e) => setAuthSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-slate-300 p-3 rounded-md bg-slate-50 grid grid-cols-1 gap-2">
                  {filteredAuthorities.length > 0 ? (
                    filteredAuthorities.map((auth) => (
                      <Checkbox
                        key={auth.id}
                        label={auth.name}
                        checked={userForm.authorities?.some((a) => a.id === auth.id)}
                        onChange={() => handleUserAuthChange(auth)}
                        title={auth.description}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2">No matching authorities found.</p>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Check permissions to explicitly grant them to this user.</p>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Create New Role
            </h2>
            <form onSubmit={handleSaveRole}>
              <Input
                label="Role Name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                required
                placeholder="e.g. MANAGER"
              />
              <Input
                label="Description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Role responsibilities..."
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Default Authorities</label>
                <div className="max-h-60 overflow-y-auto border border-slate-300 p-3 rounded-md bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {authorities.map((auth) => (
                    <Checkbox
                      key={auth.id}
                      label={auth.name}
                      checked={roleForm.authorities?.includes(auth.name)}
                      onChange={() => handleRoleAuthChange(auth.name)}
                      title={auth.description}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
              Create Authority
            </h2>
            <form onSubmit={handleSaveAuth}>
              <Input
                label="Authority Code"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                placeholder="e.g. DELETE_LEADS"
              />
              <Input
                label="Description"
                value={authForm.description}
                onChange={(e) => setAuthForm({ ...authForm, description: e.target.value })}
                placeholder="What this permission allows..."
              />
              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsAuthModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Authority</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
