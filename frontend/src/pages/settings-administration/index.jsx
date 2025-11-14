// src/pages/settings-administration/index.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import SettingsNavigation from './components/SettingsNavigation';
import UserManagement from './components/UserManagement';
import Permissions from './components/Permissions';
import Integrations from './components/Integrations';
import CustomFields from './components/CustomFields';
import EmailTemplates from './components/EmailTemplates';
import SystemConfiguration from './components/SystemConfiguration';
import { useAuth } from '../../contexts/AuthContext';
import { permissionsService } from '../../services/permissionsService';

const SettingsAdministration = () => {
  const { user, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('user-management');

  // Set default active section based on user permissions and URL params
  useEffect(() => {
    if (user) {
      // Check if there's a section specified in URL params (for OAuth callback)
      const sectionParam = searchParams.get('section');
      const hasOAuthParams = searchParams.get('code') || searchParams.get('error');

      // If OAuth callback, force integrations section
      if (hasOAuthParams) {
        setActiveSection('integrations');
        return;
      }

      // If section specified in URL, use that
      if (sectionParam) {
        setActiveSection(sectionParam);
        return;
      }

      // List of sections in priority order
      const sections = [
        { id: 'user-management', permission: 'settings.user_management' },
        { id: 'integrations', permission: 'settings.integrations' },
        { id: 'custom-fields', permission: 'settings.custom_fields' },
        { id: 'email-templates', permission: 'settings.email_templates' },
        { id: 'permissions', permission: 'settings.permissions' },
        { id: 'system-config', permission: 'settings.system_config' }
      ];

      // Find the first section the user has access to
      for (const section of sections) {
        if (hasPermission(section.permission)) {
          setActiveSection(section.id);
          break;
        }
      }
    }
  }, [user, searchParams, hasPermission]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'user-management':
        return <UserManagement />;
      case 'permissions':
        return <Permissions />;
            case 'integrations':
        return <Integrations />;
      case 'custom-fields':
        return <CustomFields />;
      case 'email-templates':
        return <EmailTemplates />;
      case 'system-config':
        return <SystemConfiguration />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 xs:pt-16 sm:pt-20">
        <div className="max-w-full mx-auto">
          <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 hidden sm:block">
            <Breadcrumb />
          </div>

          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] xs:min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-7rem)]">
            {/* Desktop Left Navigation Panel */}
            <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
              <SettingsNavigation
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden sticky top-14 xs:top-16 sm:top-20 z-10 bg-surface border-b border-border">
              <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4">
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e?.target?.value)}
                  className="w-full px-3 py-2.5 text-sm xs:text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary min-h-touch"
                  aria-label="Settings section"
                >
                  {hasPermission('settings.user_management') && (
                    <option value="user-management">User Management</option>
                  )}
                  {hasPermission('settings.permissions') && (
                    <option value="permissions">Permissions</option>
                  )}
                  {hasPermission('settings.integrations') && (
                    <option value="integrations">Integrations</option>
                  )}
                  {hasPermission('settings.custom_fields') && (
                    <option value="custom-fields">Custom Fields</option>
                  )}
                  {hasPermission('settings.email_templates') && (
                    <option value="email-templates">Email Templates</option>
                  )}
                  {hasPermission('settings.system_config') && (
                    <option value="system-config">System Configuration</option>
                  )}
                </select>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 xs:p-4 sm:p-6">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsAdministration;