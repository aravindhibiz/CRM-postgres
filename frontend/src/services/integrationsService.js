import apiClient from '../lib/apiClient';

export const integrationsService = {
  // Get all user integrations
  async getUserIntegrations() {
    try {
      const { data, error } = await apiClient.get('/api/v1/integrations');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching integrations:', err);
      throw err;
    }
  },

  // Get specific integration
  async getIntegration(integrationId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/integrations/${integrationId}`);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching integration:', err);
      throw err;
    }
  },

  // Create new integration
  async createIntegration(integrationData) {
    try {
      const { data, error } = await apiClient.post('/api/v1/integrations', integrationData);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating integration:', err);
      throw err;
    }
  },

  // Update integration
  async updateIntegration(integrationId, updateData) {
    try {
      const { data, error } = await apiClient.put(`/api/v1/integrations/${integrationId}`, updateData);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating integration:', err);
      throw err;
    }
  },

  // Delete integration
  async deleteIntegration(integrationId) {
    try {
      const { data, error } = await apiClient.delete(`/api/v1/integrations/${integrationId}`);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error deleting integration:', err);
      throw err;
    }
  },

  // Get OAuth URL for a provider
  async getOAuthUrl(provider) {
    try {
      console.log('🔗 Getting OAuth URL for provider:', provider);
      const response = await apiClient.post(`/api/v1/integrations/oauth/url?provider=${provider}`);
      console.log('📡 OAuth URL Response:', response);
      
      const { data, error } = response;
      if (error) {
        console.error('❌ OAuth URL Error:', error);
        throw error;
      }
      
      console.log('✅ OAuth URL Success:', data);
      return data.auth_url;
    } catch (err) {
      console.error('💥 Error getting OAuth URL:', err);
      console.error('💥 Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      throw err;
    }
  },

  // Handle OAuth callback
  async handleOAuthCallback(provider, code, state = null) {
    try {
      const { data, error } = await apiClient.post('/api/v1/integrations/oauth/callback', {
        provider,
        code,
        state
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error handling OAuth callback:', err);
      throw err;
    }
  },

  // Test integration connection
  async testIntegration(integrationId) {
    try {
      const { data, error } = await apiClient.post(`/api/v1/integrations/${integrationId}/test`);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error testing integration:', err);
      throw err;
    }
  },

  // Sync integration data
  async syncIntegration(integrationId, force = false) {
    try {
      const { data, error } = await apiClient.post(`/api/v1/integrations/${integrationId}/sync`, null, {
        params: { force }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error syncing integration:', err);
      throw err;
    }
  },

  // Disconnect integration
  async disconnectIntegration(integrationId) {
    try {
      const { data, error } = await apiClient.post(`/api/v1/integrations/${integrationId}/disconnect`);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      throw err;
    }
  },

  // Get integration logs
  async getIntegrationLogs(integrationId, limit = 50, offset = 0) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/integrations/${integrationId}/logs`, {
        params: { limit, offset }
      });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching integration logs:', err);
      throw err;
    }
  },

  // Helper method to initiate OAuth flow
  async initiateOAuthFlow(provider) {
    try {
      const authUrl = await this.getOAuthUrl(provider);
      
      // Store provider in localStorage for callback handling
      localStorage.setItem('oauth_provider', provider);
      
      // Redirect to OAuth URL
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error initiating OAuth flow:', err);
      throw err;
    }
  },

  // Helper method to handle OAuth callback from URL
  async handleOAuthCallbackFromUrl() {
    console.log('🔄 Processing OAuth callback from URL...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    console.log('🔍 URL Parameters:', { code: code?.substring(0, 20) + '...', state, error });
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    // Get provider from localStorage or state
    let provider = localStorage.getItem('oauth_provider');
    if (state && state.includes(':')) {
      const [userId, stateProvider] = state.split(':');
      provider = stateProvider;
      console.log('🔍 Provider from state:', provider);
    }
    
    if (!provider) {
      throw new Error('No provider information available');
    }
    
    try {
      console.log('📡 Calling backend OAuth callback...');
      const result = await this.handleOAuthCallback(provider, code, state);
      console.log('✅ Backend OAuth callback result:', result);
      
      // Clear stored provider
      localStorage.removeItem('oauth_provider');
      
      return result;
    } catch (err) {
      console.error('💥 Backend OAuth callback error:', err);
      localStorage.removeItem('oauth_provider');
      throw err;
    }
  },

  // Get integration status badge info
  getStatusBadge(status) {
    const statusMap = {
      connected: {
        color: 'bg-green-100 text-green-800',
        icon: 'CheckCircle',
        text: 'Connected'
      },
      disconnected: {
        color: 'bg-gray-100 text-gray-800',
        icon: 'XCircle',
        text: 'Disconnected'
      },
      error: {
        color: 'bg-red-100 text-red-800',
        icon: 'AlertCircle',
        text: 'Error'
      },
      syncing: {
        color: 'bg-blue-100 text-blue-800',
        icon: 'RefreshCw',
        text: 'Syncing'
      }
    };
    
    return statusMap[status] || statusMap.disconnected;
  },

  // Get provider configuration
  getProviderConfig(provider) {
    const configs = {
      gmail: {
        name: 'Gmail',
        description: 'Sync emails and contacts with Gmail',
        icon: 'Mail',
        color: 'text-red-600',
        features: ['Email sync', 'Contact sync', 'Email templates', 'Auto-logging']
      },
      google_calendar: {
        name: 'Google Calendar',
        description: 'Schedule meetings and sync calendar events',
        icon: 'Calendar',
        color: 'text-blue-600',
        features: ['Meeting scheduling', 'Event sync', 'Activity tracking', 'Reminders']
      },
      outlook_calendar: {
        name: 'Microsoft Outlook Calendar',
        description: 'Two-way calendar sync with Outlook',
        icon: 'Calendar',
        color: 'text-blue-500',
        features: ['Two-way sync', 'Meeting scheduling', 'Teams meetings', 'Activity tracking']
      }
    };

    return configs[provider] || {
      name: provider,
      description: `Integration with ${provider}`,
      icon: 'Settings',
      color: 'text-gray-600',
      features: []
    };
  },

  // ==================== OUTLOOK CALENDAR INTEGRATION ====================

  // Get Outlook Calendar OAuth URL
  async getOutlookCalendarAuthUrl() {
    try {
      console.log('Getting Outlook Calendar OAuth URL...');
      const { data, error } = await apiClient.get('/api/v1/calendar-integration/outlook-calendar/connect');

      if (error) {
        console.error('Error getting Outlook auth URL:', error);
        throw error;
      }

      console.log('Outlook Calendar auth URL:', data);
      return data;
    } catch (err) {
      console.error('Error in getOutlookCalendarAuthUrl:', err);
      throw err;
    }
  },

  // Get Outlook Calendar integration status
  async getOutlookCalendarStatus() {
    try {
      const { data, error } = await apiClient.get('/api/v1/calendar-integration/outlook-calendar/status');

      if (error) {
        console.error('Error getting Outlook calendar status:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error in getOutlookCalendarStatus:', err);
      throw err;
    }
  },

  // Manually trigger Outlook Calendar sync
  async syncOutlookCalendar(startDate = null, endDate = null) {
    try {
      console.log('Triggering Outlook Calendar sync...');

      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data, error } = await apiClient.post('/api/v1/calendar-integration/outlook-calendar/sync', null, {
        params
      });

      if (error) {
        console.error('Error syncing Outlook calendar:', error);
        throw error;
      }

      console.log('Outlook Calendar sync result:', data);
      return data;
    } catch (err) {
      console.error('Error in syncOutlookCalendar:', err);
      throw err;
    }
  },

  // Disconnect Outlook Calendar integration
  async disconnectOutlookCalendar(integrationId) {
    try {
      console.log('Disconnecting Outlook Calendar integration:', integrationId);

      const { data, error } = await apiClient.delete(
        `/api/v1/calendar-integration/outlook-calendar/${integrationId}`
      );

      if (error) {
        console.error('Error disconnecting Outlook calendar:', error);
        throw error;
      }

      console.log('Outlook Calendar disconnected:', data);
      return data;
    } catch (err) {
      console.error('Error in disconnectOutlookCalendar:', err);
      throw err;
    }
  },

  // Initiate Outlook Calendar OAuth in popup
  async connectOutlookCalendar() {
    try {
      console.log('Initiating Outlook Calendar connection...');

      const { auth_url, state } = await this.getOutlookCalendarAuthUrl();

      // Open OAuth flow in popup window
      const popup = window.open(
        auth_url,
        'outlook-calendar-auth',
        'width=500,height=700,left=100,top=100'
      );

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      // Listen for popup close or message
      return new Promise((resolve, reject) => {
        // Poll for popup close
        const checkPopupClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopupClosed);
            // Give a small delay for any background processes
            setTimeout(() => {
              resolve({ success: true });
            }, 1000);
          }
        }, 500);

        // Listen for postMessage from popup
        const handleMessage = (event) => {
          // Verify origin if needed
          if (event.data.type === 'outlook-calendar-connected') {
            window.removeEventListener('message', handleMessage);
            clearInterval(checkPopupClosed);

            if (event.data.success) {
              resolve({ success: true });
            } else {
              reject(new Error(event.data.error || 'Connection failed'));
            }
          }
        };

        window.addEventListener('message', handleMessage);

        // Timeout after 5 minutes
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          clearInterval(checkPopupClosed);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth flow timed out'));
        }, 300000);
      });
    } catch (err) {
      console.error('Error connecting Outlook Calendar:', err);
      throw err;
    }
  }
};

export default integrationsService;