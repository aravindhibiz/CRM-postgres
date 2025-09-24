// src/pages/settings-administration/index.jsx
import React, { useState } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import SettingsNavigation from './components/SettingsNavigation';
import UserManagement from './components/UserManagement';
import Permissions from './components/Permissions';
import Integrations from './components/Integrations';
import CustomFields from './components/CustomFields';
import EmailTemplates from './components/EmailTemplates';
import SystemConfiguration from './components/SystemConfiguration';

const SettingsAdministration = () => {
  const [activeSection, setActiveSection] = useState('user-management');

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
      <main className="pt-20">
        <div className="max-w-full mx-auto">
          <div className="px-6 py-4">
            <Breadcrumb />
          </div>
          
          <div className="flex h-[calc(100vh-7rem)]">
            {/* Left Navigation Panel */}
            <div className="hidden lg:block">
              <SettingsNavigation 
                activeSection={activeSection} 
                onSectionChange={setActiveSection} 
              />
            </div>
            
            {/* Mobile Navigation - Collapsible */}
            <div className="lg:hidden">
              <div className="bg-surface border-r border-border p-4">
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="user-management">User Management</option>
                  <option value="permissions">Permissions</option>
                  <option value="integrations">Integrations</option>
                  <option value="custom-fields">Custom Fields</option>
                  <option value="email-templates">Email Templates</option>
                  <option value="system-config">System Configuration</option>
                </select>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
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