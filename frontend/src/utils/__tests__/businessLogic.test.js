import { describe, it, expect } from 'vitest';

/**
 * Critical Business Logic Tests
 * 
 * These tests focus on the most important business calculations and validations
 * without complex mocking. They test pure functions and business rules.
 */

describe('Core Business Logic - Pure Functions', () => {
  
  describe('Revenue Calculations', () => {
    it('should calculate deal conversion rate correctly', () => {
      const deals = [
        { stage: 'closed_won' },
        { stage: 'closed_won' },
        { stage: 'closed_lost' },
        { stage: 'proposal' },
        { stage: 'negotiation' }
      ];

      const conversionRate = calculateConversionRate(deals);
      expect(conversionRate).toBe(40); // 2 won / 5 total * 100
    });

    it('should calculate average deal size', () => {
      const wonDeals = [
        { value: 10000 },
        { value: 25000 },
        { value: 15000 }
      ];

      const avgSize = calculateAverageDealSize(wonDeals);
      expect(avgSize).toBe(16666.67); // Rounded to 2 decimals
    });

    it('should calculate monthly recurring revenue (MRR)', () => {
      const deals = [
        { value: 12000, deal_type: 'subscription', billing_cycle: 'annual' },
        { value: 6000, deal_type: 'subscription', billing_cycle: 'monthly' },
        { value: 5000, deal_type: 'one-time' }
      ];

      const mrr = calculateMRR(deals);
      expect(mrr).toBe(7000); // 12000/12 + 6000 + 0
    });

    it('should handle edge cases in calculations', () => {
      expect(calculateConversionRate([])).toBe(0);
      expect(calculateAverageDealSize([])).toBe(0);
      expect(calculateMRR(null)).toBe(0);
    });
  });

  describe('Contact Management Logic', () => {
    it('should calculate contact health score', () => {
      const contact = {
        last_activity: '2024-01-01',
        total_activities: 15,
        deals_count: 3,
        email_engagement: 0.8
      };

      const healthScore = calculateContactHealthScore(contact);
      expect(healthScore).toBeGreaterThan(0);
      expect(healthScore).toBeLessThanOrEqual(100);
    });

    it('should determine next follow-up date', () => {
      const lastContact = '2024-01-01';
      const priority = 'high';
      
      const nextFollowUp = calculateNextFollowUp(lastContact, priority);
      const expectedDate = new Date('2024-01-03'); // 2 days for high priority
      
      expect(nextFollowUp.getTime()).toBe(expectedDate.getTime());
    });

    it('should validate email format', () => {
      expect(validateEmail('valid@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('Pipeline Management', () => {
    it('should calculate pipeline velocity', () => {
      const deals = [
        { 
          stage: 'closed_won', 
          created_at: '2024-01-01',
          stage_history: [
            { stage: 'lead', date: '2024-01-01' },
            { stage: 'qualified', date: '2024-01-05' },
            { stage: 'proposal', date: '2024-01-10' },
            { stage: 'closed_won', date: '2024-01-15' }
          ]
        }
      ];

      const velocity = calculatePipelineVelocity(deals);
      expect(velocity.averageDaysInPipeline).toBe(14); // 15 - 1
    });

    it('should identify bottleneck stages', () => {
      const stageData = [
        { stage: 'lead', average_days: 3 },
        { stage: 'qualified', average_days: 7 },
        { stage: 'proposal', average_days: 21 }, // Bottleneck
        { stage: 'negotiation', average_days: 5 }
      ];

      const bottlenecks = identifyBottlenecks(stageData);
      expect(bottlenecks[0].stage).toBe('proposal');
      expect(bottlenecks[0].average_days).toBe(21);
    });
  });

  describe('User Permission Logic', () => {
    it('should check user permissions correctly', () => {
      const user = { role: 'sales_manager', permissions: ['view_deals', 'edit_deals'] };
      
      expect(hasPermission(user, 'view_deals')).toBe(true);
      expect(hasPermission(user, 'delete_deals')).toBe(false);
    });

    it('should handle admin permissions', () => {
      const admin = { role: 'admin' };
      
      expect(hasPermission(admin, 'any_permission')).toBe(true);
    });

    it('should validate role hierarchy', () => {
      expect(canManageUser('admin', 'sales_manager')).toBe(true);
      expect(canManageUser('sales_manager', 'sales_rep')).toBe(true);
      expect(canManageUser('sales_rep', 'admin')).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should validate deal data comprehensively', () => {
      const validDeal = {
        name: 'Test Deal',
        value: 10000,
        expected_close_date: '2025-12-31', // Future date
        contact_id: 'contact-123',
        stage: 'proposal'
      };

      const validation = validateDealData(validDeal);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should catch invalid deal data', () => {
      const invalidDeal = {
        name: '', // Empty name
        value: -1000, // Negative value
        expected_close_date: '2023-01-01', // Past date
        stage: 'invalid_stage' // Invalid stage
      };

      const validation = validateDealData(invalidDeal);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate contact data', () => {
      const validContact = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        company_id: 'company-123'
      };

      const validation = validateContactData(validContact);
      expect(validation.isValid).toBe(true);
    });
  });
});

// Pure business logic functions (these would be in utils or services)

function calculateConversionRate(deals) {
  if (!deals || deals.length === 0) return 0;
  
  const wonDeals = deals.filter(deal => deal.stage === 'closed_won').length;
  return Math.round((wonDeals / deals.length) * 100);
}

function calculateAverageDealSize(wonDeals) {
  if (!wonDeals || wonDeals.length === 0) return 0;
  
  const totalValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  return Math.round((totalValue / wonDeals.length) * 100) / 100;
}

function calculateMRR(deals) {
  if (!deals || deals.length === 0) return 0;
  
  return deals.reduce((mrr, deal) => {
    if (deal.deal_type !== 'subscription') return mrr;
    
    if (deal.billing_cycle === 'annual') {
      return mrr + (deal.value / 12);
    } else if (deal.billing_cycle === 'monthly') {
      return mrr + deal.value;
    }
    return mrr;
  }, 0);
}

function calculateContactHealthScore(contact) {
  if (!contact) return 0;
  
  let score = 0;
  
  // Activity recency (30 points max)
  const daysSinceLastActivity = Math.floor(
    (new Date() - new Date(contact.last_activity)) / (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, 30 - daysSinceLastActivity);
  
  // Activity frequency (25 points max)
  score += Math.min(25, contact.total_activities * 2);
  
  // Deal involvement (25 points max)
  score += Math.min(25, contact.deals_count * 8);
  
  // Email engagement (20 points max)
  score += (contact.email_engagement || 0) * 20;
  
  return Math.min(100, Math.round(score));
}

function calculateNextFollowUp(lastContactDate, priority) {
  const lastContact = new Date(lastContactDate);
  const followUpDays = {
    'high': 2,
    'medium': 7,
    'low': 14
  };
  
  const daysToAdd = followUpDays[priority] || 7;
  return new Date(lastContact.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function calculatePipelineVelocity(deals) {
  if (!deals || deals.length === 0) return { averageDaysInPipeline: 0 };
  
  const totalDays = deals.reduce((sum, deal) => {
    const created = new Date(deal.created_at);
    const closed = new Date(deal.stage_history[deal.stage_history.length - 1].date);
    return sum + Math.floor((closed - created) / (1000 * 60 * 60 * 24));
  }, 0);
  
  return {
    averageDaysInPipeline: Math.round(totalDays / deals.length)
  };
}

function identifyBottlenecks(stageData) {
  if (!stageData) return [];
  
  const avgDays = stageData.reduce((sum, stage) => sum + stage.average_days, 0) / stageData.length;
  
  return stageData
    .filter(stage => stage.average_days > avgDays * 1.5)
    .sort((a, b) => b.average_days - a.average_days);
}

function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  return user.permissions?.includes(permission) || false;
}

function canManageUser(managerRole, targetRole) {
  const hierarchy = {
    'admin': 4,
    'sales_manager': 3,
    'sales_rep': 2,
    'user': 1
  };
  
  return (hierarchy[managerRole] || 0) > (hierarchy[targetRole] || 0);
}

function validateDealData(deal) {
  const errors = [];
  
  if (!deal.name || deal.name.trim() === '') {
    errors.push('Deal name is required');
  }
  
  if (deal.value !== undefined && deal.value < 0) {
    errors.push('Deal value must be positive');
  }
  
  if (deal.expected_close_date && new Date(deal.expected_close_date) < new Date()) {
    errors.push('Expected close date cannot be in the past');
  }
  
  const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  if (deal.stage && !validStages.includes(deal.stage)) {
    errors.push('Invalid deal stage');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateContactData(contact) {
  const errors = [];
  
  if (!contact.first_name || contact.first_name.trim() === '') {
    errors.push('First name is required');
  }
  
  if (!contact.last_name || contact.last_name.trim() === '') {
    errors.push('Last name is required');
  }
  
  if (contact.email && !validateEmail(contact.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
