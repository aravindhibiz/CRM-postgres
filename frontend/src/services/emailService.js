import apiClient from '../lib/apiClient';

const emailService = {
  sendEmail: async (emailData) => {
    console.log('Attempting to send email with data:', emailData);

    try {
      const { data, error } = await apiClient.post('/emails/send', emailData);

      if (error) throw error;

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Test email server connection
  testConnection: async () => {
    try {
      const { data, error } = await apiClient.get('/emails/test-connection');

      if (error) throw error;

      return { success: true, message: 'Email service is available' };
    } catch (error) {
      console.error('Email service connection test failed:', error);
      throw error;
    }
  },

  // Validate email address format
  validateEmailAddress: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format email data for sending
  formatEmailData: (rawData) => {
    return {
      to: rawData.recipient,
      subject: rawData.title,
      text: rawData.message,
      html: rawData.html || rawData.message,
    };
  },

  // Get email history
  getEmailHistory: async () => {
    try {
      const { data, error } = await apiClient.get('/emails/history');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching email history:', error);
      return [];
    }
  },

  // Log sent email
  logEmailSent: async (emailLog) => {
    try {
      const { data, error } = await apiClient.post('/emails/log', emailLog);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error logging email:', error);
      return { id: Date.now().toString(), ...emailLog };
    }
  },

  // Get email template
  getEmailTemplate: async (templateName) => {
    try {
      const { data, error } = await apiClient.get(`/emails/templates/${templateName}`);

      if (error) {
        if (error.status === 404) {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  },

  // Send bulk email
  sendBulkEmail: async (bulkData) => {
    try {
      const { data, error } = await apiClient.post('/emails/bulk-send', bulkData);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error sending bulk email:', error);
      return [];
    }
  },

  // Get server health status
  getHealth: async () => {
    try {
      const { data, error } = await apiClient.get('/emails/health');

      if (error) throw error;

      return data;
    } catch (error) {
      return { status: 'Email service unavailable' };
    }
  },
};

export default emailService;