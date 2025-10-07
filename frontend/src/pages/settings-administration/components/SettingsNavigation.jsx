// src/pages/settings-administration/components/SettingsNavigation.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { permissionsService } from '../../../services/permissionsService';

const SettingsNavigation = ({ activeSection, onSectionChange }) => {
  const { user, hasPermission } = useAuth();

  const navigationItems = [
    {
      id: 'user-management',
      label: 'User Management',
      icon: 'Users',
      description: 'Manage users, roles and status',
      requiredPermission: 'settings.user_management'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: 'Shield',
      description: 'Role-based access control',
      requiredPermission: 'settings.permissions'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'Plug',
      description: 'API connections and services',
      requiredPermission: 'settings.integrations'
    },
    {
      id: 'custom-fields',
      label: 'Custom Fields',
      icon: 'ListPlus',
      description: 'Field creation and configuration',
      requiredPermission: 'settings.custom_fields'
    },
    {
      id: 'email-templates',
      label: 'Email Templates',
      icon: 'Mail',
      description: 'Template editor and management',
      requiredPermission: 'settings.email_templates'
    },
    {
      id: 'system-config',
      label: 'System Configuration',
      icon: 'Settings',
      description: 'General system settings',
      requiredPermission: 'settings.system_config'
    }
  ];

  // Filter navigation items based on user permissions
  const allowedItems = navigationItems.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  return (
    <nav className="w-80 bg-surface border-r border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-6">Settings Categories</h2>
        <ul className="space-y-2">
          {allowedItems?.map((item) => (
            <li key={item?.id}>
              <button
                onClick={() => onSectionChange?.(item?.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-150 ease-smooth group ${
                  activeSection === item?.id
                    ? 'bg-primary-50 border border-primary-100 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    name={item?.icon}
                    size={20}
                    className={`mt-0.5 ${
                      activeSection === item?.id
                        ? 'text-primary' :'text-text-tertiary group-hover:text-text-secondary'
                    }`}
                  />
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${
                      activeSection === item?.id ? 'text-primary' : ''
                    }`}>
                      {item?.label}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1 leading-tight">
                      {item?.description}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SettingsNavigation;