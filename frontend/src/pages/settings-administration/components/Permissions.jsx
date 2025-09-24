// src/pages/settings-administration/components/Permissions.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Permissions = () => {
  const [selectedRole, setSelectedRole] = useState('Sales Manager');
  
  const roles = [
    { name: 'Admin', userCount: 2 },
    { name: 'Sales Manager', userCount: 5 },
    { name: 'Sales Rep', userCount: 12 },
    { name: 'Sales Operations', userCount: 3 }
  ];

  const permissions = [
    {
      category: 'Dashboard & Analytics',
      items: [
        { name: 'View Dashboard', key: 'view_dashboard' },
        { name: 'View Analytics', key: 'view_analytics' },
        { name: 'Export Reports', key: 'export_reports' }
      ]
    },
    {
      category: 'Contact Management',
      items: [
        { name: 'View Contacts', key: 'view_contacts' },
        { name: 'Create Contacts', key: 'create_contacts' },
        { name: 'Edit Contacts', key: 'edit_contacts' },
        { name: 'Delete Contacts', key: 'delete_contacts' },
        { name: 'Import/Export Contacts', key: 'import_export_contacts' }
      ]
    },
    {
      category: 'Deal Management',
      items: [
        { name: 'View Deals', key: 'view_deals' },
        { name: 'Create Deals', key: 'create_deals' },
        { name: 'Edit Deals', key: 'edit_deals' },
        { name: 'Delete Deals', key: 'delete_deals' },
        { name: 'Move Pipeline Stages', key: 'move_pipeline_stages' }
      ]
    },
    {
      category: 'User Management',
      items: [
        { name: 'View Users', key: 'view_users' },
        { name: 'Invite Users', key: 'invite_users' },
        { name: 'Edit User Roles', key: 'edit_user_roles' },
        { name: 'Deactivate Users', key: 'deactivate_users' }
      ]
    },
    {
      category: 'System Configuration',
      items: [
        { name: 'Manage Integrations', key: 'manage_integrations' },
        { name: 'Configure Custom Fields', key: 'configure_custom_fields' },
        { name: 'Manage Email Templates', key: 'manage_email_templates' },
        { name: 'Access System Settings', key: 'access_system_settings' }
      ]
    }
  ];

  const [rolePermissions, setRolePermissions] = useState({
    'Admin': {
      view_dashboard: true,
      view_analytics: true,
      export_reports: true,
      view_contacts: true,
      create_contacts: true,
      edit_contacts: true,
      delete_contacts: true,
      import_export_contacts: true,
      view_deals: true,
      create_deals: true,
      edit_deals: true,
      delete_deals: true,
      move_pipeline_stages: true,
      view_users: true,
      invite_users: true,
      edit_user_roles: true,
      deactivate_users: true,
      manage_integrations: true,
      configure_custom_fields: true,
      manage_email_templates: true,
      access_system_settings: true
    },
    'Sales Manager': {
      view_dashboard: true,
      view_analytics: true,
      export_reports: true,
      view_contacts: true,
      create_contacts: true,
      edit_contacts: true,
      delete_contacts: false,
      import_export_contacts: true,
      view_deals: true,
      create_deals: true,
      edit_deals: true,
      delete_deals: false,
      move_pipeline_stages: true,
      view_users: true,
      invite_users: false,
      edit_user_roles: false,
      deactivate_users: false,
      manage_integrations: false,
      configure_custom_fields: false,
      manage_email_templates: true,
      access_system_settings: false
    },
    'Sales Rep': {
      view_dashboard: true,
      view_analytics: false,
      export_reports: false,
      view_contacts: true,
      create_contacts: true,
      edit_contacts: true,
      delete_contacts: false,
      import_export_contacts: false,
      view_deals: true,
      create_deals: true,
      edit_deals: true,
      delete_deals: false,
      move_pipeline_stages: true,
      view_users: false,
      invite_users: false,
      edit_user_roles: false,
      deactivate_users: false,
      manage_integrations: false,
      configure_custom_fields: false,
      manage_email_templates: false,
      access_system_settings: false
    },
    'Sales Operations': {
      view_dashboard: true,
      view_analytics: true,
      export_reports: true,
      view_contacts: true,
      create_contacts: true,
      edit_contacts: true,
      delete_contacts: true,
      import_export_contacts: true,
      view_deals: true,
      create_deals: false,
      edit_deals: false,
      delete_deals: false,
      move_pipeline_stages: false,
      view_users: true,
      invite_users: false,
      edit_user_roles: false,
      deactivate_users: false,
      manage_integrations: true,
      configure_custom_fields: true,
      manage_email_templates: true,
      access_system_settings: true
    }
  });

  const handlePermissionChange = (permissionKey) => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev?.[selectedRole],
        [permissionKey]: !prev?.[selectedRole]?.[permissionKey]
      }
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving permission changes for:', selectedRole, rolePermissions?.[selectedRole]);
    // Here you would typically make an API call to save the changes
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
        <button
          onClick={handleSaveChanges}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          <Icon name="Save" size={16} />
          <span>Save Changes</span>
        </button>
      </div>
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