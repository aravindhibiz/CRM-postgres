import apiClient from '../lib/apiClient';

const emailTemplateService = {
  // Get all email templates
  getTemplates: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      const url = `/api/v1/email-templates${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const { data, error } = await apiClient.get(url);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  },

  // Get a specific template
  getTemplate: async (templateId) => {
    try {
      const { data, error } = await apiClient.get(`/api/v1/email-templates/${templateId}`);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email template:', error);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (templateData) => {
    try {
      const { data, error } = await apiClient.post('/api/v1/email-templates', templateData);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  },

  // Update a template
  updateTemplate: async (templateId, templateData) => {
    try {
      const { data, error } = await apiClient.put(`/api/v1/email-templates/${templateId}`, templateData);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (templateId) => {
    try {
      const { data, error } = await apiClient.delete(`/api/v1/email-templates/${templateId}`);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  },

  // Preview template with merge data
  previewTemplate: async (templateId, mergeData) => {
    try {
      const { data, error } = await apiClient.post('/api/v1/email-templates/preview', {
        template_id: templateId,
        merge_data: mergeData
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error previewing email template:', error);
      throw error;
    }
  },

  // Send email using template
  sendEmail: async (emailData) => {
    try {
      const { data, error } = await apiClient.post('/api/v1/email-templates/send', emailData);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Get available merge fields
  getMergeFields: async () => {
    try {
      const { data, error } = await apiClient.get('/api/v1/email-templates/merge-fields');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching merge fields:', error);
      throw error;
    }
  },

  // Get email logs
  getEmailLogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.templateId) queryParams.append('template_id', params.templateId);
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      
      const url = `/api/v1/email-templates/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const { data, error } = await apiClient.get(url);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email logs:', error);
      throw error;
    }
  },

  // Helper function to process merge fields in text
  processMergeFields: (text, mergeData) => {
    if (!text || !mergeData) return text;
    
    let processedText = text;
    Object.entries(mergeData).forEach(([key, value]) => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      processedText = processedText.replace(pattern, value || '');
    });
    
    return processedText;
  },

  // Validate template for merge fields
  validateTemplate: (subject, content) => {
    const mergeFieldPattern = /{{([^}]+)}}/g;
    const allText = `${subject} ${content}`;
    const fields = [];
    let match;
    
    while ((match = mergeFieldPattern.exec(allText)) !== null) {
      if (!fields.includes(match[1])) {
        fields.push(match[1]);
      }
    }
    
    return fields;
  },

  // Get template categories
  getCategories: () => {
    return [
      { value: 'general', label: 'General' },
      { value: 'onboarding', label: 'Onboarding' },
      { value: 'followup', label: 'Follow-up' },
      { value: 'closing', label: 'Deal Closing' },
      { value: 'nurturing', label: 'Lead Nurturing' },
      { value: 'reminder', label: 'Reminders' }
    ];
  },

  // Get template statuses
  getStatuses: () => {
    return [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ];
  }
};

export default emailTemplateService;