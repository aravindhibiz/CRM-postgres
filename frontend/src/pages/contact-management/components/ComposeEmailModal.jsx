import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import emailService from '../../../services/emailService';
import emailTemplateService from '../../../services/emailTemplateService';
import geminiService from '../../../services/geminiService';

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

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await emailTemplateService.getTemplates({ status: 'active' });
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
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
      return;
    }

    try {
      const mergeData = {
        first_name: contact?.first_name || '',
        last_name: contact?.last_name || '',
        full_name: `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim(),
        email: contact?.email || '',
        phone: contact?.phone || '',
        company_name: contact?.company?.name || '',
        position: contact?.position || ''
      };

      const preview = await emailTemplateService.previewTemplate(templateId, mergeData);
      
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSending(true);
    try {
      console.log('Submitting email with data:', {
        to: emailData?.to,
        subject: emailData?.subject,
        body: emailData?.body,
        cc: emailData?.cc ? emailData.cc.split(',').map(email => email.trim()) : undefined,
        bcc: emailData?.bcc ? emailData.bcc.split(',').map(email => email.trim()) : undefined,
        template_id: selectedTemplate || undefined,
        contactId: contact?.id
      });
      
      // Use the email template service for sending
      const emailPayload = {
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

      const response = await emailTemplateService.sendEmail(emailPayload);
      
      console.log('Email response:', response);
      
      onSend({
        ...emailData,
        timestamp: new Date()?.toISOString(),
        contactId: contact?.id,
        status: response?.success ? 'sent' : 'failed'
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
      console.error('Failed to generate email content:', error);
      alert('Failed to generate email content. Please try again.');
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
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {selectedTemplate && (
                    <p className="text-xs text-text-tertiary mt-1">
                      Template content will be merged with contact information
                    </p>
                  )}
                </div>
                
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
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="Paperclip" size={16} />
                </button>
                <button
                  type="button"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Icon name="Image" size={16} />
                </button>
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