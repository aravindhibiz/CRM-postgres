import apiClient from '../lib/apiClient';

export const contactsService = {
  // Get all contacts for the current user
  async getUserContacts() {
    const { data, error } = await apiClient.get('/api/v1/contacts');

    if (error) {
      console.error('[contactsService] Error fetching contacts:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get contacts sorted by activity count for activity filters
  async getContactsForActivityFilters() {
    const { data, error } = await apiClient.get('/api/v1/contacts/activity-filters');

    if (error) {
      console.error('[contactsService] Error fetching contacts for activity filters:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get a specific contact by ID
  async getContactById(contactId) {
    const { data, error } = await apiClient.get(`/api/v1/contacts/${contactId}`);

    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Create a new contact
  async createContact(contactData) {
    // Clean the data and prepare for API
    const cleanContactData = {
      first_name: contactData.first_name,
      last_name: contactData.last_name,
      email: contactData.email || null,
      phone: contactData.phone || null,
      mobile: contactData.mobile || null,
      position: contactData.position || null,
      status: contactData.status || 'active',
      notes: contactData.notes || null,
      social_linkedin: contactData.social_linkedin || null,
      social_twitter: contactData.social_twitter || null,
      company_id: contactData.company_id || null,
      custom_fields: contactData.custom_fields || undefined
    };

    const { data, error } = await apiClient.post('/api/v1/contacts', cleanContactData);

    if (error) throw error;
    return data;
  },

  // Update a contact
  async updateContact(contactId, updates) {
    // Clean the data and prepare for API (same mapping as create)
    const cleanUpdates = {
      first_name: updates.first_name,
      last_name: updates.last_name,
      email: updates.email || null,
      phone: updates.phone || null,
      mobile: updates.mobile || null,
      position: updates.position || null,
      status: updates.status || null,
      notes: updates.notes || null,
      social_linkedin: updates.social_linkedin || null,
      social_twitter: updates.social_twitter || null,
      company_id: updates.company_id || null,
      custom_fields: updates.custom_fields || undefined
    };

    // Remove undefined values to only send fields that should be updated
    Object.keys(cleanUpdates).forEach(key => {
      if (cleanUpdates[key] === undefined) {
        delete cleanUpdates[key];
      }
    });

    const { data, error } = await apiClient.put(`/api/v1/contacts/${contactId}`, cleanUpdates);

    if (error) throw error;
    return data;
  },

  // Delete a contact
  async deleteContact(contactId) {
    const { data, error } = await apiClient.delete(`/api/v1/contacts/${contactId}`);

    if (error) throw error;
    return true;
  },

  // Delete multiple contacts
  async deleteContacts(contactIds) {
    // Since we don't have bulk delete endpoint, delete one by one
    try {
      await Promise.all(contactIds.map(id => this.deleteContact(id)));
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Search contacts
  async searchContacts(searchQuery) {
    const { data, error } = await apiClient.get(`/api/v1/contacts?search=${encodeURIComponent(searchQuery)}`);

    if (error) throw error;
    return data || [];
  },

  // Filter contacts
  async filterContacts(filters) {
    // Build query parameters from filters
    const params = new URLSearchParams();

    if (filters?.status && filters.status.length > 0) {
      params.append('status', filters.status.join(','));
    }

    if (filters?.companies && filters.companies.length > 0) {
      params.append('companies', filters.companies.join(','));
    }

    if (filters?.leadSources && filters.leadSources.length > 0) {
      params.append('lead_sources', filters.leadSources.join(','));
    }

    if (filters?.dateRange) {
      params.append('date_start', filters.dateRange.start);
      params.append('date_end', filters.dateRange.end);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/contacts?${queryString}` : '/api/v1/contacts';

    const { data, error } = await apiClient.get(endpoint);

    if (error) throw error;
    return data || [];
  },

  // Get contact statistics
  async getContactStats() {
    const { data, error } = await apiClient.get('/api/v1/contacts/stats');

    if (error) {
      // Fallback: calculate stats from all contacts if no specific endpoint
      const contacts = await this.getUserContacts();

      const stats = {
        total: contacts.length || 0,
        active: contacts.filter(c => c.status === 'active').length || 0,
        prospects: contacts.filter(c => c.status === 'prospect').length || 0,
        customers: contacts.filter(c => c.status === 'customer').length || 0,
        leadSources: {}
      };

      // Count by lead source
      contacts.forEach(contact => {
        const source = contact.lead_source || 'unknown';
        stats.leadSources[source] = (stats.leadSources[source] || 0) + 1;
      });

      return stats;
    }

    return data;
  },

  // Subscribe to contact changes (WebSocket alternative - polling)
  subscribeToContacts(callback) {
    // Since we don't have real-time updates, we could implement polling here
    // For now, return a stub that can be called to refresh
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  },

  // Import contacts (bulk create)
  async importContacts(contactsData) {
    const { data, error } = await apiClient.post('/api/v1/contacts/import', contactsData);

    if (error) {
      console.error('Import API error:', error);
      throw error;
    }
    
    // Log errors if any
    if (data?.errors && data.errors.length > 0) {
      console.error('Import errors from backend:', data.errors);
    }
    
    return data;
  },

  // Merge duplicate contacts
  async mergeContacts(primaryContactId, duplicateContactId, mergedData) {
    const { data, error } = await apiClient.post(`/api/v1/contacts/${primaryContactId}/merge`, {
      duplicate_id: duplicateContactId,
      merged_data: mergedData
    });

    if (error) throw error;
    return data;
  }
};

export default contactsService;