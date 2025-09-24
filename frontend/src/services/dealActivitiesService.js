import apiClient from '../lib/apiClient';

export const dealActivitiesService = {
  // Get all activities for a specific deal
  async getDealActivities(dealId) {
    try {
      const { data, error } = await apiClient.get(`/deals/${dealId}/activities`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching deal activities:', err);
      throw err;
    }
  },

  // Create a new deal activity
  async createDealActivity(dealId, activityData) {
    try {
      const cleanActivityData = {
        type: activityData.type,
        subject: activityData.subject,
        description: activityData.description || null,
        duration_minutes: activityData.duration_minutes || null,
        outcome: activityData.outcome || null,
        contact_id: activityData.contact_id || null,
        deal_id: dealId,
      };

      const { data, error } = await apiClient.post('/activities', cleanActivityData);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating deal activity:', err);
      throw err;
    }
  },

  // Delete a deal activity
  async deleteDealActivity(activityId) {
    try {
      const { data, error } = await apiClient.delete(`/activities/${activityId}`);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting deal activity:', err);
      throw err;
    }
  },

  // Subscribe to deal activities changes (placeholder)
  subscribeToDealActivities(dealId, callback) {
    // Since we don't have real-time updates, return a stub
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  }
};

export default dealActivitiesService;