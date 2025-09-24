import apiClient from '../lib/apiClient';

export const dealsService = {
  // Get all deals for the current user
  async getUserDeals() {
    try {
      const { data, error } = await apiClient.get('/deals');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user deals:', err);
      throw err;
    }
  },

  // Get deals grouped by pipeline stage
  async getPipelineDeals() {
    try {
      const { data, error } = await apiClient.get('/deals/pipeline');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching pipeline deals:', err);
      throw err;
    }
  },

  // Get a specific deal by ID
  async getDealById(dealId) {
    try {
      const { data, error } = await apiClient.get(`/deals/${dealId}`);

      if (error) {
        if (error.status === 404) {
          return null;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching deal:', err);
      throw err;
    }
  },

  // Create a new deal
  async createDeal(dealData) {
    try {
      const cleanDealData = {
        name: dealData.name,
        value: dealData.value || null,
        stage: dealData.stage || 'lead',
        probability: dealData.probability || 0,
        expected_close_date: dealData.expected_close_date || null,
        description: dealData.description || null,
        source: dealData.source || null,
        next_action: dealData.next_action || null,
        company_id: dealData.company_id || null,
        contact_id: dealData.contact_id || null,
      };

      const { data, error } = await apiClient.post('/deals', cleanDealData);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating deal:', err);
      throw err;
    }
  },

  // Update a deal
  async updateDeal(dealId, updates) {
    try {
      const { data, error } = await apiClient.put(`/deals/${dealId}`, updates);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating deal:', err);
      throw err;
    }
  },

  // Delete a deal
  async deleteDeal(dealId) {
    try {
      const { data, error } = await apiClient.delete(`/deals/${dealId}`);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting deal:', err);
      throw err;
    }
  },

  // Delete multiple deals
  async deleteDeals(dealIds) {
    try {
      await Promise.all(dealIds.map(id => this.deleteDeal(id)));
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Update deal stage
  async updateDealStage(dealId, newStage) {
    try {
      const updates = { stage: newStage };

      // If closing as won or lost, set the actual close date
      if (newStage === 'closed_won' || newStage === 'closed_lost') {
        updates.actual_close_date = new Date().toISOString();
      }

      return await this.updateDeal(dealId, updates);
    } catch (err) {
      console.error('Error updating deal stage:', err);
      throw err;
    }
  },

  // Move deal in pipeline (drag and drop)
  async moveDeal(dealId, newStage) {
    return await this.updateDealStage(dealId, newStage);
  },

  // Get deals by stage
  async getDealsByStage(stage) {
    try {
      const { data, error } = await apiClient.get(`/deals?stage=${encodeURIComponent(stage)}`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching deals by stage:', err);
      throw err;
    }
  },

  // Search deals
  async searchDeals(searchQuery) {
    try {
      const { data, error } = await apiClient.get(`/deals?search=${encodeURIComponent(searchQuery)}`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching deals:', err);
      throw err;
    }
  },

  // Filter deals
  async filterDeals(filters) {
    try {
      const params = new URLSearchParams();

      if (filters?.stage && filters.stage.length > 0) {
        params.append('stage', filters.stage.join(','));
      }

      if (filters?.owner && filters.owner.length > 0) {
        params.append('owner', filters.owner.join(','));
      }

      if (filters?.valueRange) {
        if (filters.valueRange.min !== undefined) {
          params.append('min_value', filters.valueRange.min);
        }
        if (filters.valueRange.max !== undefined) {
          params.append('max_value', filters.valueRange.max);
        }
      }

      if (filters?.dateRange) {
        params.append('date_start', filters.dateRange.start);
        params.append('date_end', filters.dateRange.end);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/deals?${queryString}` : '/deals';

      const { data, error } = await apiClient.get(endpoint);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error filtering deals:', err);
      throw err;
    }
  },

  // Get deal statistics
  async getDealStats() {
    try {
      const { data, error } = await apiClient.get('/deals/stats/overview');

      if (error) {
        // Fallback: calculate stats from all deals
        const deals = await this.getUserDeals();

        const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const wonDeals = deals.filter(deal => deal.stage === 'closed_won');
        const lostDeals = deals.filter(deal => deal.stage === 'closed_lost');
        const activeDeals = deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage));

        return {
          total_deals: deals.length,
          active_deals: activeDeals.length,
          won_deals: wonDeals.length,
          lost_deals: lostDeals.length,
          total_value: totalValue,
          won_value: wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
          pipeline_value: activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
          conversion_rate: deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100 * 100) / 100 : 0
        };
      }

      return data;
    } catch (err) {
      console.error('Error fetching deal stats:', err);
      throw err;
    }
  },

  // Get deal pipeline metrics
  async getPipelineMetrics() {
    try {
      const pipelineData = await this.getPipelineDeals();

      const metrics = {
        stages: {},
        totalValue: 0,
        totalDeals: 0
      };

      Object.keys(pipelineData).forEach(stage => {
        const stageData = pipelineData[stage];
        const stageValue = stageData.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

        metrics.stages[stage] = {
          count: stageData.deals.length,
          value: stageValue,
          title: stageData.title
        };

        metrics.totalValue += stageValue;
        metrics.totalDeals += stageData.deals.length;
      });

      return metrics;
    } catch (err) {
      console.error('Error fetching pipeline metrics:', err);
      throw err;
    }
  },

  // Clone a deal
  async cloneDeal(dealId) {
    try {
      const originalDeal = await this.getDealById(dealId);

      if (!originalDeal) {
        throw new Error('Deal not found');
      }

      // Create a new deal based on the original
      const clonedDealData = {
        name: `${originalDeal.name} (Copy)`,
        value: originalDeal.value,
        stage: 'lead', // Reset to lead stage
        probability: 0, // Reset probability
        description: originalDeal.description,
        source: originalDeal.source,
        company_id: originalDeal.company_id,
        contact_id: originalDeal.contact_id,
      };

      return await this.createDeal(clonedDealData);
    } catch (err) {
      console.error('Error cloning deal:', err);
      throw err;
    }
  },

  // Subscribe to deal changes (placeholder for real-time updates)
  subscribeToDeals(callback) {
    // Since we don't have real-time updates, return a stub
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  }
};

export default dealsService;