// Frontend service to get and use system configurations
import apiClient from '../lib/apiClient';

class ConfigurationService {
  constructor() {
    this.config = null;
    this.loaded = false;
  }

  async loadConfiguration() {
    try {
      const { data, error } = await apiClient.get('/api/v1/system-config/current');
      if (error) throw error;
      this.config = data;
      this.loaded = true;
      return data;
    } catch (error) {
      console.error('Failed to load system configuration:', error);
      // Return defaults if API fails
      this.config = {
        general: {
          currency: 'USD',
          time_format: '12',
          date_format: 'MM/DD/YYYY',
          company_name: 'Your Company'
        }
      };
      this.loaded = true;
      return this.config;
    }
  }

  async getConfig() {
    if (!this.loaded) {
      await this.loadConfiguration();
    }
    return this.config;
  }

  getCurrency() {
    return this.config?.general?.currency || 'USD';
  }

  getTimeFormat() {
    return this.config?.general?.time_format || '12';
  }

  getDateFormat() {
    return this.config?.general?.date_format || 'MM/DD/YYYY';
  }

  getCompanyName() {
    return this.config?.general?.company_name || 'Your Company';
  }

  // Format currency using the configured currency
  formatCurrency(amount) {
    const currency = this.getCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Format date using the configured format
  formatDate(date) {
    const format = this.getDateFormat();
    const d = new Date(date);
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      case 'YYYY-MM-DD':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      case 'DD-MM-YYYY':
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      default: // MM/DD/YYYY
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
  }

  // Format time using the configured format
  formatTime(date) {
    const format = this.getTimeFormat();
    const d = new Date(date);
    
    if (format === '24') {
      return d.toLocaleTimeString('en-US', { hour12: false });
    } else {
      return d.toLocaleTimeString('en-US', { hour12: true });
    }
  }
}

// Export singleton instance
export const configService = new ConfigurationService();
export default configService;