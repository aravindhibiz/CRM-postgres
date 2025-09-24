// src/pages/settings-administration/components/SystemConfiguration.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SystemConfiguration = () => {
  const [config, setConfig] = useState({
    general: {
      companyName: 'SalesFlow Pro Inc.',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en'
    },
    sales: {
      defaultPipelineStage: 'Prospecting',
      dealCurrency: 'USD',
      requireDealValue: true,
      autoProgressDeals: false,
      dealInactivityDays: 30
    },
    notifications: {
      emailNotifications: true,
      dealUpdateNotifications: true,
      taskReminders: true,
      weeklyReports: true,
      systemAlerts: true
    },
    security: {
      passwordComplexity: true,
      twoFactorAuth: false,
      sessionTimeout: 480,
      loginAttempts: 5,
      dataEncryption: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      backupLocation: 'cloud'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showExportModal, setShowExportModal] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' }
  ];

  const dateFormats = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD',
    'DD-MM-YYYY'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }
  ];

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    console.log('Saving configuration:', config);
    setHasChanges(false);
    // Here you would typically make an API call to save the configuration
  };

  const handleExportConfig = () => {
    const configData = exportFormat === 'json' ? JSON.stringify(config, null, 2) : config;
    const blob = new Blob([configData], { type: exportFormat === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-config.${exportFormat}`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleTestBackup = () => {
    console.log('Testing backup system...');
    // Simulate backup test
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">System Configuration</h2>
          <p className="text-text-secondary mt-1">Manage general system settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-background text-text-primary px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors duration-150 ease-smooth flex items-center space-x-2 border border-border"
          >
            <Icon name="Download" size={16} />
            <span>Export Configuration</span>
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg transition-colors duration-150 ease-smooth flex items-center space-x-2 ${
              hasChanges
                ? 'bg-primary text-white hover:bg-primary-600' :'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Icon name="Save" size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Icon name="Settings" size={20} className="text-primary" />
            <span>General Settings</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Company Name</label>
              <input
                type="text"
                value={config?.general?.companyName}
                onChange={(e) => updateConfig('general', 'companyName', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Timezone</label>
              <select
                value={config?.general?.timezone}
                onChange={(e) => updateConfig('general', 'timezone', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                {timezones?.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date Format</label>
              <select
                value={config?.general?.dateFormat}
                onChange={(e) => updateConfig('general', 'dateFormat', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                {dateFormats?.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
              <select
                value={config?.general?.currency}
                onChange={(e) => updateConfig('general', 'currency', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                {currencies?.map(currency => (
                  <option key={currency?.code} value={currency?.code}>
                    {currency?.code} - {currency?.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Language</label>
              <select
                value={config?.general?.language}
                onChange={(e) => updateConfig('general', 'language', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                {languages?.map(lang => (
                  <option key={lang?.code} value={lang?.code}>{lang?.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sales Settings */}
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Icon name="Target" size={20} className="text-primary" />
            <span>Sales Settings</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Default Pipeline Stage</label>
              <select
                value={config?.sales?.defaultPipelineStage}
                onChange={(e) => updateConfig('sales', 'defaultPipelineStage', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="Prospecting">Prospecting</option>
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Deal Inactivity Warning (Days)</label>
              <input
                type="number"
                value={config?.sales?.dealInactivityDays}
                onChange={(e) => updateConfig('sales', 'dealInactivityDays', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                min="1"
                max="365"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.sales?.requireDealValue}
                  onChange={(e) => updateConfig('sales', 'requireDealValue', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Require deal value</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.sales?.autoProgressDeals}
                  onChange={(e) => updateConfig('sales', 'autoProgressDeals', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Auto-progress deals based on activities</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Icon name="Bell" size={20} className="text-primary" />
            <span>Notifications</span>
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config?.notifications?.emailNotifications}
                onChange={(e) => updateConfig('notifications', 'emailNotifications', e?.target?.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Email notifications</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config?.notifications?.dealUpdateNotifications}
                onChange={(e) => updateConfig('notifications', 'dealUpdateNotifications', e?.target?.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Deal update notifications</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config?.notifications?.taskReminders}
                onChange={(e) => updateConfig('notifications', 'taskReminders', e?.target?.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Task reminders</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config?.notifications?.weeklyReports}
                onChange={(e) => updateConfig('notifications', 'weeklyReports', e?.target?.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Weekly reports</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config?.notifications?.systemAlerts}
                onChange={(e) => updateConfig('notifications', 'systemAlerts', e?.target?.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">System alerts</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
            <Icon name="Shield" size={20} className="text-primary" />
            <span>Security</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={config?.security?.sessionTimeout}
                onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                min="30"
                max="1440"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={config?.security?.loginAttempts}
                onChange={(e) => updateConfig('security', 'loginAttempts', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                min="3"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.security?.passwordComplexity}
                  onChange={(e) => updateConfig('security', 'passwordComplexity', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Require password complexity</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.security?.twoFactorAuth}
                  onChange={(e) => updateConfig('security', 'twoFactorAuth', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Enable two-factor authentication</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.security?.dataEncryption}
                  onChange={(e) => updateConfig('security', 'dataEncryption', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Data encryption at rest</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* Backup Configuration */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
          <Icon name="Database" size={20} className="text-primary" />
          <span>Backup & Recovery</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Backup Frequency</label>
            <select
              value={config?.backup?.backupFrequency}
              onChange={(e) => updateConfig('backup', 'backupFrequency', e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Retention Period (Days)</label>
            <input
              type="number"
              value={config?.backup?.retentionDays}
              onChange={(e) => updateConfig('backup', 'retentionDays', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              min="7"
              max="365"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleTestBackup}
              className="w-full bg-background text-text-primary px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors duration-150 ease-smooth flex items-center justify-center space-x-2 border border-border"
            >
              <Icon name="TestTube" size={16} />
              <span>Test Backup</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config?.backup?.autoBackup}
              onChange={(e) => updateConfig('backup', 'autoBackup', e?.target?.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Enable automatic backups</span>
          </label>
        </div>
      </div>
      {/* Export Configuration Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowExportModal(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-md w-full relative z-1300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Export Configuration</h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Export Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e?.target?.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="json">JSON</option>
                      <option value="txt">Text</option>
                    </select>
                  </div>
                  
                  <p className="text-sm text-text-secondary">
                    This will download your current system configuration settings.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportConfig}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Configuration Summary */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="AlertCircle" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-text-primary text-sm">Configuration Changes</h4>
            <p className="text-text-secondary text-sm mt-1">
              {hasChanges ? (
                'You have unsaved changes. Click "Save Changes" to apply your modifications.'
              ) : (
                'All settings are saved and up to date. Changes will take effect immediately after saving.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;