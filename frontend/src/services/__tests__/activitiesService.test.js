import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase before importing the service
vi.mock('../../lib/supabase', () => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis()
  };

  return {
    supabase: {
      from: vi.fn(() => mockQuery)
    }
  };
});

import { activitiesService } from '../activitiesService';
import { supabase } from '../../lib/supabase';

describe('activitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserActivities', () => {
    it('should fetch user activities successfully', async () => {
      const mockActivities = [
        { id: '1', type: 'call', subject: 'Follow up call', created_at: '2024-01-01' },
        { id: '2', type: 'email', subject: 'Send proposal', created_at: '2024-01-02' }
      ];

      supabase.from().select().order().limit.mockResolvedValue({ 
        data: mockActivities, 
        error: null 
      });

      const result = await activitiesService.getUserActivities();

      expect(result).toEqual(mockActivities);
      expect(supabase.from).toHaveBeenCalledWith('activities');
    });

    it('should handle empty activities', async () => {
      supabase.from().select().order().limit.mockResolvedValue({ 
        data: null, 
        error: null 
      });

      const result = await activitiesService.getUserActivities();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      supabase.from().select().order().limit.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' }
      });

      await expect(activitiesService.getUserActivities()).rejects.toThrow('Database error');
    });

    it('should respect limit parameter', async () => {
      const mockActivities = [];
      supabase.from().select().order().limit.mockResolvedValue({ 
        data: mockActivities, 
        error: null 
      });

      await activitiesService.getUserActivities(25);

      expect(supabase.from().select().order().limit).toHaveBeenCalledWith(25);
    });
  });

  describe('getDealActivities', () => {
    it('should fetch deal activities successfully', async () => {
      const dealId = 'deal-123';
      const mockActivities = [
        { 
          id: '1', 
          type: 'call', 
          subject: 'Deal discussion',
          contact: { id: '1', first_name: 'John', last_name: 'Doe' },
          user: { id: '1', first_name: 'Jane', last_name: 'Smith' }
        }
      ];

      const selectMock = supabase.from().select();
      selectMock.eq().order.mockResolvedValue({ 
        data: mockActivities, 
        error: null 
      });

      const result = await activitiesService.getDealActivities(dealId);

      expect(result).toEqual(mockActivities);
      expect(supabase.from).toHaveBeenCalledWith('activities');
    });
  });

  describe('createActivity', () => {
    it('should create activity successfully', async () => {
      const activityData = {
        type: 'call',
        subject: 'Client follow-up',
        deal_id: 'deal-123',
        contact_id: 'contact-456'
      };

      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: { id: 'activity-789', ...activityData }, 
        error: null 
      });

      const result = await activitiesService.createActivity(activityData);

      expect(result).toEqual({ id: 'activity-789', ...activityData });
      expect(supabase.from).toHaveBeenCalledWith('activities');
    });

    it('should handle creation errors', async () => {
      const activityData = { type: 'call', subject: 'Test' };
      
      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Validation error' }
      });

      await expect(activitiesService.createActivity(activityData)).rejects.toThrow('Validation error');
    });
  });

  describe('updateActivity', () => {
    it('should update activity successfully', async () => {
      const activityId = 'activity-123';
      const updates = { subject: 'Updated subject' };
      const updatedActivity = { id: activityId, ...updates };

      const updateMock = supabase.from().update();
      updateMock.eq().select().single.mockResolvedValue({ 
        data: updatedActivity, 
        error: null 
      });

      const result = await activitiesService.updateActivity(activityId, updates);

      expect(result).toEqual(updatedActivity);
      expect(supabase.from).toHaveBeenCalledWith('activities');
    });
  });

  describe('deleteActivity', () => {
    it('should delete activity successfully', async () => {
      const activityId = 'activity-123';

      const deleteMock = supabase.from().delete();
      deleteMock.eq.mockResolvedValue({ error: null });

      const result = await activitiesService.deleteActivity(activityId);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('activities');
    });

    it('should handle deletion errors', async () => {
      const activityId = 'activity-123';

      const deleteMock = supabase.from().delete();
      deleteMock.eq.mockResolvedValue({ error: { message: 'Not found' } });

      await expect(activitiesService.deleteActivity(activityId)).rejects.toThrow('Not found');
    });
  });

  describe('logEmail', () => {
    it('should log email activity successfully', async () => {
      const emailData = {
        to: 'client@example.com',
        subject: 'Follow up email',
        body: 'Email content',
        contact_id: 'contact-123'
      };

      const expectedActivity = {
        type: 'email',
        subject: emailData.subject,
        description: `Email sent to ${emailData.to}`,
        contact_id: emailData.contact_id,
        metadata: { to: emailData.to, body: emailData.body }
      };

      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: expectedActivity, 
        error: null 
      });

      const result = await activitiesService.logEmail(emailData);

      expect(result).toEqual(expectedActivity);
    });
  });

  describe('logCall', () => {
    it('should log call activity successfully', async () => {
      const callData = {
        contact_id: 'contact-123',
        duration: 300,
        outcome: 'connected',
        notes: 'Discussed pricing'
      };

      const expectedActivity = {
        type: 'call',
        subject: 'Phone call',
        description: `Call duration: 5 minutes. Outcome: connected`,
        contact_id: callData.contact_id,
        metadata: { duration: callData.duration, outcome: callData.outcome, notes: callData.notes }
      };

      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: expectedActivity, 
        error: null 
      });

      const result = await activitiesService.logCall(callData);

      expect(result).toEqual(expectedActivity);
    });
  });

  describe('logMeeting', () => {
    it('should log meeting activity successfully', async () => {
      const meetingData = {
        contact_id: 'contact-123',
        deal_id: 'deal-456',
        subject: 'Product demo',
        attendees: ['John Doe', 'Jane Smith'],
        duration: 60,
        notes: 'Demo went well'
      };

      const expectedActivity = {
        type: 'meeting',
        subject: meetingData.subject,
        description: `Meeting with ${meetingData.attendees.join(', ')} (1 hour)`,
        contact_id: meetingData.contact_id,
        deal_id: meetingData.deal_id,
        metadata: {
          attendees: meetingData.attendees,
          duration: meetingData.duration,
          notes: meetingData.notes
        }
      };

      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: expectedActivity, 
        error: null 
      });

      const result = await activitiesService.logMeeting(meetingData);

      expect(result).toEqual(expectedActivity);
    });
  });
});
