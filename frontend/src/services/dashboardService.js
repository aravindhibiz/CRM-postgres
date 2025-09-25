import apiClient from '../lib/apiClient';

export const dashboardService = {
  // Get dashboard overview data
  async getDashboardOverview() {
    try {
      const { data, error } = await apiClient.get('/api/v1/dashboard/overview');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
      throw err;
    }
  },

  // Get quick stats with growth indicators
  async getQuickStats() {
    try {
      const { data, error } = await apiClient.get('/api/v1/dashboard/quick-stats');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching quick stats:', err);
      throw err;
    }
  },

  // Get performance metrics from deals service
  async getPerformanceMetrics() {
    try {
      const { data, error } = await apiClient.get('/api/v1/deals/analytics/performance');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      throw err;
    }
  },

  // Get revenue data
  async getRevenueData() {
    try {
      const { data, error } = await apiClient.get('/api/v1/deals/analytics/revenue');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      throw err;
    }
  },

  // Get pipeline data
  async getPipelineData() {
    try {
      const { data, error } = await apiClient.get('/api/v1/deals/pipeline');

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
      throw err;
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/activities?limit=${limit}`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      throw err;
    }
  },

  // Get upcoming tasks
  async getUpcomingTasks(limit = 5) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/tasks?status=pending&limit=${limit}`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
      throw err;
    }
  }
};

export default dashboardService;