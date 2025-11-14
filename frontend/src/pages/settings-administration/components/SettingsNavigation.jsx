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
    <nav className="w-full bg-surface border-r border-border h-full">
      <div className="p-3 xs:p-4 sm:p-6">
        <h2 className="text-base xs:text-lg font-semibold text-text-primary mb-3 xs:mb-4 sm:mb-6">Settings Categories</h2>
        <ul className="space-y-1.5 xs:space-y-2">
          {allowedItems?.map((item) => (
            <li key={item?.id}>
              <button
                onClick={() => onSectionChange?.(item?.id)}
                className={`w-full text-left p-3 xs:p-4 rounded-lg transition-all duration-150 ease-smooth group min-h-touch ${
                  activeSection === item?.id
                    ? 'bg-primary-50 border border-primary-100 text-primary' :'text-text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-start space-x-2 xs:space-x-3">
                  <Icon
                    name={item?.icon}
                    size={18}
                    className={`xs:w-5 xs:h-5 mt-0.5 ${
                      activeSection === item?.id
                        ? 'text-primary' :'text-text-tertiary group-hover:text-primary'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-xs xs:text-sm ${
                      activeSection === item?.id ? 'text-primary' : ''
                    }`}>
                      {item?.label}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5 xs:mt-1 leading-tight">
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