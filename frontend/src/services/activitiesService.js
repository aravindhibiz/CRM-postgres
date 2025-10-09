import apiClient from '../lib/apiClient';
import { contactsService } from './contactsService';
import { dealsService } from './dealsService';

export const activitiesService = {
  // Get all activities for the current user
  async getUserActivities(limit = 50) {
    console.log('Fetching user activities (new architecture)...');
    const { data, error } = await apiClient.get(`/api/v1/activities?limit=${limit}`);

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    console.log('Fetched activities data from v2 (with relations):', data);
    
    // New architecture returns activities with relations already populated
    return data || [];
  },

  // NOTE: populateActivityRelations is no longer needed with new architecture
  // The v2 endpoint returns activities with contact, deal, and user relations already loaded
  // Keeping this commented for reference in case needed for backward compatibility
  /*
  async populateActivityRelations(activities) {
    const populatedActivities = [];
    
    for (const activity of activities) {
      const populatedActivity = { ...activity };
      
      if (activity.contact_id) {
        try {
          const contact = await contactsService.getContactById(activity.contact_id);
          populatedActivity.contact = contact;
        } catch (err) {
          console.warn('Could not fetch contact for activity:', activity.id, err);
          populatedActivity.contact = null;
        }
      }
      
      if (activity.deal_id) {
        try {
          const deal = await dealsService.getDealById(activity.deal_id);
          populatedActivity.deal = deal;
        } catch (err) {
          console.warn('Could not fetch deal for activity:', activity.id, err);
          populatedActivity.deal = null;
        }
      }
      
      populatedActivities.push(populatedActivity);
    }
    return populatedActivities;
  },
  */

  // Get recent activities (alias for getUserActivities with limit)
  async getRecentActivity(limit = 10) {
    return this.getUserActivities(limit);
  },

  // Get activities for a specific deal
  async getDealActivities(dealId) {
    const { data, error } = await apiClient.get(`/api/v1/deals/${dealId}/activities`);

    if (error) throw error;
    return data || [];
  },

  // Get activities for a specific contact
  async getContactActivities(contactId) {
    const { data, error } = await apiClient.get(`/api/v1/contacts/${contactId}/activities`);

    if (error) throw error;
    return data || [];
  },

  // Get a single activity by ID (includes custom fields)
  async getActivityById(activityId) {
    console.log('Fetching activity by ID (new architecture):', activityId);
    const { data, error } = await apiClient.get(`/api/v1/activities/${activityId}`);

    if (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }

    console.log('Fetched activity data:', data);
    return data;
  },

  // Create a new activity
  async createActivity(activityData) {
    console.log('Creating activity with data:', activityData);
    
    const cleanActivityData = {
      type: activityData.type,
      subject: activityData.subject,
      description: activityData.description || null,
      duration_minutes: activityData.duration_minutes || null,
      outcome: activityData.outcome || null,
      contact_id: activityData.contact_id || null,
      deal_id: activityData.deal_id || null,
      custom_fields: activityData.custom_fields || undefined,
    };

    console.log('Sending clean activity data:', cleanActivityData);

    const { data, error } = await apiClient.post('/api/v1/activities', cleanActivityData);

    if (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
    
    console.log('Created activity response:', data);
    return data;
  },

  // Update an activity
  async updateActivity(activityId, updates) {
    console.log('Updating activity with data:', updates);

    const cleanActivityData = {
      type: updates.type,
      subject: updates.subject,
      description: updates.description || null,
      duration_minutes: updates.duration_minutes || null,
      outcome: updates.outcome || null,
      contact_id: updates.contact_id || null,
      deal_id: updates.deal_id || null,
      custom_fields: updates.custom_fields || undefined,
    };

    console.log('Sending clean update data:', cleanActivityData);

    const { data, error } = await apiClient.put(`/api/v1/activities/${activityId}`, cleanActivityData);

    if (error) {
      console.error('Error updating activity:', error);
      throw error;
    }

    console.log('Updated activity response:', data);
    return data;
  },

  // Delete an activity
  async deleteActivity(activityId) {
    const { data, error } = await apiClient.delete(`/api/v1/activities/${activityId}`);

    if (error) throw error;
    return true;
  },

  // Delete multiple activities
  async deleteActivities(activityIds) {
    try {
      await Promise.all(activityIds.map(id => this.deleteActivity(id)));
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Search activities
  async searchActivities(searchQuery, filters = {}) {
    const params = new URLSearchParams();

    if (searchQuery) {
      params.append('search', searchQuery);
    }

    if (filters.type && filters.type.length > 0) {
      params.append('type', filters.type.join(','));
    }

    if (filters.dateRange) {
      params.append('date_start', filters.dateRange.start);
      params.append('date_end', filters.dateRange.end);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/activities?${queryString}` : '/api/v1/activities';

    const { data, error } = await apiClient.get(endpoint);

    if (error) throw error;
    return data || [];
  },

  // Get activity statistics
  async getActivityStats() {
    const { data, error } = await apiClient.get('/api/v1/activities/stats');

    if (error) {
      // Fallback: calculate stats from all activities
      const activities = await this.getUserActivities();

      const stats = {
        total: activities.length || 0,
        calls: activities.filter(a => a.type === 'call').length || 0,
        emails: activities.filter(a => a.type === 'email').length || 0,
        meetings: activities.filter(a => a.type === 'meeting').length || 0,
        notes: activities.filter(a => a.type === 'note').length || 0,
        tasks: activities.filter(a => a.type === 'task').length || 0,
      };

      return stats;
    }

    return data;
  },

  // Get filtered activities
  async filterActivities(filters) {
    const params = new URLSearchParams();

    if (filters.type && filters.type.length > 0) {
      params.append('type', filters.type.join(','));
    }

    if (filters.contact && filters.contact.length > 0) {
      params.append('contact', filters.contact.join(','));
    }

    if (filters.deal && filters.deal.length > 0) {
      params.append('deal', filters.deal.join(','));
    }

    if (filters.dateRange) {
      params.append('date_start', filters.dateRange.start);
      params.append('date_end', filters.dateRange.end);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/activities?${queryString}` : '/api/v1/activities';

    const { data, error } = await apiClient.get(endpoint);

    if (error) throw error;
    return data || [];
  },

  // Subscribe to activity changes (placeholder for real-time updates)
  subscribeToActivities(callback) {
    // Since we don't have real-time updates, return a stub
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  },

  // Log a call activity
  async logCall(callData) {
    return await this.createActivity({
      type: 'call',
      subject: callData.subject || 'Phone Call',
      description: callData.description,
      duration_minutes: callData.duration_minutes,
      outcome: callData.outcome,
      contact_id: callData.contact_id,
      deal_id: callData.deal_id,
    });
  },

  // Log an email activity
  async logEmail(emailData) {
    return await this.createActivity({
      type: 'email',
      subject: emailData.subject || 'Email',
      description: emailData.description,
      contact_id: emailData.contact_id,
      deal_id: emailData.deal_id,
    });
  },

  // Log a meeting activity
  async logMeeting(meetingData) {
    return await this.createActivity({
      type: 'meeting',
      subject: meetingData.subject || 'Meeting',
      description: meetingData.description,
      duration_minutes: meetingData.duration_minutes,
      outcome: meetingData.outcome,
      contact_id: meetingData.contact_id,
      deal_id: meetingData.deal_id,
    });
  },

  // Add a note activity
  async addNote(noteData) {
    return await this.createActivity({
      type: 'note',
      subject: noteData.subject || 'Note',
      description: noteData.description,
      contact_id: noteData.contact_id,
      deal_id: noteData.deal_id,
    });
  },

  // Mark task as completed
  async completeTask(taskId) {
    return await this.updateActivity(taskId, {
      outcome: 'completed'
    });
  }
};

export default activitiesService;