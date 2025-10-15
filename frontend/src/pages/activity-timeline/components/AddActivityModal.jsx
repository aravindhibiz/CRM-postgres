import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { activitiesService } from '../../../services/activitiesService';
import { contactsService } from '../../../services/contactsService';
import { dealsService } from '../../../services/dealsService';
import { configService } from '../../../services/configService';
import { CustomFieldsGroup } from '../../../components/CustomFieldInput';
import { customFieldsAPI } from '../../../services/customFieldsAPI';

const AddActivityModal = ({ isOpen, onClose, onActivityAdded, onActivityUpdated, prefilledData = {}, templateData = null, editingActivity = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  const initialFormState = useCallback(() => ({
    type: 'note',
    subject: '',
    description: '',
    contact_id: '',
    deal_id: '',
    duration_minutes: '',
    scheduled_at: '',
    user_id: user?.id || ''
  }), [user]);

  // Template variable substitution
  const substituteTemplateVariables = useCallback((text, selectedContact, selectedDeal) => {
    if (!text) return text;
    
    let substituted = text;
    
    // User variables
    substituted = substituted.replace(/{user_name}/g, user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email || 'User');
    
    // Contact variables
    if (selectedContact) {
      substituted = substituted.replace(/{contact_name}/g, `${selectedContact.first_name} ${selectedContact.last_name}`);
      substituted = substituted.replace(/{company_name}/g, selectedContact.company?.name || 'Company');
    } else {
      substituted = substituted.replace(/{contact_name}/g, '[Contact Name]');
      substituted = substituted.replace(/{company_name}/g, '[Company Name]');
    }
    
    // Deal variables
    if (selectedDeal) {
      substituted = substituted.replace(/{deal_title}/g, selectedDeal.title || '[Deal Title]');
      substituted = substituted.replace(/{deal_value}/g, selectedDeal.value ? formatCurrency(selectedDeal.value) : '[Deal Value]');
    }
    
    // Date variables
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    substituted = substituted.replace(/{today}/g, today.toLocaleDateString());
    substituted = substituted.replace(/{follow_up_date}/g, nextWeek.toLocaleDateString());
    
    // Generic placeholders
    substituted = substituted.replace(/{topic}/g, '[Discussion Topic]');
    substituted = substituted.replace(/{next_action}/g, '[Next Action]');
    
    return substituted;
  }, [user]);

  const loadCustomFields = async () => {
    setCustomFieldsLoading(true);
    try {
      const fields = await customFieldsAPI.getAllFields({
        entity_type: 'activity',
        is_active: true
      });
      
      // Filter fields that should appear in forms
      const formFields = (fields || []).filter(field => 
        field.placement === 'form' || field.placement === 'both'
      );
      
      setCustomFields(formFields);
    } catch (err) {
      console.error('Error loading custom fields:', err);
      setCustomFields([]);
    } finally {
      setCustomFieldsLoading(false);
    }
  };

  const handleCustomFieldChange = (fieldKey, value) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [contactsData, dealsData] = await Promise.all([
            contactsService.getUserContacts(),
            dealsService.getUserDeals()
          ]);
          setContacts(contactsData || []);
          setDeals(dealsData || []);
          
          // Load custom fields for activities
          await loadCustomFields();
        } catch (err) {
          console.error("Error loading modal data:", err);
          setErrors({ submit: "Failed to load contacts and deals." });
        }
      };
      loadData();

      // If editing, populate form with existing activity data
      if (editingActivity) {
        const editFormData = {
          type: editingActivity.type || 'note',
          subject: editingActivity.title || editingActivity.subject || '',
          description: editingActivity.description || '',
          contact_id: editingActivity.contact_id || '',
          deal_id: editingActivity.deal_id || '',
          duration_minutes: editingActivity.duration ? parseInt(editingActivity.duration) : '',
          scheduled_at: editingActivity.scheduled_at || '',
          user_id: editingActivity.user_id || user?.id || ''
        };
        setFormData(editFormData);
        
        // Load custom field values from activity object or API
        if (editingActivity.custom_fields) {
          const fieldValues = {};
          Object.entries(editingActivity.custom_fields).forEach(([key, fieldData]) => {
            if (fieldData?.value !== null && fieldData?.value !== undefined) {
              fieldValues[key] = fieldData.value;
            }
          });
          setCustomFieldValues(fieldValues);
        } else {
          setCustomFieldValues({});
        }
      } else {
        const baseFormData = { ...initialFormState(), ...prefilledData };

        // Apply template data if provided
        if (templateData) {
          const selectedContact = contacts.find(c => c.id === baseFormData.contact_id);
          const selectedDeal = deals.find(d => d.id === baseFormData.deal_id);

          baseFormData.type = templateData.type;
          baseFormData.subject = substituteTemplateVariables(templateData.template.subject, selectedContact, selectedDeal);
          baseFormData.description = substituteTemplateVariables(templateData.template.description, selectedContact, selectedDeal);
          baseFormData.duration_minutes = templateData.template.duration_minutes;
          baseFormData.priority = templateData.template.priority;
        }

        setFormData(baseFormData);
        setCustomFieldValues({});
      }
    } else {
      setFormData({});
      setCustomFieldValues({});
      setErrors({});
    }
  }, [isOpen, editingActivity]);

  // Handle form field changes with template substitution
  const handleFieldChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // If we have template data and contact/deal changed, update template variables
    if (templateData && (field === 'contact_id' || field === 'deal_id')) {
      const selectedContact = contacts.find(c => c.id === (field === 'contact_id' ? value : formData.contact_id));
      const selectedDeal = deals.find(d => d.id === (field === 'deal_id' ? value : formData.deal_id));
      
      updatedFormData.subject = substituteTemplateVariables(templateData.template.subject, selectedContact, selectedDeal);
      updatedFormData.description = substituteTemplateVariables(templateData.template.description, selectedContact, selectedDeal);
    }
    
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const requiredFields = ['type', 'subject'];
      const validationErrors = {};

      requiredFields.forEach(field => {
        if (!formData[field]?.trim()) {
          validationErrors[field] = `${field.replace('_', ' ')} is required`;
        }
      });

      if (['call', 'meeting'].includes(formData.type) && formData.duration_minutes &&
          (isNaN(formData.duration_minutes) || parseInt(formData.duration_minutes) <= 0)) {
        validationErrors.duration_minutes = 'Please enter a valid duration';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        scheduled_at: formData.scheduled_at || null,
        user_id: user?.id,
        contact_id: formData.contact_id && formData.contact_id !== '' ? formData.contact_id : null,
        deal_id: formData.deal_id && formData.deal_id !== '' ? formData.deal_id : null,
        custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined
      };

      console.log('Form data before submit:', formData);
      console.log('Submit data to API:', submitData);

      if (editingActivity) {
        // Update existing activity
        const updatedActivity = await activitiesService.updateActivity(editingActivity.id, submitData);
        console.log('Activity updated:', updatedActivity);
        onActivityUpdated && onActivityUpdated(updatedActivity);
      } else {
        // Create new activity
        const newActivity = await activitiesService.createActivity(submitData);
        console.log('New activity created:', newActivity);
        onActivityAdded(newActivity);
      }
      onClose();

    } catch (err) {
      console.error(`Error ${editingActivity ? 'updating' : 'creating'} activity:`, err);
      setErrors({
        submit: err.message || `Failed to ${editingActivity ? 'update' : 'create'} activity. Please try again.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Use the template-aware field change handler
    handleFieldChange(field, value);
  };

  const activityTypes = [
    { value: 'note', label: 'Note', icon: 'FileText' },
    { value: 'call', label: 'Call', icon: 'Phone' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar' },
    { value: 'task', label: 'Task', icon: 'CheckSquare' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal panel */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 transform transition-all">
          {/* Header */}
          <div className="bg-primary px-6 py-5 rounded-t-xl text-white font-semibold text-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Icon name="Activity" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white" id="modal-title">
                    {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                  </h3>
                  {templateData && !editingActivity && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Icon name="FileTemplate" size={14} className="text-white text-opacity-80" />
                      <span className="text-sm text-white text-opacity-80">Using template: {templateData.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors duration-150"
                aria-label="Close"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="bg-white px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {errors.submit && (
              <div className="mb-6 bg-error-50 border-l-4 border-error text-error p-4 rounded-r-lg flex items-start space-x-3">
                <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                <span>{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activity Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Activity Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {activityTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('type', type.value)}
                      className={`group relative p-4 border-2 rounded-xl transition-all duration-200 ${
                        formData.type === type.value
                          ? 'border-primary bg-primary-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          formData.type === type.value
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary'
                        }`}>
                          <Icon name={type.icon} size={20} />
                        </div>
                        <span className={`text-sm font-medium ${
                          formData.type === type.value ? 'text-primary' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                    errors.subject ? 'border-error' : 'border-gray-200'
                  }`}
                  placeholder="Enter activity subject..."
                  required
                />
                {errors.subject && (
                  <p className="text-sm text-error mt-1 flex items-center space-x-1">
                    <Icon name="AlertCircle" size={14} />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Add details about this activity..."
                />
              </div>

              {/* Related Contact and Deal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Related Contact</label>
                  <div className="relative">
                    <Icon name="User" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.contact_id || ''}
                      onChange={(e) => handleInputChange('contact_id', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select Contact</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Related Deal</label>
                  <div className="relative">
                    <Icon name="TrendingUp" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.deal_id || ''}
                      onChange={(e) => handleInputChange('deal_id', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select Deal</option>
                      {deals.map(deal => (
                        <option key={deal.id} value={deal.id}>{deal.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Duration and DateTime for Calls/Meetings */}
              {['call', 'meeting'].includes(formData.type) && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Icon name="Clock" size={14} className="inline mr-1" />
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.duration_minutes || ''}
                        onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                          errors.duration_minutes ? 'border-error' : 'border-gray-200'
                        }`}
                        placeholder="30"
                      />
                      {errors.duration_minutes && (
                        <p className="text-sm text-error mt-1">{errors.duration_minutes}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Icon name="Calendar" size={14} className="inline mr-1" />
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at || ''}
                        onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="border-t-2 border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                    <Icon name="Settings" size={16} />
                    <span>Custom Fields</span>
                  </h4>
                  <CustomFieldsGroup
                    fields={customFields}
                    values={customFieldValues}
                    onChange={handleCustomFieldChange}
                    loading={customFieldsLoading}
                  />
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t-2 border-gray-100">
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors duration-150"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 font-medium shadow-md hover:shadow-lg transition-all duration-150 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span>{editingActivity ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Icon name={editingActivity ? "Check" : "Plus"} size={16} />
                    <span>{editingActivity ? 'Update Activity' : 'Create Activity'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;
