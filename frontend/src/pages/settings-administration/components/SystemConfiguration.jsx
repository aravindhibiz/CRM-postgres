// src/pages/settings-administration/components/SystemConfiguration.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import { systemConfigService } from '../../../services/systemConfigService';

const SystemConfiguration = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showExportModal, setShowExportModal] = useState(false);

  // Load configuration data
  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError('');

      // Get configurations grouped by category from the API
      const configData = await systemConfigService.getConfigurationsGrouped();
      
      console.log('Loaded configuration data:', configData);
      
      // Convert grouped data to flat array format for transformation
      const flatConfigArray = [];
      Object.entries(configData).forEach(([category, fields]) => {
        Object.entries(fields).forEach(([field, value]) => {
          flatConfigArray.push({
            key: `${category}.${field}`,
            value: value,
            category: category
          });
        });
      });

      console.log('Flat config array:', flatConfigArray);
      
      // Transform flat data to UI format
      const transformedConfig = systemConfigService.transformConfigurationsForUI(flatConfigArray);

      console.log('Transformed configuration for UI:', transformedConfig);

      setConfig(transformedConfig);
    } catch (err) {
      console.error('Error loading configuration:', err);
      setError('Failed to load configuration. Using default values.');
      
      // Show error toast
      toast.error('Failed to load configuration settings');
      
      // Set default configuration on error
      setConfig(systemConfigService.getDefaultConfiguration());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

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

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError('');

      // Transform UI config to API format using service helper
      const flatConfigurations = systemConfigService.transformConfigurationsFromUI(config);
      
      // Filter out only valid configurations that exist in the backend
      const validKeys = new Set([
        // General
        'general.company_name', 'general.company_email', 'general.company_phone', 
        'general.company_address', 'general.timezone', 'general.date_format', 
        'general.time_format', 'general.currency', 'general.language',
        
        // Sales
        'sales.default_pipeline_stage', 'sales.deal_currency', 'sales.require_deal_value',
        'sales.auto_progress_deals', 'sales.deal_inactivity_warning_days', 
        'sales.lead_scoring_enabled', 'sales.opportunity_auto_close_days',
        
        // Notifications
        'notifications.email_notifications', 'notifications.deal_update_notifications',
        'notifications.task_reminders', 'notifications.weekly_reports', 
        'notifications.system_alerts', 'notifications.lead_assignment_alerts',
        'notifications.quota_achievement_alerts',
        
        // Security
        'security.password_complexity', 'security.min_password_length', 
        'security.two_factor_auth', 'security.session_timeout_minutes',
        'security.max_login_attempts', 'security.lockout_duration_minutes',
        'security.data_encryption_at_rest', 'security.audit_log_retention_days',
        
        // Backup
        'backup.enable_automatic_backups', 'backup.backup_frequency', 
        'backup.backup_retention_days', 'backup.backup_location', 'backup.compress_backups',
        
        // Integrations
        'integrations.email_service_provider', 'integrations.calendar_integration',
        'integrations.crm_sync_enabled', 'integrations.api_rate_limit',
        
        // Performance
        'performance.enable_caching', 'performance.cache_ttl_seconds',
        'performance.max_search_results', 'performance.database_query_timeout'
      ]);
      
      const validConfigurations = flatConfigurations.filter(config => {
        const isValid = validKeys.has(config.key);
        if (!isValid) {
          console.warn(`Skipping invalid configuration key: ${config.key}`);
        }
        return isValid;
      });
      
      console.log('Original flat configurations:', flatConfigurations);
      console.log('Valid configurations after filtering:', validConfigurations);
      console.log('Request payload that will be sent:', {
        configurations: validConfigurations
      });

      // Validate the format before sending
      if (!Array.isArray(validConfigurations) || validConfigurations.length === 0) {
        throw new Error('No valid configurations to save');
      }

      // Validate each configuration has key and value
      const invalidConfigs = validConfigurations.filter(config => {
        return !config.key || config.value === undefined || config.value === null || config.value === '';
      });
      if (invalidConfigs.length > 0) {
        console.error('Invalid configurations found:', invalidConfigs);
        throw new Error(`Some configurations have missing or empty values: ${invalidConfigs.map(c => c.key).join(', ')}`);
      }

      // Ensure all values are properly typed
      const typedConfigurations = validConfigurations.map(config => ({
        key: config.key,
        value: config.value
      }));

      console.log('Final configurations to send:', typedConfigurations);

      const result = await systemConfigService.updateConfigurationsBulk(typedConfigurations);
      
      console.log('Save result:', result);
      
      setSuccess('Configuration saved successfully!');
      setHasChanges(false);
      
      // Show success toast
      toast.success('System configuration updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload configuration to get fresh data
      await loadConfiguration();
      
    } catch (err) {
      console.error('Error saving configuration:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      // Extract error message safely - the apiClient already handles FastAPI validation errors
      let errorMessage = 'Failed to save configuration. Please try again.';
      
      if (err && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Show error toast with safe message
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportConfig = async () => {
    try {
      setError('');
      const exportData = await systemConfigService.exportConfiguration();
      
      // Create and download file
      const dataStr = exportFormat === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : Object.entries(exportData.configurations).map(([category, settings]) => 
            Object.entries(settings).map(([key, value]) => `${category}.${key}=${value}`).join('\n')
          ).join('\n');
      
      const dataBlob = new Blob([dataStr], { type: exportFormat === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-config.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      setSuccess('Configuration exported successfully!');
      
      // Show success toast
      toast.success('Configuration exported successfully!');
    } catch (err) {
      console.error('Error exporting configuration:', err);
      const errorMessage = 'Failed to export configuration. Please try again.';
      setError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800">Configuration Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800">Success</h4>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-blue-700">Loading configuration...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">System Configuration</h2>
          <p className="text-text-secondary mt-1">Manage general system settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            disabled={loading}
            className="bg-background text-text-primary px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors duration-150 ease-smooth flex items-center space-x-2 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="Download" size={16} />
            <span>Export Configuration</span>
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || loading}
            className={`px-4 py-2 rounded-lg transition-colors duration-150 ease-smooth flex items-center space-x-2 ${
              hasChanges && !loading
                ? 'bg-primary text-white hover:bg-primary-600' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Icon name="Save" size={16} />
            )}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - General Settings */}
        <div className="space-y-6">
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
                value={config?.general?.company_name || ''}
                onChange={(e) => updateConfig('general', 'company_name', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Company Email</label>
              <input
                type="email"
                value={config?.general?.company_email || ''}
                onChange={(e) => updateConfig('general', 'company_email', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Company Phone</label>
              <input
                type="tel"
                value={config?.general?.company_phone || ''}
                onChange={(e) => updateConfig('general', 'company_phone', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Company Address</label>
              <textarea
                value={config?.general?.company_address || ''}
                onChange={(e) => updateConfig('general', 'company_address', e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Timezone</label>
              <select
                value={config?.general?.timezone || ''}
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
                value={config?.general?.date_format || ''}
                onChange={(e) => updateConfig('general', 'date_format', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                {dateFormats?.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Time Format</label>
              <select
                value={config?.general?.time_format || ''}
                onChange={(e) => updateConfig('general', 'time_format', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="12">12 Hour</option>
                <option value="24">24 Hour</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
              <select
                value={config?.general?.currency || ''}
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
          </div>
        </div>
        </div>

        {/* Right Column - Sales Settings and Security */}
        <div className="space-y-6">
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
                value={config?.sales?.default_pipeline_stage || ''}
                onChange={(e) => updateConfig('sales', 'default_pipeline_stage', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Deal Inactivity Warning (Days)</label>
              <input
                type="number"
                value={config?.sales?.deal_inactivity_warning_days || ''}
                onChange={(e) => updateConfig('sales', 'deal_inactivity_warning_days', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                min="1"
                max="365"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.sales?.require_deal_value || false}
                  onChange={(e) => updateConfig('sales', 'require_deal_value', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Require deal value</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.sales?.auto_progress_deals || false}
                  onChange={(e) => updateConfig('sales', 'auto_progress_deals', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Auto-progress deals based on activities</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.sales?.lead_scoring_enabled || false}
                  onChange={(e) => updateConfig('sales', 'lead_scoring_enabled', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Enable lead scoring</span>
              </label>
            </div>
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
                value={config?.security?.session_timeout_minutes || ''}
                onChange={(e) => updateConfig('security', 'session_timeout_minutes', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                min="30"
                max="1440"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={config?.security?.max_login_attempts || ''}
                onChange={(e) => updateConfig('security', 'max_login_attempts', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                min="3"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.security?.password_complexity || false}
                  onChange={(e) => updateConfig('security', 'password_complexity', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Require password complexity</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.security?.two_factor_auth || false}
                  onChange={(e) => updateConfig('security', 'two_factor_auth', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Enable two-factor authentication</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config?.security?.data_encryption_at_rest || false}
                  onChange={(e) => updateConfig('security', 'data_encryption_at_rest', e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Data encryption at rest</span>
              </label>
            </div>
          </div>
        </div>
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