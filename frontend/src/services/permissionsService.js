// Role-based access control service
export const permissionsService = {
  // Define all available permissions by module
  permissions: {
    dashboard: {
      view_personal: ['admin', 'sales_manager', 'sales_rep', 'user'],
      view_team: ['admin', 'sales_manager'],
      view_company: ['admin'],
      export_reports: ['admin', 'sales_manager']
    },
    contacts: {
      view_own: ['admin', 'sales_manager', 'sales_rep', 'user'],
      view_team: ['admin', 'sales_manager'],
      view_all: ['admin'],
      create: ['admin', 'sales_manager', 'sales_rep'],
      edit_own: ['admin', 'sales_manager', 'sales_rep'],
      edit_team: ['admin', 'sales_manager'],
      edit_all: ['admin'],
      delete_own: ['admin', 'sales_manager', 'sales_rep'],
      delete_team: ['admin', 'sales_manager'],
      delete_all: ['admin'],
      import_export: ['admin', 'sales_manager'],
      merge_duplicates: ['admin', 'sales_manager']
    },
    deals: {
      view_own: ['admin', 'sales_manager', 'sales_rep', 'user'],
      view_team: ['admin', 'sales_manager'],
      view_all: ['admin'],
      create: ['admin', 'sales_manager', 'sales_rep'],
      edit_own: ['admin', 'sales_manager', 'sales_rep'],
      edit_team: ['admin', 'sales_manager'],
      edit_all: ['admin'],
      delete_own: ['admin', 'sales_manager', 'sales_rep'],
      delete_team: ['admin', 'sales_manager'],
      delete_all: ['admin'],
      move_pipeline_stages: ['admin', 'sales_manager', 'sales_rep']
    },
    activities: {
      view_own: ['admin', 'sales_manager', 'sales_rep', 'user'],
      view_team: ['admin', 'sales_manager'],
      view_all: ['admin'],
      create: ['admin', 'sales_manager', 'sales_rep'],
      edit_own: ['admin', 'sales_manager', 'sales_rep'],
      edit_team: ['admin', 'sales_manager'],
      delete_own: ['admin', 'sales_manager', 'sales_rep'],
      delete_team: ['admin', 'sales_manager']
    },
    analytics: {
      view_personal: ['admin', 'sales_manager', 'sales_rep'],
      view_team: ['admin', 'sales_manager'],
      view_company: ['admin'],
      export_reports: ['admin', 'sales_manager']
    },
    settings: {
      user_management: ['admin'],
      permissions: ['admin'],
      system_config: ['admin'],
      integrations: ['admin'],
      custom_fields: ['admin'],
      email_templates: ['admin'],
      view_own_profile: ['admin', 'sales_manager', 'sales_rep', 'user'],
      edit_own_profile: ['admin', 'sales_manager', 'sales_rep', 'user']
    }
  },

  // Check if user has specific permission
  hasPermission(userRole, module, action) {
    if (!this.permissions[module] || !this.permissions[module][action]) {
      return false;
    }
    return this.permissions[module][action].includes(userRole);
  },

  // Check if user can view data based on ownership
  canViewData(userRole, dataOwnerId, currentUserId, teamMemberIds = []) {
    switch (userRole) {
      case 'admin':
        return true; // Admin can view everything
      case 'sales_manager':
        // Manager can view own data and team data
        return dataOwnerId === currentUserId || teamMemberIds.includes(dataOwnerId);
      case 'sales_rep':
      case 'user':
        // Rep/User can only view their own data
        return dataOwnerId === currentUserId;
      default:
        return false;
    }
  },

  // Check if user can edit data based on ownership
  canEditData(userRole, dataOwnerId, currentUserId, teamMemberIds = []) {
    switch (userRole) {
      case 'admin':
        return true; // Admin can edit everything
      case 'sales_manager':
        // Manager can edit own data and team data
        return dataOwnerId === currentUserId || teamMemberIds.includes(dataOwnerId);
      case 'sales_rep':
        // Rep can only edit their own data
        return dataOwnerId === currentUserId;
      case 'user':
        // User has limited edit permissions, only their own basic data
        return dataOwnerId === currentUserId;
      default:
        return false;
    }
  },

  // Get allowed navigation items for role
  getAllowedNavigation(userRole) {
    const navigation = {
      dashboard: this.hasPermission(userRole, 'dashboard', 'view_personal'),
      contacts: this.hasPermission(userRole, 'contacts', 'view_own'),
      deals: this.hasPermission(userRole, 'deals', 'view_own'),
      activities: this.hasPermission(userRole, 'activities', 'view_own'),
      analytics: this.hasPermission(userRole, 'analytics', 'view_personal'),
      settings: this.hasPermission(userRole, 'settings', 'view_own_profile')
    };

    return navigation;
  },

  // Get allowed settings sections for role
  getAllowedSettingsSections(userRole) {
    return {
      'user-management': this.hasPermission(userRole, 'settings', 'user_management'),
      'permissions': this.hasPermission(userRole, 'settings', 'permissions'),
      'integrations': this.hasPermission(userRole, 'settings', 'integrations'),
      'custom-fields': this.hasPermission(userRole, 'settings', 'custom_fields'),
      'email-templates': this.hasPermission(userRole, 'settings', 'email_templates'),
      'system-config': this.hasPermission(userRole, 'settings', 'system_config')
    };
  },

  // Get role hierarchy level (higher number = more permissions)
  getRoleLevel(role) {
    const levels = {
      'user': 1,
      'sales_rep': 2,
      'sales_manager': 3,
      'admin': 4
    };
    return levels[role] || 0;
  },

  // Check if role can manage another role
  canManageRole(managerRole, targetRole) {
    return this.getRoleLevel(managerRole) > this.getRoleLevel(targetRole);
  }
};

export default permissionsService;