// src/pages/settings-administration/components/SettingsNavigation.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const SettingsNavigation = ({ activeSection, onSectionChange }) => {
  const navigationItems = [
    {
      id: 'user-management',
      label: 'User Management',
      icon: 'Users',
      description: 'Manage users, roles and status'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: 'Shield',
      description: 'Role-based access control'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'Plug',
      description: 'API connections and services'
    },
    {
      id: 'custom-fields',
      label: 'Custom Fields',
      icon: 'ListPlus',
      description: 'Field creation and configuration'
    },
    {
      id: 'email-templates',
      label: 'Email Templates',
      icon: 'Mail',
      description: 'Template editor and management'
    },
    {
      id: 'system-config',
      label: 'System Configuration',
      icon: 'Settings',
      description: 'General system settings'
    }
  ];

  return (
    <nav className="w-80 bg-surface border-r border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-6">Settings Categories</h2>
        <ul className="space-y-2">
          {navigationItems?.map((item) => (
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