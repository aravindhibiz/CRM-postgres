import apiClient from '../lib/apiClient';

export const integrationsService = {
  // Get all user integrations
  async getUserIntegrations() {
    try {
      const { data, error } = await apiClient.get('/api/v1/integrations');
      if (error) throw error;
      return data || [];
    } catch (err) {
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
      throw err;
    }
  },

  // Get OAuth URL for a provider
  async getOAuthUrl(provider) {
    try {
      const response = await apiClient.post(`/api/v1/integrations/oauth/url?provider=${provider}`);

      const { data, error } = response;
      if (error) {
        throw error;
      }

      return data.auth_url;
    } catch (err) {
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
      throw err;
    }
  },

  // Helper method to handle OAuth callback from URL
  async handleOAuthCallbackFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

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
    }

    if (!provider) {
      throw new Error('No provider information available');
    }

    try {
      const result = await this.handleOAuthCallback(provider, code, state);

      // Clear stored provider
      localStorage.removeItem('oauth_provider');

      return result;
    } catch (err) {
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
      const { data, error } = await apiClient.get('/api/v1/calendar-integration/outlook-calendar/connect');

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // Get Outlook Calendar integration status
  async getOutlookCalendarStatus() {
    try {
      const { data, error } = await apiClient.get('/api/v1/calendar-integration/outlook-calendar/status');

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // Manually trigger Outlook Calendar sync
  async syncOutlookCalendar(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data, error } = await apiClient.post('/api/v1/calendar-integration/outlook-calendar/sync', null, {
        params
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // Disconnect Outlook Calendar integration
  async disconnectOutlookCalendar(integrationId) {
    try {
      const { data, error } = await apiClient.delete(
        `/api/v1/calendar-integration/outlook-calendar/${integrationId}`
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // Initiate Outlook Calendar OAuth in popup
  async connectOutlookCalendar() {
    try {
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
        let messageReceived = false;

        // Listen for postMessage from popup (preferred method)
        const handleMessage = (event) => {
          // Verify origin if needed (should come from same origin)
          if (event.data && event.data.type === 'outlook-calendar-connected') {
            messageReceived = true;
            window.removeEventListener('message', handleMessage);
            clearInterval(checkPopupClosed);
            clearTimeout(timeoutId);

            if (event.data.success) {
              resolve({ success: true });
            } else {
              reject(new Error(event.data.error || 'Connection failed'));
            }
          }
        };

        window.addEventListener('message', handleMessage);

        // Poll for popup close (fallback method)
        const checkPopupClosed = setInterval(async () => {
          if (popup.closed) {
            clearInterval(checkPopupClosed);
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);

            // If we didn't receive a postMessage, check integration status
            if (!messageReceived) {
              try {
                // Wait a bit for backend to process
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Check if integration was actually created
                const status = await this.getOutlookCalendarStatus();

                if (status && status.connected) {
                  resolve({ success: true });
                } else {
                  reject(new Error('User closed the popup or authentication failed'));
                }
              } catch (err) {
                reject(new Error('Connection verification failed'));
              }
            }
          }
        }, 500);

        // Timeout after 5 minutes
        const timeoutId = setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          clearInterval(checkPopupClosed);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('OAuth flow timed out after 5 minutes'));
        }, 300000);
      });
    } catch (err) {
      throw err;
    }
  }
};

export default integrationsService;