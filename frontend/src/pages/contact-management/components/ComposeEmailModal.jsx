import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import emailService from '../../../services/emailService';
import emailTemplateService from '../../../services/emailTemplateService';
import geminiService from '../../../services/geminiService';
import dealsService from '../../../services/dealsService';
import activitiesService from '../../../services/activitiesService';
import tasksService from '../../../services/tasksService';
import { systemConfigService } from '../../../services/systemConfigService';

const ComposeEmailModal = ({ contact, onClose, onSend }) => {
  const [emailData, setEmailData] = useState({
    to: contact?.email,
    subject: '',
    body: '',
    cc: '',
    bcc: ''
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [companyEmail, setCompanyEmail] = useState('');
  const [attachments, setAttachments] = useState([]);
  
  // Related entities
  const [availableDeals, setAvailableDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Template context detection
  const [templateContext, setTemplateContext] = useState({
    hasContactFields: false,
    hasDealFields: false,
    hasActivityFields: false,
    hasTaskFields: false
  });

  // Load templates and related entities on mount
  useEffect(() => {
    loadTemplates();
    loadRelatedEntities();
    loadCompanyEmail();
  }, [contact]);

  const loadCompanyEmail = async () => {
    try {
      const email = await systemConfigService.getCompanyEmail();
      setCompanyEmail(email);
    } catch (error) {
      console.error('Failed to load company email:', error);
      setCompanyEmail('noreply@company.com');
    }
  };

  const loadTemplates = async () => {
    try {
      // Load all templates (both active and draft) for selection
      const response = await emailTemplateService.getTemplates();
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadRelatedEntities = async () => {
    if (!contact?.id) return;
    
    try {
      // Fetch deals related to this contact
      const deals = await dealsService.getUserDeals();
      
      // Filter deals for this contact
      const contactDeals = deals.filter(deal => 
        deal.contact_id === contact.id || 
        deal.contact?.id === contact.id
      );
      
      if (contactDeals && contactDeals.length > 0) {
        // Sort by creation date (most recent first)
        const sortedDeals = contactDeals.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setAvailableDeals(sortedDeals);
        // Auto-select the most recent deal
        setSelectedDeal(sortedDeals[0]);
      }

      // Fetch activities related to this contact
      const activities = await activitiesService.getUserActivities(100);
      const contactActivities = activities.filter(activity => 
        activity.contact_id === contact.id ||
        activity.contact?.id === contact.id
      );
      
      if (contactActivities && contactActivities.length > 0) {
        const sortedActivities = contactActivities.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setAvailableActivities(sortedActivities);
        setSelectedActivity(sortedActivities[0]);
      }

      // Fetch tasks related to this contact
      const tasks = await tasksService.getUserTasks();
      const contactTasks = tasks.filter(task => 
        task.contact_id === contact.id ||
        task.contact?.id === contact.id
      );
      
      if (contactTasks && contactTasks.length > 0) {
        const sortedTasks = contactTasks.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setAvailableTasks(sortedTasks);
        setSelectedTask(sortedTasks[0]);
      }
    } catch (error) {
      console.error('Failed to load related entities:', error);
      // Don't show error to user - this is optional data
    }
  };

  const detectTemplateContext = (template) => {
    if (!template) return;
    
    const content = (template.subject || '') + ' ' + (template.content || '');
    
    // Detect different types of merge fields in the template
    const hasDealFields = 
      /\{\{deal_name\}\}/i.test(content) ||
      /\{\{deal_value\}\}/i.test(content) ||
      /\{\{deal_stage\}\}/i.test(content) ||
      /\{\{custom_budget_range\}\}/i.test(content) ||
      /\{\{custom_deal_priority[_0-9]*\}\}/i.test(content) ||
      /\{\{custom_deal_or_no_deal\}\}/i.test(content);
    
    const hasActivityFields =
      /\{\{custom_detailed_desc\}\}/i.test(content) ||
      /\{\{custom_football\}\}/i.test(content);
    
    const hasTaskFields =
      /\{\{custom_followup_date\}\}/i.test(content);
    
    setTemplateContext({
      hasContactFields: true, // Always true when using contact modal
      hasDealFields,
      hasActivityFields,
      hasTaskFields
    });
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setEmailData({
      ...emailData,
      [name]: value
    });
  };

  const handleTemplateChange = async (templateId) => {
    setSelectedTemplate(templateId);
    
    if (!templateId) {
      setTemplateContext({
        hasContactFields: false,
        hasDealFields: false,
        hasActivityFields: false,
        hasTaskFields: false
      });
      return;
    }

    try {
      // Get the template to detect what fields it uses
      const selectedTemplateObj = templates.find(t => t.id === templateId);
      if (selectedTemplateObj) {
        detectTemplateContext(selectedTemplateObj);
      }

      const mergeData = {
        first_name: contact?.first_name || '',
        last_name: contact?.last_name || '',
        full_name: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim(),
        email: contact?.email || '',
        phone: contact?.phone || '',
        company_name: contact?.company?.name || '',
        position: contact?.position || ''
      };

      const preview = await emailTemplateService.previewTemplate(
        templateId, 
        mergeData,
        contact?.id || null,  // Pass contact_id
        selectedDeal?.id || null,  // Pass selected deal_id
        selectedActivity?.id || null,  // Pass selected activity_id
        selectedTask?.id || null  // Pass selected task_id
      );
      
      setEmailData(prev => ({
        ...prev,
        subject: preview.subject,
        body: preview.content
      }));
    } catch (error) {
      console.error('Failed to load template:', error);
      alert('Failed to load template');
    }
  };

  const handleDealChange = async (dealId) => {
    const deal = availableDeals.find(d => d.id === dealId);
    setSelectedDeal(deal || null);
    
    // Re-preview the template with the new deal
    if (selectedTemplate) {
      await handleTemplateChange(selectedTemplate);
    }
  };

  const handleActivityChange = async (activityId) => {
    const activity = availableActivities.find(a => a.id === activityId);
    setSelectedActivity(activity || null);
    
    // Re-preview the template with the new activity
    if (selectedTemplate) {
      await handleTemplateChange(selectedTemplate);
    }
  };

  const handleTaskChange = async (taskId) => {
    const task = availableTasks.find(t => t.id === taskId);
    setSelectedTask(task || null);
    
    // Re-preview the template with the new task
    if (selectedTemplate) {
      await handleTemplateChange(selectedTemplate);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSending(true);
    try {
      // Prepare form data if there are attachments
      let emailPayload;
      
      if (attachments.length > 0) {
        // Use FormData for attachments
        const formData = new FormData();
        formData.append('to', emailData.to);
        formData.append('subject', emailData.subject);
        formData.append('content', emailData.body);
        
        if (emailData.cc) {
          const ccEmails = emailData.cc.split(',').map(email => email.trim());
          ccEmails.forEach(email => {
            formData.append('cc', email);
          });
        }
        
        if (emailData.bcc) {
          const bccEmails = emailData.bcc.split(',').map(email => email.trim());
          bccEmails.forEach(email => {
            formData.append('bcc', email);
          });
        }
        
        // Note: When using attachments, we send the already-merged content
        // The template merge has already been applied to emailData.subject and emailData.body
        // So we don't need to send merge_data or template_id
        
        // Add attachments
        attachments.forEach((attachment) => {
          formData.append('attachments', attachment.file);
        });
        
        emailPayload = formData;
      } else {
        // Use regular JSON for no attachments
        emailPayload = {
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.body,
          cc: emailData.cc ? emailData.cc.split(',').map(email => email.trim()) : undefined,
          bcc: emailData.bcc ? emailData.bcc.split(',').map(email => email.trim()) : undefined,
          template_id: selectedTemplate || undefined,
          merge_data: {
            first_name: contact?.first_name || '',
            last_name: contact?.last_name || '',
            full_name: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim(),
            email: contact?.email || '',
            phone: contact?.phone || '',
            company_name: contact?.company?.name || '',
            position: contact?.position || ''
          }
        };
      }

      const response = await emailTemplateService.sendEmail(emailPayload);
      
      
      // Show success notification with sender email
      if (response?.success && response?.sender_email) {
      }
      
      onSend({
        ...emailData,
        timestamp: new Date()?.toISOString(),
        contactId: contact?.id,
        status: response?.success ? 'sent' : 'failed',
        sender_email: response?.sender_email,
        attachments: attachments.map(att => ({ name: att.name, size: att.size, type: att.type }))
      });
      onClose();
    } catch (error) {
      console.error('Email sending failed:', error);
      
      let errorMessage = 'Failed to send email. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = `Failed to send email: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Failed to send email: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateEmail = async () => {
    try {
      setIsGenerating(true);
      
      
      // Pass current form values and contact info to the service
      const generated = await geminiService.generateEmailContent(
        contact, 
        emailData.subject, 
        emailData.body
      );
      
      setGeneratedContent(generated);
      setShowPreview(true);
    } catch (error) {
      console.error('❌ Failed to generate email content:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show more detailed error message
      let errorMessage = 'Failed to generate email content.';
      if (error.message.includes('not configured')) {
        errorMessage = '⚠️ Gemini API key is not configured. Please restart the dev server.';
      } else if (error.message.includes('invalid')) {
        errorMessage = '⚠️ Gemini API key is invalid. Please check your configuration.';
      } else if (error.message.includes('quota')) {
        errorMessage = '⚠️ Gemini API quota exceeded. Please try again later.';
      } else {
        errorMessage = `Failed to generate email: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedContent) {
      setEmailData({
        ...emailData,
        subject: generatedContent.subject,
        body: generatedContent.body
      });
      setShowPreview(false);
      setGeneratedContent(null);
    }
  };

  const handleDiscardGenerated = () => {
    setShowPreview(false);
    setGeneratedContent(null);
  };

  // File attachment handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to attachments
    const newAttachments = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset input
    e.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType.includes('pdf')) return 'FileText';
    if (fileType.includes('word') || fileType.includes('document')) return 'FileText';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'Table';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'Presentation';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'Archive';
    return 'File';
  };

  return (
    <>
      <div className="fixed inset-0 z-1100 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text-primary">Compose Email</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="px-6 py-5">
              <div className="space-y-4">
                {/* From field - Display only */}
                {companyEmail && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      From
                    </label>
                    <div className="flex items-center px-3 py-2 bg-surface-secondary rounded-lg border border-border">
                      <Icon name="Mail" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-primary">{companyEmail}</span>
                      <span className="ml-2 text-xs text-text-tertiary">(Company Email)</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    To
                  </label>
                  <div className="flex items-center">
                    <input
                      type="email"
                      name="to"
                      value={emailData?.to}
                      onChange={handleChange}
                      className="input-field"
                      readOnly
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email Template (Optional)
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.status === 'draft' ? '(Draft)' : template.status === 'inactive' ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate && (
                    <p className="text-xs text-text-tertiary mt-1">
                      Template content will be merged with contact information
                      {selectedDeal && ` and deal "${selectedDeal.name}"`}
                    </p>
                  )}
                </div>

                {/* Deal Selector - Only show if template has deal fields */}
                {selectedTemplate && templateContext.hasDealFields && availableDeals.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                      <Icon name="Briefcase" size={16} />
                      Select Deal for Merge Fields
                    </label>
                    <select
                      value={selectedDeal?.id || ''}
                      onChange={(e) => handleDealChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="">No deal selected</option>
                      {availableDeals.map((deal) => (
                        <option key={deal.id} value={deal.id}>
                          {deal.name} - ${deal.value?.toLocaleString() || '0'} ({deal.stage})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-tertiary mt-2">
                      This template contains deal merge fields. Select which deal to use.
                    </p>
                  </div>
                )}

                {/* Activity Selector - Only show if template has activity fields */}
                {selectedTemplate && templateContext.hasActivityFields && availableActivities.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      Select Activity for Merge Fields
                    </label>
                    <select
                      value={selectedActivity?.id || ''}
                      onChange={(e) => handleActivityChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="">No activity selected</option>
                      {availableActivities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.subject} - {activity.type} ({new Date(activity.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-tertiary mt-2">
                      This template contains activity merge fields. Select which activity to use.
                    </p>
                  </div>
                )}

                {/* Task Selector - Only show if template has task fields */}
                {selectedTemplate && templateContext.hasTaskFields && availableTasks.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                      <Icon name="CheckSquare" size={16} />
                      Select Task for Merge Fields
                    </label>
                    <select
                      value={selectedTask?.id || ''}
                      onChange={(e) => handleTaskChange(e.target.value)}
                      className="input-field"
                    >
                      <option value="">No task selected</option>
                      {availableTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title} - {task.status} ({task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-tertiary mt-2">
                      This template contains task merge fields. Select which task to use.
                    </p>
                  </div>
                )}
                
                {showCcBcc && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Cc
                      </label>
                      <input
                        type="text"
                        name="cc"
                        value={emailData?.cc}
                        onChange={handleChange}
                        placeholder="email@example.com, another@example.com"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Bcc
                      </label>
                      <input
                        type="text"
                        name="bcc"
                        value={emailData?.bcc}
                        onChange={handleChange}
                        placeholder="email@example.com, another@example.com"
                        className="input-field"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={emailData?.subject}
                    onChange={handleChange}
                    placeholder="Enter email subject"
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Message
                  </label>
                  <textarea
                    name="body"
                    value={emailData?.body}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Write your message here..."
                    className="input-field"
                    required
                  ></textarea>
                </div>

                {/* Attachments Section */}
                {attachments.length > 0 && (
                  <div className="border border-border rounded-lg p-4 bg-surface-hover">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-text-primary">
                        Attachments ({attachments.length})
                      </label>
                      <span className="text-xs text-text-tertiary">
                        Total: {formatFileSize(attachments.reduce((sum, att) => sum + att.size, 0))}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <Icon name={getFileIcon(attachment.type)} size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-text-tertiary">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            className="ml-2 p-1 text-error hover:bg-error-light rounded transition-colors"
                            title="Remove attachment"
                          >
                            <Icon name="X" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  {showCcBcc ? 'Hide' : 'Show'} Cc/Bcc
                </button>
                <button
                  type="button"
                  onClick={handleGenerateEmail}
                  disabled={isGenerating}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-md hover:from-purple-600 hover:to-indigo-600 transition-all duration-150 ease-out text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader" size={14} className="animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={14} className="mr-1.5" />
                      Generate Email
                    </>
                  )}
                </button>
                
                {/* File Attachment Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-attachment"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                  />
                  <label
                    htmlFor="file-attachment"
                    className="inline-flex items-center px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md cursor-pointer transition-all duration-150 ease-out"
                    title="Attach files (PDF, DOC, XLS, etc.)"
                  >
                    <Icon name="Paperclip" size={16} />
                    {attachments.length > 0 && (
                      <span className="ml-1 text-xs bg-primary text-white rounded-full px-1.5 py-0.5">
                        {attachments.length}
                      </span>
                    )}
                  </label>
                </div>
                
                {/* Image Attachment Button */}
                <div className="relative">
                  <input
                    type="file"
                    id="image-attachment"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*"
                  />
                  <label
                    htmlFor="image-attachment"
                    className="inline-flex items-center px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md cursor-pointer transition-all duration-150 ease-out"
                    title="Attach images"
                  >
                    <Icon name="Image" size={16} />
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !emailData?.subject || !emailData?.body}
                  className={`btn-primary inline-flex items-center ${
                    isSending || !emailData?.subject || !emailData?.body
                      ? 'opacity-50 cursor-not-allowed' :''
                  }`}
                >
                  {isSending ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-2" />
                      Sending...
                      
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} className="mr-2" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

      {/* Generated Content Preview Modal */}
      {showPreview && generatedContent && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
            
            <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-surface px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon name="Sparkles" size={20} className="text-purple-500 mr-2" />
                    <h3 className="text-lg font-medium text-text-primary">
                      Generated Email Content
                    </h3>
                  </div>
                  <button
                    onClick={handleDiscardGenerated}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
              </div>
              
              <div className="bg-surface px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Generated Subject:
                    </label>
                    <div className="p-3 bg-surface-secondary border border-border rounded-lg">
                      <p className="text-text-primary">{generatedContent.subject}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Generated Body:
                    </label>
                    <div className="p-3 bg-surface-secondary border border-border rounded-lg">
                      <div className="text-text-primary whitespace-pre-wrap">
                        {generatedContent.body}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface px-6 py-4 border-t border-border">
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={handleDiscardGenerated}
                    className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleUseGenerated}
                    className="btn-primary inline-flex items-center"
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Use This Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComposeEmailModal;