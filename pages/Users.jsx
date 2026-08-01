import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Select, Badge, Checkbox } from '../components/ui';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Tabs } from '../components/Tabs';
import { Pagination } from '../components/Pagination';
import { TableRowSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { Edit2, Shield, UserPlus, Power, CheckCircle, XCircle, Users, Lock, ShieldCheck, Search, Eye, Trash2 } from 'lucide-react';
import { fetchRoleAuthorities } from '../utils/system-utils';

const UsersPage = () => {
  const { users, addUser, updateUser, updateRole, deleteRole, authorities, roles, addRole, addAuthority, user: currentUser, loading, accessToken } = useApp();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('users');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const [viewAuthUser, setViewAuthUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [authoritiesPayload, setAuthoritiesPayload] = useState([]);
  const [updatedRoleAuthorities, setUpdatedRoleAuthorities] = useState([]);
  const [authSearchTerm, setAuthSearchTerm] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [roleAuthorities, setRoleAuthorities] = useState({}); // Cache for role authorities

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: null,
    authorities: [],
    accountActive: true,
  });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', authorities: [] });
  const [authForm, setAuthForm] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchDefaultRoleAuthorities = async () => {
      const roleAuths = {};
      for (const role of roles) {
        const auths = await fetchRoleAuthorities(role.roleId);
        roleAuths[role.roleId] = auths;
      }
      setRoleAuthorities(roleAuths);
    }
    fetchDefaultRoleAuthorities();
  }, [roles]);

  const handleOpenUserModal = async (user) => {
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
      // TODO: change default root to EMPLOYEE
      const defaultRole = roles.find((r) => r.roleName === 'ROOT');
      const defaultRoleAuthorities = roleAuthorities[defaultRole.roleId];

      setUserForm({
        username: '',
        email: '',
        role: defaultRole ? { id: defaultRole.roleId, name: defaultRole.roleName } : null,
        authorities: defaultRoleAuthorities
          ? defaultRoleAuthorities
              .map((authName) => authorities.find((a) => a.authorityName === authName.authorityName))
              .filter(Boolean)
              .map((a) => ({ id: a.authorityId, name: a.authorityName }))
          : [],
        accountActive: true,
      });
    }
    setIsUserModalOpen(true);
  };

  const handleOpenRoleModal = (role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.roleName || '',
        description: role.roleDesc || '',
        authorities: roleAuthorities[role.roleId]?.map((a) => a.id) || [],
      });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', description: '', authorities: [] });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      const payload = {
        username: userForm.username,
        email: userForm.email,
        roleId: userForm.role.id,
        authorities: authoritiesPayload,
        accountActive: userForm.accountActive,
      };

      updateUser(editingUser.id, payload);
      toast.success('User updated successfully');
    } else {
      const payload = {
        username: userForm.username,
        email: userForm.email,
        roleId: userForm.role.id,
        password: userForm.username + '123', // Default password, should be changed on first login
        accountActive: userForm.accountActive,
      };
      addUser(payload);
      toast.success('User added successfully', `Default credentials have been shared to ${userForm.email}`);
    }
    setIsUserModalOpen(false);
  };

  const toggleUserStatus = (user) => {
    updateUser(user.id, { accountActive: !user.accountActive });
    toast.success(user.accountActive ? 'User deactivated successfully' : 'User activated successfully');
  };

  const handleUserAuthChange = (auth) => {
    const current = userForm.authorities || [];
    const exists = current.some((a) => a.id === auth.authorityId);
    const existsInPayload = authoritiesPayload.some((a) => a.authorityName === auth.authorityName);
    if (exists) {
      setUserForm({ ...userForm, authorities: current.filter((a) => a.id !== auth.authorityId) });
    } else {
      setUserForm({ ...userForm, authorities: [...current, { id: auth.authorityId, name: auth.authorityName }] });
    }

    if(existsInPayload) {
      setAuthoritiesPayload(authoritiesPayload.filter(a => a.authorityName !== auth.authorityName));
    } else {
      setAuthoritiesPayload([...authoritiesPayload, { authorityName: auth.authorityName, active: exists ? false : true }]);
    }
  };

  const handleRoleAuthChange = (authId) => {
    const current = roleForm.authorities || [];
    if (current.includes(authId)) {
      setRoleForm({ ...roleForm, authorities: current.filter((a) => a !== authId) });
    } else {
      setRoleForm({ ...roleForm, authorities: [...current, authId] });
    }

    const existsInPayload = updatedRoleAuthorities.some((a) => a.authId === authId);
    if(existsInPayload) {
      setUpdatedRoleAuthorities(updatedRoleAuthorities.filter(a => a.authId !== authId));
    } else {
      setUpdatedRoleAuthorities([...updatedRoleAuthorities, { "authId": authId, "active": !current.includes(authId) }]);
    }
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleForm({ name: '', description: '', authorities: [] });
  }

  const handleSaveRole = (e) => {
    e.preventDefault();
    if(editingRole) {
      const payload = {
        roleName: roleForm.name.toUpperCase().replace(/\s+/g, '_'),
        roleDesc: roleForm.description || '',
        authorities: updatedRoleAuthorities,
      };

      updateRole(editingRole.roleId, payload);
      toast.success('Role updated successfully');
      setIsRoleModalOpen(false);
    } else {
      if (roleForm.name) {
        addRole({
          roleName: roleForm.name.toUpperCase().replace(/\s+/g, '_'),
          roleDesc: roleForm.description || '',
          authorities: roleForm.authorities || [],
        });
        setRoleForm({ name: '', description: '', authorities: [] });
        setIsRoleModalOpen(false);
        toast.success('Role created successfully');
      }
    }
  };

  const handleSaveAuth = (e) => {
    e.preventDefault();
    if (authForm.name) {
      addAuthority({
        authorityName: authForm.name.toUpperCase().replace(/\s+/g, '_'),
        authorityDesc: authForm.description || '',
      });
      setAuthForm({ name: '', description: '' });
      setIsAuthModalOpen(false);
      toast.success('Authority created successfully');
    }
  };

  const handleConfirmDeleteRole = () => {
    if (roleToDelete) {
      deleteRole(roleToDelete.roleId);
      toast.success('Role deleted successfully');
      setRoleToDelete(null);
    }
  };

  const filteredAuthorities = authorities.filter(
    (a) =>
      a.authorityName.toLowerCase().includes(authSearchTerm.toLowerCase())
  );

  const filteredUsers = (users).filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role?.name === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ? true : statusFilter === 'ACTIVE' ? u.accountActive : !u.accountActive;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const {
    page: userPage,
    setPage: setUserPage,
    pageSize: userPageSize,
    setPageSize: setUserPageSize,
    pageCount: userPageCount,
    paginated: pagedUsers,
    totalItems: totalUsers,
  } = usePagination(filteredUsers, 10);

  const {
    page: rolePage,
    setPage: setRolePage,
    pageSize: rolePageSize,
    setPageSize: setRolePageSize,
    pageCount: rolePageCount,
    paginated: pagedRoles,
    totalItems: totalRoles,
  } = usePagination(roles, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Access Management</h1>
        <Tabs
          tabs={[
            { value: 'users', label: 'Users' },
            { value: 'roles', label: 'Roles' },
            ...(currentUser?.roles === 'ROOT' ? [{ value: 'authorities', label: 'Authorities' }] : []),
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 w-full h-10 px-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none shadow-sm text-sm"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select
                className="h-10 px-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none shadow-sm bg-white text-slate-900 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleName}>
                    {r.roleName}
                  </option>
                ))}
              </select>
              <select
                className="h-10 px-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary focus:outline-none shadow-sm bg-white text-slate-900 text-sm"
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
                  {loading ? (
                    <TableRowSkeleton columns={5} />
                  ) : pagedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{u.username}</div>
                          <div className="text-sm text-slate-500">{u.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            color={
                              u.role?.name === 'ROOT'
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
                                className="inline-block px-2 py-0.5 rounded text-[10px] bg-primary/5 border border-primary/25 text-primary-dark hover:bg-primary/10 transition-colors"
                              >
                                +{u.authorities.length - 2} more
                              </button>
                            )}
                            {u.authorities.length <= 2 && u.authorities.length > 0 && (
                              <button
                                onClick={() => setViewAuthUser(u)}
                                className="text-slate-400 hover:text-primary-dark ml-1 p-1 rounded-full hover:bg-slate-100"
                                title="View All"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleOpenUserModal(u)} className="text-primary-dark hover:text-ink mr-4">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`${u.accountActive ? 'text-red-600' : 'text-green-600'} hover:opacity-80`}
                            title={u.accountActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && (
              <Pagination
                page={userPage}
                pageCount={userPageCount}
                pageSize={userPageSize}
                totalItems={totalUsers}
                onPageChange={setUserPage}
                onPageSizeChange={setUserPageSize}
              />
            )}
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <TableRowSkeleton columns={4} />
                  ) : pagedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState icon={Shield} title="No roles yet" description="Create your first role to get started." />
                      </td>
                    </tr>
                  ) : (
                    pagedRoles.map((r) => (
                    <tr key={r.roleId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color="blue">{r.roleName}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{r.roleDesc}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex flex-wrap gap-1 max-w-xs items-center">
                          {roleAuthorities[r.roleId]?.slice(0, 2).map((auth) => (
                            <span
                              key={auth.id || auth.name}
                              className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-600"
                            >
                              {auth.name}
                            </span>
                          ))}
                          {roleAuthorities[r.roleId]?.length > 2 && (
                            <button
                              onClick={() => setViewAuthUser({ authorities: roleAuthorities[r.roleId] })}
                              className="inline-block px-2 py-0.5 rounded text-[10px] bg-primary/5 border border-primary/25 text-primary-dark hover:bg-primary/10 transition-colors"
                            >
                              +{roleAuthorities[r.roleId]?.length - 2} more
                            </button>
                          )}
                          {roleAuthorities[r.roleId]?.length <= 2 && roleAuthorities[r.roleId]?.length > 0 && (
                            <button
                              onClick={() => setViewAuthUser({ authorities: roleAuthorities[r.roleId] })}
                              className="text-slate-400 hover:text-primary-dark ml-1 p-1 rounded-full hover:bg-slate-100"
                              title="View All"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleOpenRoleModal(r)} className="text-primary-dark hover:text-ink mr-4">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRoleToDelete(r)}
                          className={`text-red-600 hover:opacity-80`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && (
              <Pagination
                page={rolePage}
                pageCount={rolePageCount}
                pageSize={rolePageSize}
                totalItems={totalRoles}
                onPageChange={setRolePage}
                onPageSizeChange={setRolePageSize}
              />
            )}
          </Card>
        </div>
      )}

      {activeTab === 'authorities' && currentUser?.roles === 'ROOT' && (
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
                  {loading ? (
                    <TableRowSkeleton columns={2} />
                  ) : authorities.length === 0 ? (
                    <tr>
                      <td colSpan={2}>
                        <EmptyState icon={Lock} title="No authorities yet" description="Create your first authority to get started." />
                      </td>
                    </tr>
                  ) : (
                    authorities.map((a) => (
                      <tr key={a.authorityId}>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-700">{a.authorityName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{a.authorityDesc}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <Modal
        open={!!viewAuthUser}
        onClose={() => setViewAuthUser(null)}
        title="Assigned Authorities"
        subtitle={viewAuthUser?.username ? `for @${viewAuthUser.username}` : undefined}
        size="lg"
        footer={<Button onClick={() => setViewAuthUser(null)}>Close</Button>}
      >
        {viewAuthUser?.authorities.length > 0 ? (
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
      </Modal>

      <Modal
        open={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Edit User' : 'New User'}
        icon={Users}
      >
        <form onSubmit={handleSaveUser}>
          <Input
            label="Username"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            required
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
              const roleDef = roles.find((r) => r.roleId === newRoleId);
              setUserForm({
                ...userForm,
                role: roleDef ? { id: roleDef.roleId, name: roleDef.roleName } : null,
                authorities: roleDef
                  ? (roleDef.authorities || [])
                      .map((authName) => authorities.find((a) => a.authorityName === authName))
                      .filter(Boolean)
                      .map((a) => ({ id: a.authorityId, name: a.authorityName }))
                  : [],
              });
            }}
            options={roles.map((r) => ({ value: r.roleId, label: r.roleName }))}
          />

          <div className="mb-4">
            <Checkbox
              label="Account Active"
              checked={userForm.accountActive}
              onChange={(e) => setUserForm({ ...userForm, accountActive: e.target.checked })}
            />
          </div>

          {editingUser && (<div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign Authorities</label>
            <div className="mb-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={authSearchTerm}
                onChange={(e) => setAuthSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto border border-slate-300 p-3 rounded-lg bg-slate-50 grid grid-cols-1 gap-2">
              {filteredAuthorities.length > 0 ? (
                filteredAuthorities.map((auth) => (
                  <Checkbox
                    key={auth.authorityId}
                    label={auth.authorityName}
                    checked={userForm.authorities?.some((a) => a.id === auth.authorityId)}
                    onChange={() => handleUserAuthChange(auth)}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-2">No matching authorities found.</p>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Check permissions to explicitly grant them to this user.</p>
          </div> )}

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save User</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isRoleModalOpen}
        onClose={closeRoleModal}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        icon={Shield}
      >
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
            <label className="block text-sm font-medium text-slate-700 mb-2">{editingRole ? 'Existing Authorities' : 'Select Authorities'}</label>
            <div className="max-h-60 overflow-y-auto border border-slate-300 p-3 rounded-lg bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-2">
              {authorities.map((auth) => (
                <Checkbox
                  key={auth.authorityId}
                  label={auth.authorityName}
                  checked={roleForm.authorities?.includes(auth.authorityId)}
                  onChange={() => handleRoleAuthChange(auth.authorityId)}
                  title={auth.authorityDesc}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => closeRoleModal()}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Create Authority"
        icon={ShieldCheck}
      >
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
      </Modal>

      <ConfirmDialog
        open={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDeleteRole}
        title={`Delete role "${roleToDelete?.roleName}"?`}
        description="This cannot be undone. Users currently assigned this role will keep it until reassigned."
        confirmLabel="Delete Role"
      />
    </div>
  );
};

export default UsersPage;
