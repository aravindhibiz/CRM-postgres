import axios from 'axios';

// Direct Resend API implementation (for testing or if Edge Function isn't working)
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY; // Add this to your .env file
const SENDER_EMAIL = import.meta.env.VITE_SENDER_EMAIL || "onboarding@resend.dev"; // Use Resend's testing domain

const directEmailService = {
  sendEmail: async (emailData) => {
    console.log('Attempting to send email directly via Resend API:', emailData);
    
    try {
      // Format the request for Resend API
      const payload = {
        from: SENDER_EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
            <p>Hello ${emailData.to.split('@')[0] || ''},</p>
            <div>${emailData.body}</div>
            <p style="margin-top: 20px;">Best regards,<br>CRM-Rocket Team</p>
            <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              Sent via CRM-Rocket
            </div>
          </div>
        `
      };

      if (emailData.cc) payload.cc = emailData.cc;
      if (emailData.bcc) payload.bcc = emailData.bcc;
      
      const response = await axios.post('https://api.resend.com/emails', payload, {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Email sent directly via Resend API:', response.data);
      return {
        success: true,
        data: response.data,
        method: 'direct'
      };
    } catch (error) {
      console.error('Error sending email via Resend API:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  testConnection: async () => {
    try {
      if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }
      return { success: true, message: 'Resend API key is configured' };
    } catch (error) {
      console.error('Resend API test failed:', error);
      throw error;
    }
  },

  getHealth: async () => {
    return { status: 'Direct Resend API integration' };
  },

  // Format HTML email content
  formatHtmlEmail: (content, recipient) => {
    const recipientName = recipient.split('@')[0] || '';
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hello ${recipientName},</p>
        <div>${content}</div>
        <p style="margin-top: 20px;">Best regards,<br>CRM-Rocket Team</p>
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          Sent via CRM-Rocket
        </div>
      </div>
    `;
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
      html: rawData.html || rawData.message,
    };
  },

  // Get email history (placeholder for database integration)
  getEmailHistory: async () => {
    // This would typically query a database
    return [];
  },

  // Log sent email (placeholder for database integration)
  logEmailSent: async (emailLog) => {
    // This would typically save to a database
    return { id: Date.now().toString(), ...emailLog };
  },

  // Get email template (placeholder)
  getEmailTemplate: async (templateName) => {
    // This would typically query a templates database
    return null;
  },

  // Send bulk email (placeholder)
  sendBulkEmail: async (bulkData) => {
    // This would typically process multiple emails
    return [];
  },

  // Validate email configuration
  validateEmailConfiguration: async () => {
    return !!RESEND_API_KEY;
  },

  // Send email with attachment
  sendEmailWithAttachment: async (emailData) => {
    // Resend API supports attachments, but this is a placeholder
    console.warn('Attachments not yet implemented for direct email service');
    return directEmailService.sendEmail(emailData);
  },

  // Track email open
  trackEmailOpen: async (trackingData) => {
    // This would typically log to a database
    console.log('Email tracking:', trackingData);
    return { tracked: true, ...trackingData };
  },

  // Get email delivery status
  getEmailDeliveryStatus: async (emailId) => {
    // This would typically query the Resend API
    return { id: emailId, status: 'delivered' };
  },

  // Retry failed email
  retryFailedEmail: async (emailId) => {
    // This would typically retry sending an email
    return { id: emailId, retried: true };
  },

  // Send email to contact
  sendEmailToContact: async (contactEmail) => {
    // This integrates with contacts data
    return directEmailService.sendEmail({
      to: contactEmail.email,
      subject: contactEmail.subject,
      body: contactEmail.body
    });
  },

  // Schedule email
  scheduleEmail: async (scheduledEmail) => {
    // This would typically use a job queue
    console.log('Email scheduling not implemented, sending immediately');
    return directEmailService.sendEmail(scheduledEmail);
  },
};

export default directEmailService;
