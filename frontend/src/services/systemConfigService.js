import apiClient from '../lib/apiClient';

export const systemConfigService = {
  // Get all configurations
  async getAllConfigurations(category = null) {
    const url = category ? `/api/v1/system-config?category=${encodeURIComponent(category)}` : '/api/v1/system-config';
    const { data, error } = await apiClient.get(url);
    if (error) throw error;
    return data || [];
  },

  // Get configurations grouped by category
  async getConfigurationsGrouped() {
    const { data, error } = await apiClient.get('/api/v1/system-config/grouped');
    if (error) throw error;
    return data || {};
  },

  // Update configurations in bulk
  async updateConfigurationsBulk(configurations) {
    const { data, error } = await apiClient.put('/api/v1/system-config/bulk', {
      configurations: configurations
    });
    if (error) throw error;
    return data;
  },

  // Export configuration
  async exportConfiguration() {
    const { data, error } = await apiClient.get('/api/v1/system-config/export');
    if (error) throw error;
    return data;
  },

  // Get default configuration structure
  getDefaultConfiguration() {
    return {
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
    };
  }
};

export default systemConfigService;