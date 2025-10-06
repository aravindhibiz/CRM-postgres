import apiClient from '../lib/apiClient';

export const dealActivitiesService = {
  // Get all activities for a specific deal
  async getDealActivities(dealId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/deals/${dealId}/activities`);

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
        custom_fields: activityData.custom_fields || undefined
      };

      const { data, error } = await apiClient.post('/api/v1/activities', cleanActivityData);

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
      const { data, error } = await apiClient.delete(`/api/v1/activities/${activityId}`);

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
  },

  // Alias method for compatibility
  async createActivity(activityData) {
    return this.createDealActivity(activityData.dealId, activityData);
  },

  // Alias method for compatibility
  async deleteActivity(activityId) {
    return this.deleteDealActivity(activityId);
  },

  // Subscribe to activity changes (alias for compatibility)
  subscribeToActivityChanges(dealId, callback) {
    return this.subscribeToDealActivities(dealId, callback);
  },

  // Unsubscribe from activity changes (alias for compatibility)
  unsubscribeFromActivityChanges(subscription) {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
  }
};

export default dealActivitiesService;