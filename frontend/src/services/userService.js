import apiClient from '../lib/apiClient';

export const userService = {
  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await apiClient.get('/api/v1/users');

    if (error) throw error;
    return data || [];
  },

  // Get current user profile
  async getCurrentUserProfile() {
    const { data, error } = await apiClient.get('/api/v1/users/me');

    if (error) throw error;
    return data;
  },

  // Update current user profile
  async updateCurrentUserProfile(updates) {
    const { data, error } = await apiClient.put('/api/v1/users/me', updates);

    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getUserById(userId) {
    const { data, error } = await apiClient.get(`/api/v1/users/${userId}`);

    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Update user (admin only)
  async updateUser(userId, updates) {
    const { data, error } = await apiClient.put(`/api/v1/users/${userId}`, updates);

    if (error) throw error;
    return data;
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    const { data, error } = await apiClient.delete(`/api/v1/users/${userId}`);

    if (error) throw error;
    return true;
  },

  // Get user statistics (admin only)
  async getUserStats() {
    const { data, error } = await apiClient.get('/api/v1/users/stats');

    if (error) {
      // Fallback: basic stats
      return {
        total: 0,
        active: 0,
        roles: {}
      };
    }

    return data;
  },

  // Search users
  async searchUsers(searchQuery) {
    const { data, error } = await apiClient.get(`/api/v1/users?search=${encodeURIComponent(searchQuery)}`);

    if (error) throw error;
    return data || [];
  },

  // Filter users by role
  async getUsersByRole(role) {
    const { data, error } = await apiClient.get(`/api/v1/users?role=${encodeURIComponent(role)}`);

    if (error) throw error;
    return data || [];
  },

  // Additional methods for settings administration
  async filterUsers(filters) {
    const params = new URLSearchParams();

    if (filters.status) {
      params.append('status', filters.status);
    }

    if (filters.roles && filters.roles.length > 0) {
      params.append('roles', filters.roles.join(','));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/users?${queryString}` : '/api/v1/users';

    const { data, error } = await apiClient.get(endpoint);
    if (error) throw error;
    return data || [];
  },

  // Search users
  async searchUsers(searchQuery) {
    const { data, error } = await apiClient.get(`/api/v1/users?search=${encodeURIComponent(searchQuery)}`);
    if (error) throw error;
    return data || [];
  },

  // Filter users
  async filterUsers(filters) {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    if (filters.roles && filters.roles.length > 0) {
      params.append('roles', filters.roles.join(','));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/users?${queryString}` : '/api/v1/users';

    const { data, error } = await apiClient.get(endpoint);
    if (error) throw error;
    return data || [];
  },

  // Get available user roles
  getUserRoles() {
    return [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'sales_manager', label: 'Sales Manager', description: 'Team management access' },
      { value: 'sales_rep', label: 'Sales Representative', description: 'Standard user access' },
      { value: 'user', label: 'User', description: 'Basic user access' }
    ];
  },

  // Invite new user
  async inviteUser(inviteData) {
    const { data, error } = await apiClient.post('/api/v1/users/invite', inviteData);
    if (error) throw error;
    return data;
  },

  // Change user role
  async changeUserRole(userId, newRole) {
    return this.updateUser(userId, { role: newRole });
  },

  // Deactivate user
  async deactivateUser(userId) {
    return this.updateUser(userId, { is_active: false });
  },

  // Reactivate user
  async reactivateUser(userId) {
    return this.updateUser(userId, { is_active: true });
  }
};

export default userService;