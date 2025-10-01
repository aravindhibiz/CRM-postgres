// src/pages/settings-administration/components/EmailTemplates.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import emailTemplateService from '../../../services/emailTemplateService';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [mergeFields, setMergeFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    category: 'general',
    content: '',
    status: 'draft'
  });

  const categories = emailTemplateService.getCategories();
  const statuses = emailTemplateService.getStatuses();

  // Load templates and merge fields on component mount
  useEffect(() => {
    loadTemplates();
    loadMergeFields();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailTemplateService.getTemplates();
      setTemplates(response.templates || []);
    } catch (err) {
      setError('Failed to load email templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMergeFields = async () => {
    try {
      const response = await emailTemplateService.getMergeFields();
      setMergeFields(response.fields || []);
    } catch (err) {
      console.error('Failed to load merge fields:', err);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      subject: '',
      category: 'general',
      content: '',
      status: 'draft'
    });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      category: template.category,
      content: template.content,
      status: template.status
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await emailTemplateService.deleteTemplate(templateId);
      await loadTemplates(); // Reload templates
    } catch (err) {
      alert('Failed to delete template');
      console.error(err);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        await emailTemplateService.updateTemplate(editingTemplate.id, templateForm);
      } else {
        await emailTemplateService.createTemplate(templateForm);
      }
      
      setShowTemplateModal(false);
      await loadTemplates(); // Reload templates
    } catch (err) {
      alert('Failed to save template: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const insertMergeField = (field) => {
    const textarea = document.getElementById('template-content');
    const start = textarea?.selectionStart;
    const end = textarea?.selectionEnd;
    const text = templateForm?.content;
    const before = text?.substring(0, start);
    const after = text?.substring(end, text?.length);
    const newContent = before + field + after;
    
    setTemplateForm(prev => ({ ...prev, content: newContent }));
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + field?.length, start + field?.length);
    }, 0);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-success-50 text-success-600 border-success-100',
      draft: 'bg-warning-50 text-warning-600 border-warning-100',
      inactive: 'bg-error-50 text-error-600 border-error-100'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusStyles?.[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryObj = categories?.find(c => c?.value === category);
    return (
      <span className="px-2 py-1 text-xs bg-primary-50 text-primary border border-primary-100 rounded">
        {categoryObj?.label || category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Email Templates</h2>
          <p className="text-text-secondary mt-1">Create and manage email templates with merge fields</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Create Template</span>
        </button>
      </div>
      {/* Templates List */}
      {loading ? (
        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-text-secondary">Loading templates...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <div className="text-error">{error}</div>
          <button 
            onClick={loadTemplates}
            className="mt-2 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Template Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Usage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Modified</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-text-secondary">
                      No email templates found. Create your first template to get started.
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id} className="border-b border-border hover:bg-surface-hover">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Icon name="Mail" size={16} className="text-text-tertiary" />
                          <span className="font-medium text-text-primary">{template.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary max-w-xs truncate">{template.subject}</td>
                      <td className="py-3 px-4">{getCategoryBadge(template.category)}</td>
                      <td className="py-3 px-4">{getStatusBadge(template.status)}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{template.usage_count} times</td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {new Date(template.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            className="p-1 text-text-secondary hover:text-primary transition-colors duration-150"
                            title="Preview"
                          >
                            <Icon name="Eye" size={16} />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-1 text-text-secondary hover:text-primary transition-colors duration-150"
                            title="Edit"
                          >
                            <Icon name="Edit3" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1 text-text-secondary hover:text-error transition-colors duration-150"
                            title="Delete"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Create/Edit Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowTemplateModal(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full relative z-1300 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveTemplate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Template Name</label>
                      <input
                        type="text"
                        value={templateForm?.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="Enter template name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                      <select
                        value={templateForm?.category}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      >
                        {categories?.map(category => (
                          <option key={category?.value} value={category?.value}>{category?.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                      <select
                        value={templateForm?.status}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, status: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      >
                        {statuses?.map(status => (
                          <option key={status?.value} value={status?.value}>{status?.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={templateForm?.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e?.target?.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Enter email subject"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-text-primary mb-1">Email Content</label>
                      <textarea
                        id="template-content"
                        value={templateForm?.content}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                        rows={12}
                        placeholder="Enter email content..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Merge Fields</label>
                      <div className="bg-background border border-border rounded-lg p-3 max-h-80 overflow-y-auto">
                        <div className="space-y-2">
                          {mergeFields?.map((merge) => (
                            <button
                              key={merge?.field}
                              type="button"
                              onClick={() => insertMergeField(merge?.field)}
                              className="w-full text-left p-2 rounded hover:bg-surface-hover transition-colors duration-150 group"
                            >
                              <div className="text-xs font-mono text-primary group-hover:text-primary-600">
                                {merge?.field}
                              </div>
                              <div className="text-xs text-text-tertiary mt-1">
                                {merge?.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(false)}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                    >
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPreview(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full relative z-1300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Template Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Subject:</label>
                    <div className="bg-background border border-border rounded-lg p-3 text-text-primary">
                      {selectedTemplate?.subject}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Content:</label>
                    <div className="bg-background border border-border rounded-lg p-4 text-text-primary whitespace-pre-wrap min-h-40">
                      {selectedTemplate?.content}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Usage Guidelines */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-text-primary text-sm">Template Usage Tips</h4>
            <p className="text-text-secondary text-sm mt-1">
              Use merge fields like {`{{first_name}}`} to personalize emails. Templates marked as 'Active' are available 
              for use in email campaigns. Test your templates before sending to ensure proper formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;