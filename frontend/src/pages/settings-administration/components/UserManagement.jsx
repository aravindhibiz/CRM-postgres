// src/pages/settings-administration/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import userService from '../../../services/userService';

const UserManagement = () => {
  const { user: currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ 
    email: '', 
    firstName: '', 
    lastName: '', 
    role: '', 
    message: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = userService?.getUserRoles();

  // Load users data
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      let userData = [];
      if (searchQuery) {
        userData = await userService?.searchUsers(searchQuery);
      } else {
        const filters = {};
        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }
        if (roleFilter !== 'all') {
          filters.roles = [roleFilter];
        }
        
        if (Object.keys(filters)?.length > 0) {
          userData = await userService?.filterUsers(filters);
        } else {
          userData = await userService?.getAllUsers();
        }
      }

      // Transform data for display
      const transformedUsers = userData?.map(user => ({
        id: user?.id,
        name: user?.full_name || `${user?.first_name} ${user?.last_name}`?.trim(),
        email: user?.email,
        role: roles?.find(r => r?.value === user?.role)?.label || user?.role,
        status: user?.is_active ? 'Active' : 'Inactive',
        lastLogin: user?.updated_at ? new Date(user?.updated_at)?.toLocaleString() : 'Never',
        avatar: user?.avatar_url,
        rawData: user
      }));

      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && userProfile?.role === 'admin') {
      loadUsers();
    }
  }, [currentUser, userProfile, searchQuery, statusFilter, roleFilter]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev?.includes(userId)
        ? prev?.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers?.length === users?.length ? [] : users?.map(user => user?.id)
    );
  };

  const handleBulkAction = async (action) => {
    try {
      setError('');
      let updates = {};
      
      switch (action) {
        case 'activate':
          updates = { is_active: true };
          break;
        case 'deactivate':
          updates = { is_active: false };
          break;
        case 'delete':
          updates = { is_active: false };
          break;
      }

      await userService?.bulkUpdateUsers(selectedUsers, updates);
      setSuccess(`Successfully ${action}d ${selectedUsers?.length} user(s)`);
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      console.error(`Error ${action}ing users:`, err);
      setError(`Failed to ${action} users. Please try again.`);
    }
  };

  const handleInviteUser = async (e) => {
    e?.preventDefault();
    
    try {
      setError('');
      await userService?.inviteUser(inviteForm);
      setSuccess('User invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm({ email: '', firstName: '', lastName: '', role: '', message: '' });
      loadUsers();
    } catch (err) {
      console.error('Error inviting user:', err);
      setError('Failed to send invitation. Please try again.');
    }
  };

  const handleUserAction = async (action, userId) => {
    try {
      setError('');
      
      switch (action) {
        case 'activate':
          await userService?.activateUser(userId);
          setSuccess('User activated successfully');
          break;
        case 'deactivate':
          await userService?.deactivateUser(userId);
          setSuccess('User deactivated successfully');
          break;
        case 'delete':
          await userService?.deleteUser(userId);
          setSuccess('User deleted successfully');
          break;
      }
      
      loadUsers();
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      setError(`Failed to ${action} user. Please try again.`);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: 'bg-success-50 text-success-600 border-success-100',
      Inactive: 'bg-error-50 text-error-600 border-error-100',
      Pending: 'bg-warning-50 text-warning-600 border-warning-100'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusStyles?.[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {status}
      </span>
    );
  };

  // Show access denied for non-admin users
  if (!currentUser || !userProfile || userProfile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Icon name="Lock" size={48} className="text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Access Restricted</h3>
          <p className="text-text-secondary">Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
          <p className="text-text-secondary mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          <Icon name="UserPlus" size={16} />
          <span>Invite User</span>
        </button>
      </div>
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-success-50 border border-success-200 text-success p-4 rounded-lg flex items-center space-x-2">
          <Icon name="CheckCircle" size={20} />
          <span>{success}</span>
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-success hover:text-success-600"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg flex items-center space-x-2">
          <Icon name="AlertCircle" size={20} />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-error hover:text-error-600"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
          >
            <option value="all">All Roles</option>
            {roles?.map(role => (
              <option key={role?.value} value={role?.value}>{role?.label}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
        >
          <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
      {/* Bulk Actions */}
      {selectedUsers?.length > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary font-medium">
              {selectedUsers?.length} user{selectedUsers?.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success-600 transition-colors duration-150"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-xs bg-error text-white rounded hover:bg-error-600 transition-colors duration-150"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-xs bg-text-secondary text-white rounded hover:bg-text-primary transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-text-secondary">Loading users...</span>
          </div>
        </div>
      ) : (
        /* Users Table */
        (<div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers?.length === users?.length && users?.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Last Login</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center">
                      <Icon name="Users" size={48} className="text-text-tertiary mx-auto mb-4" />
                      <p className="text-text-secondary">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users?.map((user) => (
                    <tr key={user?.id} className="border-b border-border hover:bg-surface-hover">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers?.includes(user?.id)}
                          onChange={() => handleSelectUser(user?.id)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            {user?.avatar ? (
                              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <Icon name="User" size={16} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{user?.name || 'Unnamed User'}</div>
                            <div className="text-sm text-text-secondary">{user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{user?.role}</td>
                      <td className="py-3 px-4">{getStatusBadge(user?.status)}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{user?.lastLogin}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {user?.status === 'Active' ? (
                            <button
                              onClick={() => handleUserAction('deactivate', user?.id)}
                              className="p-1 text-text-secondary hover:text-error transition-colors duration-150"
                              title="Deactivate User"
                            >
                              <Icon name="UserX" size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction('activate', user?.id)}
                              className="p-1 text-text-secondary hover:text-success transition-colors duration-150"
                              title="Activate User"
                            >
                              <Icon name="UserCheck" size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction('delete', user?.id)}
                            className="p-1 text-text-secondary hover:text-error transition-colors duration-150"
                            title="Delete User"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>)
      )}
      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowInviteModal(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-md w-full relative z-1300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Invite New User</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                    <input
                      type="email"
                      value={inviteForm?.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="user@company.com"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
                      <input
                        type="text"
                        value={inviteForm?.firstName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
                      <input
                        type="text"
                        value={inviteForm?.lastName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Role</label>
                    <select
                      value={inviteForm?.role}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, role: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles?.map(role => (
                        <option key={role?.value} value={role?.value}>{role?.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Welcome Message (Optional)</label>
                    <textarea
                      value={inviteForm?.message}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, message: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      rows={3}
                      placeholder="Welcome to our team..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;