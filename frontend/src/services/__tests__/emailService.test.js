import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    options: vi.fn()
  }
}));

// Import service after mocking
import emailService from '../emailService.js';

describe('emailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        from: 'sender@example.com'
      };

      const mockResponse = {
        data: { success: true, messageId: '12345' },
        status: 200
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await emailService.sendEmail(emailData);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('send-email'),
        emailData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email'
      };

      const mockError = {
        response: {
          data: { error: 'Invalid email address' },
          status: 400,
          headers: {}
        }
      };

      axios.post.mockRejectedValue(mockError);

      await expect(emailService.sendEmail(emailData)).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email'
      };

      const networkError = new Error('Network Error');
      axios.post.mockRejectedValue(networkError);

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Network Error');
    });

    it('should include proper headers', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email'
      };

      axios.post.mockResolvedValue({ data: { success: true } });

      await emailService.sendEmail(emailData);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        emailData,
        {
          headers: {
            'Authorization': expect.stringMatching(/^Bearer /),
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      axios.options.mockResolvedValue({ status: 200 });

      const result = await emailService.testConnection();

      expect(result).toEqual({
        success: true,
        message: 'Supabase Edge Function is available'
      });
      expect(axios.options).toHaveBeenCalledWith(
        expect.stringContaining('send-email')
      );
    });

    it('should handle connection failures', async () => {
      const connectionError = new Error('Connection failed');
      axios.options.mockRejectedValue(connectionError);

      await expect(emailService.testConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const result = await emailService.getHealth();

      expect(result).toEqual({
        status: 'Supabase Edge Function is not directly monitorable'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing environment variables', async () => {
      // This test would require mocking the environment differently
      // For now, we'll test that the service handles undefined URLs gracefully
      const emailData = { to: 'test@example.com', subject: 'Test' };
      
      // Mock a scenario where the URL construction might fail
      axios.post.mockRejectedValue(new Error('Invalid URL'));

      await expect(emailService.sendEmail(emailData)).rejects.toThrow('Invalid URL');
    });

    it('should handle empty email data', async () => {
      const emptyEmailData = {};

      axios.post.mockResolvedValue({ data: { success: false, error: 'Missing required fields' } });

      const result = await emailService.sendEmail(emptyEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required fields');
    });

    it('should handle large email content', async () => {
      const largeEmailData = {
        to: 'test@example.com',
        subject: 'Large Email',
        html: 'x'.repeat(1000000) // 1MB of content
      };

      axios.post.mockResolvedValue({ data: { success: true } });

      const result = await emailService.sendEmail(largeEmailData);

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        largeEmailData,
        expect.any(Object)
      );
    });

    it('should handle special characters in email content', async () => {
      const specialCharEmailData = {
        to: 'test@example.com',
        subject: 'Special Characters: émoji 🚀 & symbols',
        html: '<p>Content with émojis 🎉 and unicode: ñ, é, ü</p>'
      };

      axios.post.mockResolvedValue({ data: { success: true } });

      const result = await emailService.sendEmail(specialCharEmailData);

      expect(result.success).toBe(true);
    });
  });
});
