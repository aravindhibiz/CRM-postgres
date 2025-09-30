// Template management service for activity templates
export const activityTemplatesService = {
  // Built-in templates
  getBuiltInTemplates() {
    return [
      {
        id: 'follow-up-email',
        name: 'Follow-up Email',
        description: 'Standard follow-up email template',
        type: 'email',
        icon: 'Mail',
        category: 'communication',
        template: {
          subject: 'Follow up on our conversation',
          description: 'Hi {contact_name},\n\nI wanted to follow up on our conversation about {topic}. Do you have any questions or would you like to schedule a call to discuss next steps?\n\nBest regards,\n{user_name}',
          priority: 'medium',
          duration_minutes: 15
        }
      },
      {
        id: 'discovery-call',
        name: 'Discovery Call',
        description: 'Initial discovery call template',
        type: 'call',
        icon: 'Phone',
        category: 'sales',
        template: {
          subject: 'Discovery call with {contact_name}',
          description: 'Discovery call to understand {company_name}\'s needs and challenges.\n\nTopics to cover:\n- Current situation\n- Pain points\n- Goals and objectives\n- Timeline\n- Budget considerations',
          priority: 'high',
          duration_minutes: 30
        }
      },
      {
        id: 'demo-meeting',
        name: 'Product Demo',
        description: 'Product demonstration meeting',
        type: 'meeting',
        icon: 'Monitor',
        category: 'sales',
        template: {
          subject: 'Product demo for {company_name}',
          description: 'Product demonstration meeting with {contact_name} from {company_name}.\n\nDemo agenda:\n- Overview of our solution\n- Key features relevant to their needs\n- Q&A session\n- Next steps discussion',
          priority: 'high',
          duration_minutes: 45
        }
      },
      {
        id: 'proposal-review',
        name: 'Proposal Review',
        description: 'Review proposal with client',
        type: 'meeting',
        icon: 'FileText',
        category: 'sales',
        template: {
          subject: 'Proposal review meeting',
          description: 'Review and discuss the proposal with {contact_name}.\n\nAgenda:\n- Walk through proposal details\n- Address questions and concerns\n- Discuss terms and conditions\n- Timeline for decision',
          priority: 'high',
          duration_minutes: 60
        }
      },
      {
        id: 'check-in-call',
        name: 'Check-in Call',
        description: 'Regular customer check-in',
        type: 'call',
        icon: 'Phone',
        category: 'support',
        template: {
          subject: 'Regular check-in with {contact_name}',
          description: 'Scheduled check-in call to ensure customer satisfaction and identify any issues or opportunities.\n\nDiscussion points:\n- How things are going\n- Any challenges or concerns\n- Feedback on our service\n- Upcoming needs or projects',
          priority: 'medium',
          duration_minutes: 20
        }
      },
      {
        id: 'thank-you-email',
        name: 'Thank You Email',
        description: 'Post-meeting thank you',
        type: 'email',
        icon: 'Heart',
        category: 'communication',
        template: {
          subject: 'Thank you for your time',
          description: 'Hi {contact_name},\n\nThank you for taking the time to meet with me today. I appreciate your insights about {company_name}\'s needs.\n\nAs discussed, I\'ll {next_action} and get back to you by {follow_up_date}.\n\nPlease don\'t hesitate to reach out if you have any questions.\n\nBest regards,\n{user_name}',
          priority: 'low',
          duration_minutes: 10
        }
      },
      {
        id: 'contract-negotiation',
        name: 'Contract Negotiation',
        description: 'Contract terms discussion meeting',
        type: 'meeting',
        icon: 'FileCheck',
        category: 'sales',
        template: {
          subject: 'Contract negotiation with {company_name}',
          description: 'Meeting to discuss and negotiate contract terms with {contact_name}.\n\nAgenda:\n- Review contract terms\n- Discuss pricing and payment terms\n- Address legal requirements\n- Finalize implementation timeline\n- Next steps for signing',
          priority: 'high',
          duration_minutes: 90
        }
      },
      {
        id: 'onboarding-kickoff',
        name: 'Onboarding Kickoff',
        description: 'Customer onboarding initialization',
        type: 'meeting',
        icon: 'Users',
        category: 'support',
        template: {
          subject: 'Welcome to {company_name} - Onboarding kickoff',
          description: 'Onboarding kickoff meeting with {contact_name} to begin implementation.\n\nAgenda:\n- Welcome and introductions\n- Project timeline overview\n- Resource requirements\n- Communication protocols\n- Initial setup steps',
          priority: 'high',
          duration_minutes: 60
        }
      }
    ];
  },

  // Get templates by category
  getTemplatesByCategory(category) {
    return this.getBuiltInTemplates().filter(template => template.category === category);
  },

  // Get templates by type
  getTemplatesByType(type) {
    return this.getBuiltInTemplates().filter(template => template.type === type);
  },

  // Get template by ID
  getTemplateById(id) {
    return this.getBuiltInTemplates().find(template => template.id === id);
  },

  // Available template variables with descriptions
  getAvailableVariables() {
    return {
      contact_name: 'Contact\'s full name',
      company_name: 'Company name',
      user_name: 'Current user\'s name',
      deal_title: 'Deal title',
      deal_value: 'Deal value (formatted)',
      today: 'Today\'s date',
      follow_up_date: 'One week from today',
      topic: 'Discussion topic (placeholder)',
      next_action: 'Next action item (placeholder)'
    };
  },

  // Substitute template variables
  substituteVariables(text, context = {}) {
    if (!text) return text;
    
    let substituted = text;
    
    // User variables
    if (context.user) {
      const userName = context.user.first_name && context.user.last_name 
        ? `${context.user.first_name} ${context.user.last_name}` 
        : context.user.email || 'User';
      substituted = substituted.replace(/{user_name}/g, userName);
    }
    
    // Contact variables
    if (context.contact) {
      substituted = substituted.replace(/{contact_name}/g, `${context.contact.first_name} ${context.contact.last_name}`);
      substituted = substituted.replace(/{company_name}/g, context.contact.company?.name || '[Company Name]');
    }
    
    // Deal variables
    if (context.deal) {
      substituted = substituted.replace(/{deal_title}/g, context.deal.title || '[Deal Title]');
      substituted = substituted.replace(/{deal_value}/g, 
        context.deal.value ? `$${context.deal.value.toLocaleString()}` : '[Deal Value]');
    }
    
    // Date variables
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    substituted = substituted.replace(/{today}/g, today.toLocaleDateString());
    substituted = substituted.replace(/{follow_up_date}/g, nextWeek.toLocaleDateString());
    
    // Generic placeholders (if not provided in context)
    substituted = substituted.replace(/{contact_name}/g, '[Contact Name]');
    substituted = substituted.replace(/{company_name}/g, '[Company Name]');
    substituted = substituted.replace(/{user_name}/g, '[User Name]');
    substituted = substituted.replace(/{topic}/g, '[Discussion Topic]');
    substituted = substituted.replace(/{next_action}/g, '[Next Action]');
    
    return substituted;
  }
};

export default activityTemplatesService;