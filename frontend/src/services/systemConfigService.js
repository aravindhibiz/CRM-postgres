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

  // Get company email for email sending
  async getCompanyEmail() {
    try {
      const grouped = await this.getConfigurationsGrouped();
      return grouped?.general?.company_email || 'noreply@company.com';
    } catch (error) {
      console.error('Failed to get company email:', error);
      return 'noreply@company.com';
    }
  },

  // Get configurations organized by categories with metadata
  async getConfigurationsByCategories() {
    const { data, error } = await apiClient.get('/api/v1/system-config/categories');
    if (error) throw error;
    return data || [];
  },

  // Get configuration schema
  async getConfigurationSchema() {
    const { data, error } = await apiClient.get('/api/v1/system-config/schema');
    if (error) throw error;
    return data || {};
  },

  // Create a new configuration
  async createConfiguration(configData) {
    const { data, error } = await apiClient.post('/api/v1/system-config', configData);
    if (error) throw error;
    return data;
  },

  // Update a single configuration
  async updateConfiguration(configId, configData) {
    const { data, error } = await apiClient.put(`/api/v1/system-config/${configId}`, configData);
    if (error) throw error;
    return data;
  },

  // Update configurations in bulk
  async updateConfigurationsBulk(configurations) {
    
    const requestPayload = {
      configurations: configurations
    };
    
    
    const { data, error } = await apiClient.put('/api/v1/system-config/bulk', requestPayload);
    if (error) throw error;
    return data;
  },

  // Delete a configuration
  async deleteConfiguration(configId) {
    const { data, error } = await apiClient.delete(`/api/v1/system-config/${configId}`);
    if (error) throw error;
    return data;
  },

  // Export configuration
  async exportConfiguration() {
    const { data, error } = await apiClient.get('/api/v1/system-config/export');
    if (error) throw error;
    return data;
  },

  // Validate configurations
  async validateConfigurations(configurations) {
    const { data, error } = await apiClient.post('/api/v1/system-config/validate', configurations);
    if (error) throw error;
    return data;
  },

  // Initialize default configurations
  async initializeDefaultConfigurations() {
    const { data, error } = await apiClient.post('/api/v1/system-config/initialize');
    if (error) throw error;
    return data;
  },

  // Helper: Convert flat configuration to nested structure for UI
  transformConfigurationsForUI(configurations) {
    const transformed = {
      general: {},
      sales: {},
      notifications: {},
      security: {},
      backup: {},
      integrations: {},
      performance: {}
    };

    configurations.forEach(config => {
      const keyParts = config.key.split('.');
      if (keyParts.length === 2) {
        const [category, field] = keyParts;
        if (transformed[category]) {
          transformed[category][field] = config.value;
        }
      }
    });

    return transformed;
  },

  // Helper: Convert UI configuration to flat structure for API
  transformConfigurationsFromUI(uiConfig) {
    const flatConfigurations = [];

    Object.entries(uiConfig).forEach(([category, fields]) => {
      if (fields && typeof fields === 'object') {
        Object.entries(fields).forEach(([field, value]) => {
          // Skip empty or undefined values
          if (value !== undefined && value !== null && value !== '') {
            // Ensure proper typing for numeric fields
            let processedValue = value;
            const key = `${category}.${field}`;
            
            // Convert numeric fields
            if (key.includes('_days') || key.includes('_minutes') || key.includes('_seconds') || 
                key.includes('_length') || key.includes('_limit') || key.includes('_timeout') ||
                key.includes('_attempts') || key.includes('_results')) {
              processedValue = typeof value === 'string' ? parseInt(value, 10) : value;
              if (isNaN(processedValue)) {
                console.warn(`Invalid numeric value for ${key}: ${value}`);
                return; // Skip invalid numeric values
              }
            }
            
            flatConfigurations.push({
              key: key,
              value: processedValue
            });
          }
        });
      }
    });

    return flatConfigurations;
  },

  // Get default configuration structure for UI
  getDefaultConfiguration() {
    return {
      general: {
        company_name: 'SalesFlow Pro Inc.',
        company_email: 'admin@salesflowpro.com',
        company_phone: '+1-555-123-4567',
        company_address: '123 Business Street, Suite 100, Business City, BC 12345',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        time_format: '12',
        currency: 'USD',
        language: 'en'
      },
      sales: {
        default_pipeline_stage: 'prospecting',
        deal_currency: 'USD',
        require_deal_value: true,
        auto_progress_deals: false,
        deal_inactivity_warning_days: 30,
        lead_scoring_enabled: true,
        opportunity_auto_close_days: 90
      },
      notifications: {
        email_notifications: true,
        deal_update_notifications: true,
        task_reminders: true,
        weekly_reports: true,
        system_alerts: true,
        lead_assignment_alerts: true,
        quota_achievement_alerts: true
      },
      security: {
        password_complexity: true,
        min_password_length: 8,
        two_factor_auth: false,
        session_timeout_minutes: 480,
        max_login_attempts: 5,
        lockout_duration_minutes: 30,
        data_encryption_at_rest: true,
        audit_log_retention_days: 365
      },
      backup: {
        enable_automatic_backups: true,
        backup_frequency: 'daily',
        backup_retention_days: 30,
        backup_location: 'local',
        compress_backups: true
      },
      integrations: {
        email_service_provider: 'sendgrid',
        calendar_integration: 'google',
        crm_sync_enabled: false,
        api_rate_limit: 1000
      },
      performance: {
        enable_caching: true,
        cache_ttl_seconds: 3600,
        max_search_results: 100,
        database_query_timeout: 30
      }
    };
  },

  // Get available options for select fields
  getFieldOptions() {
    return {
      timezone: [
        'America/New_York',
        'America/Chicago',
        'America/Denver', 
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Australia/Sydney'
      ],
      date_format: [
        'MM/DD/YYYY',
        'DD/MM/YYYY',
        'YYYY-MM-DD'
      ],
      time_format: [
        '12',
        '24'
      ],
      currency: [
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'CAD',
        'AUD'
      ],
      language: [
        'en',
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'ja',
        'zh'
      ],
      default_pipeline_stage: [
        'prospecting',
        'qualification',
        'proposal',
        'negotiation',
        'closed_won',
        'closed_lost'
      ],
      backup_frequency: [
        'daily',
        'weekly',
        'monthly'
      ],
      backup_location: [
        'local',
        's3',
        'azure',
        'google_cloud'
      ],
      email_service_provider: [
        'sendgrid',
        'mailgun',
        'ses',
        'smtp'
      ],
      calendar_integration: [
        'google',
        'outlook',
        'none'
      ]
    };
  },

  // Validate configuration value based on field type
  validateConfigurationValue(key, value) {
    // Email validation
    if (key.includes('email') && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }

    // Numeric validation for time/day fields
    if ((key.includes('days') || key.includes('minutes') || key.includes('seconds')) && typeof value === 'number') {
      return value > 0;
    }

    // Boolean validation
    if (key.includes('enable') || key.includes('require') || key.includes('auto')) {
      return typeof value === 'boolean';
    }

    return true;
  }
};

export default systemConfigService;