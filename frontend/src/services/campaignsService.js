import apiClient from '../lib/apiClient';

export const campaignsService = {
  // Campaign CRUD operations

  // Get all campaigns with optional filters
  async getCampaigns(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.type) {
        params.append('type', filters.type);
      }

      if (filters.ownerId) {
        params.append('owner_id', filters.ownerId);
      }

      if (filters.dateRange) {
        params.append('date_range', filters.dateRange);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/v1/campaigns?${queryString}` : '/api/v1/campaigns';

      console.log('📡 Fetching campaigns from:', endpoint);
      const { data, error } = await apiClient.get(endpoint);

      if (error) {
        console.error('❌ API error:', error);
        throw error;
      }

      console.log('✅ getCampaigns raw response:', data);

      // Handle paginated response format: { campaigns: [...], total: N, skip: 0, limit: 100 }
      if (data && typeof data === 'object' && Array.isArray(data.campaigns)) {
        console.log('✅ Returning campaigns array, length:', data.campaigns.length);
        return data.campaigns;
      }

      // Fallback to direct array or empty array
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      throw err;
    }
  },

  // Get a specific campaign by ID
  async getCampaignById(campaignId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/campaigns/${campaignId}`);

      if (error) {
        if (error.status === 404) {
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching campaign:', err);
      throw err;
    }
  },

  // Create a new campaign
  async createCampaign(campaignData) {
    try {
      console.log('campaignsService.createCampaign called with:', campaignData);

      const cleanCampaignData = {
        name: campaignData.name,
        type: campaignData.type,
        status: campaignData.status || 'draft',
        description: campaignData.description || null,
        start_date: campaignData.start_date || null,
        end_date: campaignData.end_date || null,
        budget: campaignData.budget || 0,
        expected_revenue: campaignData.expected_revenue || 0,
        email_template_id: campaignData.email_template_id || null,
        owner_id: campaignData.owner_id || null,
      };

      console.log('Sending to API:', cleanCampaignData);
      const { data, error } = await apiClient.post('/api/v1/campaigns', cleanCampaignData);

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }
      console.log('API returned data:', data);
      return data;
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    }
  },

  // Update a campaign
  async updateCampaign(campaignId, updates) {
    try {
      console.log('Updating campaign:', campaignId, 'with data:', updates);
      const { data, error } = await apiClient.put(`/api/v1/campaigns/${campaignId}`, updates);

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }
      console.log('Campaign updated successfully:', data);
      return data;
    } catch (err) {
      console.error('Error updating campaign:', err);
      throw err;
    }
  },

  // Delete a campaign
  async deleteCampaign(campaignId) {
    try {
      const { data, error } = await apiClient.delete(`/api/v1/campaigns/${campaignId}`);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting campaign:', err);
      throw err;
    }
  },

  // Delete multiple campaigns
  async deleteCampaigns(campaignIds) {
    try {
      await Promise.all(campaignIds.map(id => this.deleteCampaign(id)));
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Campaign Statistics
  async getCampaignStatistics(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.dateRange) {
        params.append('date_range', filters.dateRange);
      }

      if (filters.ownerId) {
        params.append('owner_id', filters.ownerId);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/v1/campaigns/statistics?${queryString}` : '/api/v1/campaigns/statistics';

      const { data, error } = await apiClient.get(endpoint);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching campaign statistics:', err);
      throw err;
    }
  },

  // Campaign Audience Management

  // Add audience to campaign
  async addAudience(campaignId, audienceData) {
    try {
      const { data, error } = await apiClient.post(
        `/api/v1/campaigns/${campaignId}/audience`,
        audienceData
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error adding audience to campaign:', err);
      throw err;
    }
  },

  // Get campaign audience
  async getCampaignAudience(campaignId, filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.skip !== undefined) {
        params.append('skip', filters.skip);
      }

      if (filters.limit !== undefined) {
        params.append('limit', filters.limit);
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `/api/v1/campaigns/${campaignId}/audience?${queryString}`
        : `/api/v1/campaigns/${campaignId}/audience`;

      const { data, error } = await apiClient.get(endpoint);

      if (error) throw error;

      // Handle paginated response
      if (data && typeof data === 'object' && Array.isArray(data.audience)) {
        return data.audience;
      }
      if (data && typeof data === 'object' && Array.isArray(data.campaign_contacts)) {
        return data.campaign_contacts;
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching campaign audience:', err);
      throw err;
    }
  },

  // Remove audience member from campaign
  async removeAudienceMember(campaignId, campaignContactId) {
    try {
      const { data, error } = await apiClient.delete(
        `/api/v1/campaigns/${campaignId}/audience/${campaignContactId}`
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error removing audience member:', err);
      throw err;
    }
  },

  // Campaign Execution
  async executeCampaign(campaignId, executionData = {}) {
    try {
      const { data, error } = await apiClient.post(
        `/api/v1/campaigns/${campaignId}/execute`,
        executionData
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error executing campaign:', err);
      throw err;
    }
  },

  // Send to pending audience members
  async sendToPendingAudience(campaignId) {
    try {
      const { data, error } = await apiClient.post(
        `/api/v1/campaigns/${campaignId}/send-pending`
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error sending to pending audience:', err);
      throw err;
    }
  },

  // Resend to specific audience member
  async resendToMember(campaignId, campaignContactId) {
    try {
      const { data, error } = await apiClient.post(
        `/api/v1/campaigns/${campaignId}/audience/${campaignContactId}/resend`
      );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error resending to member:', err);
      throw err;
    }
  },

  // Campaign Metrics & Analytics

  // Get campaign metrics
  async getCampaignMetrics(campaignId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/campaigns/${campaignId}/metrics`);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching campaign metrics:', err);
      throw err;
    }
  },

  // Get campaign analytics (time-series data)
  async getCampaignAnalytics(campaignId, days = 30) {
    try {
      const { data, error } = await apiClient.get(
        `/api/v1/campaigns/${campaignId}/analytics?days=${days}`
      );

      if (error) throw error;

      // Handle paginated response
      if (data && typeof data === 'object' && Array.isArray(data.analytics)) {
        return data.analytics;
      }
      if (data && typeof data === 'object' && Array.isArray(data.metrics)) {
        return data.metrics;
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching campaign analytics:', err);
      throw err;
    }
  },

  // Get campaign conversions
  async getCampaignConversions(campaignId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/campaigns/${campaignId}/conversions`);

      if (error) throw error;

      // Handle paginated response
      if (data && typeof data === 'object' && Array.isArray(data.conversions)) {
        return data.conversions;
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching campaign conversions:', err);
      throw err;
    }
  },

  // Prospect Operations

  // Get all prospects with filters
  async getProspects(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.campaignId) {
        params.append('campaign_id', filters.campaignId);
      }

      if (filters.assignedTo) {
        params.append('assigned_to', filters.assignedTo);
      }

      if (filters.source) {
        params.append('source', filters.source);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/v1/prospects?${queryString}` : '/api/v1/prospects';

      const { data, error } = await apiClient.get(endpoint);

      if (error) throw error;

      // Handle paginated response
      if (data && typeof data === 'object' && Array.isArray(data.prospects)) {
        return data.prospects;
      }

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching prospects:', err);
      throw err;
    }
  },

  // Get campaign prospects
  async getCampaignProspects(campaignId, filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.skip !== undefined) {
        params.append('skip', filters.skip);
      }

      if (filters.limit !== undefined) {
        params.append('limit', filters.limit);
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `/api/v1/campaigns/${campaignId}/prospects?${queryString}`
        : `/api/v1/campaigns/${campaignId}/prospects`;

      console.log('📡 Fetching campaign prospects from:', endpoint);
      const { data, error } = await apiClient.get(endpoint);

      if (error) {
        console.error('❌ API error:', error);
        throw error;
      }

      console.log('✅ getCampaignProspects raw response:', data);

      // Handle paginated response format: { prospects: [...], total: N, skip: 0, limit: 100 }
      if (data && typeof data === 'object' && Array.isArray(data.prospects)) {
        console.log('✅ Returning prospects array, length:', data.prospects.length);
        return data.prospects;
      }

      // Fallback to direct array or empty array
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching campaign prospects:', err);
      throw err;
    }
  },

  // Get a specific prospect by ID
  async getProspectById(prospectId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/prospects/${prospectId}`);

      if (error) {
        if (error.status === 404) {
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching prospect:', err);
      throw err;
    }
  },

  // Create a new prospect
  async createProspect(prospectData) {
    try {
      console.log('campaignsService.createProspect called with:', prospectData);

      const { data, error } = await apiClient.post('/api/v1/prospects', prospectData);

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }
      console.log('API returned data:', data);
      return data;
    } catch (err) {
      console.error('Error creating prospect:', err);
      throw err;
    }
  },

  // Update a prospect
  async updateProspect(prospectId, updates) {
    try {
      console.log('Updating prospect:', prospectId, 'with data:', updates);
      const { data, error } = await apiClient.put(`/api/v1/prospects/${prospectId}`, updates);

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }
      console.log('Prospect updated successfully:', data);
      return data;
    } catch (err) {
      console.error('Error updating prospect:', err);
      throw err;
    }
  },

  // Delete a prospect
  async deleteProspect(prospectId) {
    try {
      const { data, error } = await apiClient.delete(`/api/v1/prospects/${prospectId}`);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting prospect:', err);
      throw err;
    }
  },

  // Convert prospect to contact
  async convertProspectToContact(prospectId, conversionData = {}) {
    try {
      console.log('Converting prospect:', prospectId, 'with data:', conversionData);

      const { data, error } = await apiClient.post(
        `/api/v1/prospects/${prospectId}/convert`,
        conversionData
      );

      if (error) {
        console.error('API returned error:', error);
        throw error;
      }
      console.log('Prospect converted successfully:', data);
      return data;
    } catch (err) {
      console.error('Error converting prospect:', err);
      throw err;
    }
  },

  // Bulk import prospects
  async bulkImportProspects(importData) {
    try {
      const { data, error } = await apiClient.post('/api/v1/prospects/bulk-import', importData);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error importing prospects:', err);
      throw err;
    }
  },

  // Export prospects
  async exportProspects(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.campaignId) {
        params.append('campaign_id', filters.campaignId);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/v1/prospects/export?${queryString}` : '/api/v1/prospects/export';

      const { data, error } = await apiClient.get(endpoint);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error exporting prospects:', err);
      throw err;
    }
  },

  // Search campaigns
  async searchCampaigns(searchQuery) {
    try {
      const { data, error } = await apiClient.get(
        `/api/v1/campaigns?search=${encodeURIComponent(searchQuery)}`
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching campaigns:', err);
      throw err;
    }
  },

  // Clone a campaign
  async cloneCampaign(campaignId) {
    try {
      const originalCampaign = await this.getCampaignById(campaignId);

      if (!originalCampaign) {
        throw new Error('Campaign not found');
      }

      // Create a new campaign based on the original
      const clonedCampaignData = {
        name: `${originalCampaign.name} (Copy)`,
        type: originalCampaign.type,
        status: 'draft', // Reset to draft
        description: originalCampaign.description,
        budget: originalCampaign.budget,
        expected_revenue: originalCampaign.expected_revenue,
        email_template_id: originalCampaign.email_template_id,
      };

      return await this.createCampaign(clonedCampaignData);
    } catch (err) {
      console.error('Error cloning campaign:', err);
      throw err;
    }
  }
};

export default campaignsService;
