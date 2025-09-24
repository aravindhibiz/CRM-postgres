import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ActivityTemplateModal = ({ isOpen, onClose, onTemplateSelected }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'follow-up-email',
      name: 'Follow-up Email',
      description: 'Standard follow-up email template',
      type: 'email',
      icon: 'Mail',
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
      template: {
        subject: 'Thank you for your time',
        description: 'Hi {contact_name},\n\nThank you for taking the time to meet with me today. I appreciate your insights about {company_name}\'s needs.\n\nAs discussed, I\'ll {next_action} and get back to you by {follow_up_date}.\n\nPlease don\'t hesitate to reach out if you have any questions.\n\nBest regards,\n{user_name}',
        priority: 'low',
        duration_minutes: 10
      }
    }
  ];

  const getIconColor = (type) => {
    switch (type) {
      case 'email':
        return 'text-blue-600 bg-blue-50';
      case 'call':
        return 'text-green-600 bg-green-50';
      case 'meeting':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleTemplateSelect = (template) => {
    onTemplateSelected(template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Activity Templates</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors duration-150"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border border-border rounded-lg p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary-50'
                    : 'hover:border-border-dark'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(template.type)}`}>
                    <Icon name={template.icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary mb-1">{template.name}</h3>
                    <p className="text-sm text-text-secondary">{template.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <span className="px-2 py-1 bg-surface rounded-full">
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </span>
                  <span>{template.template.duration_minutes} min</span>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="mt-6 p-4 border border-border rounded-lg bg-surface">
              <h4 className="font-medium text-text-primary mb-3">Template Preview</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-text-secondary">Subject:</span>
                  <p className="text-text-primary mt-1">{selectedTemplate.template.subject}</p>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Description:</span>
                  <p className="text-text-primary mt-1 whitespace-pre-line">{selectedTemplate.template.description}</p>
                </div>
                <div className="flex items-center space-x-4 text-text-tertiary">
                  <span>Priority: {selectedTemplate.template.priority}</span>
                  <span>Duration: {selectedTemplate.template.duration_minutes} minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-surface">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedTemplate && handleTemplateSelect(selectedTemplate)}
            disabled={!selectedTemplate}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTemplateModal;