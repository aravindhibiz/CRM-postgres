import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import { activityTemplatesService } from '../../../services/activityTemplatesService';

const ActivityTemplateModal = ({ isOpen, onClose, onTemplateSelected }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = activityTemplatesService.getBuiltInTemplates();
  const categories = ['all', 'communication', 'sales', 'support'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);



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
          <div className="mb-6">
            <p className="text-text-secondary text-sm mb-4">
              Select a template to quickly create an activity with pre-filled content. Template variables will be automatically substituted with actual data.
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors duration-150 ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
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
            <div className="mt-6 space-y-4">
              <div className="p-4 border border-border rounded-lg bg-surface">
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
              
              <div className="p-4 border border-border rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Icon name="Info" size={16} className="mr-2" />
                  Template Variables
                </h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <p><code className="bg-blue-100 px-1 rounded">{'{contact_name}'}</code> - Contact's full name</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{company_name}'}</code> - Company name</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{user_name}'}</code> - Your name</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{today}'}</code> - Today's date</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{follow_up_date}'}</code> - One week from today</p>
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