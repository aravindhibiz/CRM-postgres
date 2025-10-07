import apiClient from '../lib/apiClient';

export const rolesService = {
  // Get all roles
  async getAllRoles() {
    const { data, error } = await apiClient.get('/api/v1/roles');
    if (error) throw error;
    return data || [];
  },

  // Get all permissions
  async getAllPermissions() {
    const { data, error } = await apiClient.get('/api/v1/roles/permissions');
    if (error) throw error;
    return data || [];
  },

  // Get role by ID
  async getRoleById(roleId) {
    const { data, error } = await apiClient.get(`/api/v1/roles/${roleId}`);
    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Update role permissions
  async updateRolePermissions(roleId, permissions) {
    const { data, error } = await apiClient.put(`/api/v1/roles/${roleId}/permissions`, {
      role_id: roleId,
      permissions: permissions
    });
    if (error) throw error;
    return data;
  },

  // Get permissions for a specific role by name
  async getRolePermissions(roleName) {
    const { data, error } = await apiClient.get(`/api/v1/roles/by-name/${encodeURIComponent(roleName)}/permissions`);
    if (error) {
      // Return empty permissions if role not found
      return {};
    }
    return data || {};
  },

  // Update role permissions by role name
  async updateRolePermissionsByName(roleName, permissions) {
    const requestBody = {
      role_name: roleName,
      permissions: permissions
    };

    console.log('Sending to backend:', requestBody);

    const { data, error } = await apiClient.put(`/api/v1/roles/by-name/${encodeURIComponent(roleName)}/permissions`, requestBody);
    if (error) throw error;
    return data;
  },

  // Restore default permissions for a role
  async restoreDefaultPermissions(roleName) {
    const { data, error } = await apiClient.post(`/api/v1/roles/by-name/${encodeURIComponent(roleName)}/restore-defaults`);
    if (error) throw error;
    return data;
  }
};

export default rolesService;