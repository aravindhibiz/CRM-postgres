// src/pages/settings-administration/components/Permissions.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { rolesService } from '../../../services/rolesService';

const Permissions = () => {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const permissions = [
    {
      category: 'Dashboard & Analytics',
      items: [
        { name: 'View Dashboard Statistics', key: 'dashboard.view_stats' },
        { name: 'Filter Dashboard Data', key: 'dashboard.filter' },
        { name: 'Drag & Drop Pipeline', key: 'dashboard.pipeline_drag_drop' },
        { name: 'View Pipeline', key: 'dashboard.pipeline_view' },
        { name: 'View Personal Analytics', key: 'analytics.view_personal' },
        { name: 'View Team Analytics', key: 'analytics.view_team' },
        { name: 'View Company Analytics', key: 'analytics.view_company' },
        { name: 'Export Analytics Reports', key: 'analytics.export' }
      ]
    },
    {
      category: 'Deal Management',
      items: [
        { name: 'View All Deals', key: 'deals.view_all' },
        { name: 'View Own Deals', key: 'deals.view_own' },
        { name: 'Create Deals', key: 'deals.create' },
        { name: 'Edit All Deals', key: 'deals.edit_all' },
        { name: 'Edit Own Deals', key: 'deals.edit_own' },
        { name: 'Delete All Deals', key: 'deals.delete_all' },
        { name: 'Delete Own Deals', key: 'deals.delete_own' },
        { name: 'Move Pipeline Stages', key: 'deals.move_stages' }
      ]
    },
    {
      category: 'Contact Management',
      items: [
        { name: 'View All Contacts', key: 'contacts.view_all' },
        { name: 'View Own Contacts', key: 'contacts.view_own' },
        { name: 'Create Contacts', key: 'contacts.create' },
        { name: 'Edit All Contacts', key: 'contacts.edit_all' },
        { name: 'Edit Own Contacts', key: 'contacts.edit_own' },
        { name: 'Delete All Contacts', key: 'contacts.delete_all' },
        { name: 'Delete Own Contacts', key: 'contacts.delete_own' },
        { name: 'Import Contacts', key: 'contacts.import' },
        { name: 'Export Contacts', key: 'contacts.export' }
      ]
    },
    {
      category: 'Activity Management',
      items: [
        { name: 'View All Activities', key: 'activities.view_all' },
        { name: 'View Own Activities', key: 'activities.view_own' },
        { name: 'Create Activity for Any Contact', key: 'activities.create_all' },
        { name: 'Create Activity for Own Contacts', key: 'activities.create_own' },
        { name: 'Edit All Activities', key: 'activities.edit_all' },
        { name: 'Edit Own Activities', key: 'activities.edit_own' },
        { name: 'Delete All Activities', key: 'activities.delete_all' },
        { name: 'Delete Own Activities', key: 'activities.delete_own' },
        { name: 'Export Activities', key: 'activities.export' }
      ]
    },
    {
      category: 'Settings & Configuration',
      items: [
        { name: 'User Management', key: 'settings.user_management' },
        { name: 'Manage Permissions', key: 'settings.permissions' },
        { name: 'Manage Integrations', key: 'settings.integrations' },
        { name: 'Manage Custom Fields', key: 'settings.custom_fields' },
        { name: 'Manage Email Templates', key: 'settings.email_templates' },
        { name: 'System Configuration', key: 'settings.system_config' },
        { name: 'View Own Profile', key: 'settings.view_profile' },
        { name: 'Edit Own Profile', key: 'settings.edit_profile' }
      ]
    }
  ];

  const [rolePermissions, setRolePermissions] = useState({});

  // Load roles and permissions data
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [rolesData, permissionsData] = await Promise.all([
        rolesService.getAllRoles(),
        rolesService.getAllPermissions()
      ]);

      // Transform roles data to match the expected format
      // Filter out Sales Operations role
      const transformedRoles = rolesData
        .filter(role => role.name !== 'sales_operations')
        .map(role => ({
          name: role.display_name,
          userCount: 0 // TODO: Get actual user count from API
        }));

      setRoles(transformedRoles);

      // Load permissions for each role
      const permissionsMap = {};
      for (const role of rolesData) {
        try {
          const rolePerms = await rolesService.getRolePermissions(role.name);
          permissionsMap[role.display_name] = rolePerms;
        } catch (err) {
          console.warn(`Failed to load permissions for role ${role.name}:`, err);
          permissionsMap[role.display_name] = {};
        }
      }

      setRolePermissions(permissionsMap);

      // Set first role as selected if none selected
      if (transformedRoles.length > 0 && !selectedRole) {
        setSelectedRole(transformedRoles[0].name);
      }
    } catch (err) {
      console.error('Error loading permissions data:', err);
      setError('Failed to load permissions data. Please try again.');
      // Set fallback roles if API fails
      setRoles([
        { name: 'Admin', userCount: 0 },
        { name: 'Sales Manager', userCount: 0 },
        { name: 'Sales Rep', userCount: 0 },
        { name: 'Sales Operations', userCount: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePermissionChange = (permissionKey) => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev?.[selectedRole],
        [permissionKey]: !prev?.[selectedRole]?.[permissionKey]
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setError('');
      setSuccess('');

      console.log('Saving permission changes for:', selectedRole);
      console.log('Current permissions:', rolePermissions[selectedRole]);

      const permissions = rolePermissions[selectedRole] || {};

      // Call the backend API to save permissions
      const result = await rolesService.updateRolePermissionsByName(selectedRole, permissions);

      setSuccess(`Permissions updated successfully for ${selectedRole}! Users with this role will need to log out and log back in to see the changes.`);

      // Reload the permissions to reflect changes
      await loadData();

      // Auto-clear success message after 5 seconds (longer to read the message)
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error saving permission changes:', err);
      setError('Failed to save permission changes. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!confirm(`Are you sure you want to restore default permissions for ${selectedRole}? This will overwrite all custom changes.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      console.log('Restoring default permissions for:', selectedRole);

      // Call the backend API to restore defaults
      const result = await rolesService.restoreDefaultPermissions(selectedRole);

      setSuccess(`Default permissions restored for ${selectedRole}!`);

      // Reload the permissions to reflect changes
      await loadData();

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error restoring default permissions:', err);
      setError('Failed to restore default permissions. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getPermissionCount = (role) => {
    const permissions = rolePermissions?.[role] || {};
    return Object.values(permissions)?.filter(Boolean)?.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Permissions</h2>
          <p className="text-text-secondary mt-1">Configure role-based access control</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRestoreDefaults}
            className="bg-surface border border-border text-text-secondary px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors duration-150 ease-smooth flex items-center space-x-2"
          >
            <Icon name="RotateCcw" size={16} />
            <span>Restore to Default</span>
          </button>
          <button
            onClick={handleSaveChanges}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
          >
            <Icon name="Save" size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Important: Permission Changes Require Re-login</p>
            <p>After updating role permissions, users with that role must <strong>log out and log back in</strong> to see the new permissions take effect.</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-success-600" />
            <div className="text-success-800">{success}</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="AlertCircle" size={20} className="text-error-600" />
            <div className="text-error-800">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Selection */}
        <div className="lg:col-span-4">
          <div className="bg-surface rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Roles</h3>
            <div className="space-y-2">
              {roles?.map((role) => (
                <button
                  key={role?.name}
                  onClick={() => setSelectedRole(role?.name)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 ease-smooth ${
                    selectedRole === role?.name
                      ? 'bg-primary-50 border border-primary-100 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium text-sm ${
                        selectedRole === role?.name ? 'text-primary' : 'text-text-primary'
                      }`}>
                        {role?.name}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {role?.userCount} user{role?.userCount !== 1 ? 's' : ''} • {getPermissionCount(role?.name)} permissions
                      </div>
                    </div>
                    {selectedRole === role?.name && (
                      <Icon name="Check" size={16} className="text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-8">
          <div className="bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Permissions for {selectedRole}</h3>
              <p className="text-text-secondary text-sm mt-1">
                Configure what actions this role can perform
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {permissions?.map((category) => (
                <div key={category?.category}>
                  <h4 className="font-medium text-text-primary mb-3 text-sm uppercase tracking-wide">
                    {category?.category}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {category?.items?.map((permission) => (
                      <label
                        key={permission?.key}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-surface-hover cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={rolePermissions?.[selectedRole]?.[permission?.key] || false}
                          onChange={() => handlePermissionChange(permission?.key)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-150">
                          {permission?.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Permission Summary */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-text-primary text-sm">Permission Guidelines</h4>
            <p className="text-text-secondary text-sm mt-1">
              Changes to permissions will take effect immediately for all users with the selected role. 
              Users may need to refresh their browser to see updated access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;