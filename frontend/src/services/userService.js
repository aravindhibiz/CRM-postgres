import apiClient from '../lib/apiClient';

export const userService = {
  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await apiClient.get('/users');

    if (error) throw error;
    return data || [];
  },

  // Get current user profile
  async getCurrentUserProfile() {
    const { data, error } = await apiClient.get('/users/me');

    if (error) throw error;
    return data;
  },

  // Update current user profile
  async updateCurrentUserProfile(updates) {
    const { data, error } = await apiClient.patch('/users/me', updates);

    if (error) throw error;
    return data;
  },

  // Get user by ID
  async getUserById(userId) {
    const { data, error } = await apiClient.get(`/users/${userId}`);

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
    const { data, error } = await apiClient.put(`/users/${userId}`, updates);

    if (error) throw error;
    return data;
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    const { data, error } = await apiClient.delete(`/users/${userId}`);

    if (error) throw error;
    return true;
  },

  // Get user statistics (admin only)
  async getUserStats() {
    const { data, error } = await apiClient.get('/users/stats');

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
    const { data, error } = await apiClient.get(`/users?search=${encodeURIComponent(searchQuery)}`);

    if (error) throw error;
    return data || [];
  },

  // Filter users by role
  async getUsersByRole(role) {
    const { data, error } = await apiClient.get(`/users?role=${encodeURIComponent(role)}`);

    if (error) throw error;
    return data || [];
  }
};

export default userService;