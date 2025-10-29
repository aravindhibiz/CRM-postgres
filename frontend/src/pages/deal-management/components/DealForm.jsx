import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { contactsService } from '../../../services/contactsService';
import { companiesService } from '../../../services/companiesService';
import { CustomFieldsGroup } from '../../../components/CustomFieldInput';
import { customFieldsAPI } from '../../../services/customFieldsAPI';

const DealForm = ({ deal = null, contacts = [], companies = [], stages = [], onSubmit, onCancel, isSaving = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef(null);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    stage: 'lead',
    probability: 10,
    expected_close_date: '',
    contact_id: '',
    company_id: '',
    lead_source: 'website',
    owner_id: user?.id || ''
  });
  const [errors, setErrors] = useState({});

  // Populate form when deal prop changes
  useEffect(() => {
    console.log('DealForm useEffect triggered with deal:', deal);
    
    // Load custom fields
    loadCustomFields();
    
    if (deal) {
      console.log('Populating form with deal data:', deal);
      setFormData({
        name: deal?.name || '',
        description: deal?.description || '',
        value: deal?.value?.toString() || '',
        stage: deal?.stage || 'lead',
        probability: deal?.probability || 10,
        expected_close_date: deal?.expected_close_date || '',
        contact_id: deal?.contact_id || '',
        company_id: deal?.company_id || '',
        lead_source: deal?.lead_source || 'website',
        owner_id: deal?.owner_id || user?.id || ''
      });

      // Load custom field values from deal object or API
      if (deal?.custom_fields) {
        // Use custom_fields from deal object (already includes values)
        console.log('Using custom fields from deal object:', deal.custom_fields);
        const fieldValues = {};
        Object.entries(deal.custom_fields).forEach(([key, fieldData]) => {
          if (fieldData?.value !== null && fieldData?.value !== undefined) {
            fieldValues[key] = fieldData.value;
          }
        });
        console.log('Custom field values extracted:', fieldValues);
        setCustomFieldValues(fieldValues);
      } else if (deal?.id) {
        // Fallback: Load from API
        loadCustomFieldValues(deal.id);
      }
    } else {
      // Reset form for new deal
      setFormData({
        name: '',
        description: '',
        value: '',
        stage: 'lead',
        probability: 10,
        expected_close_date: '',
        contact_id: '',
        company_id: '',
        lead_source: 'website',
        owner_id: user?.id || ''
      });
      setCustomFieldValues({});
    }
  }, [deal, user?.id]);

  const loadCustomFields = async () => {
    setCustomFieldsLoading(true);
    try {
      console.log('Loading custom fields for deals...');
      const fields = await customFieldsAPI.getAllFields({
        entity_type: 'deal',
        is_active: true
      });
      
      // Filter fields that should appear in forms
      const formFields = (fields || []).filter(field => 
        field.placement === 'form' || field.placement === 'both'
      );
      
      console.log('Custom fields loaded:', formFields);
      setCustomFields(formFields);
    } catch (err) {
      console.error('Error loading custom fields:', err);
      setCustomFields([]);
    } finally {
      setCustomFieldsLoading(false);
    }
  };

  const loadCustomFieldValues = async (dealId) => {
    try {
      console.log('Loading custom field values for deal:', dealId);
      const fieldsWithValues = await customFieldsAPI.getEntityCustomFields('deal', dealId);
      
      const fieldValues = {};
      fieldsWithValues.forEach(field => {
        if (field.current_value !== null && field.current_value !== undefined) {
          fieldValues[field.field_key] = field.current_value;
        }
      });
      
      console.log('Custom field values loaded:', fieldValues);
      setCustomFieldValues(fieldValues);
    } catch (err) {
      console.error('Error loading custom field values:', err);
      setCustomFieldValues({});
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Prevent double submission with multiple guards
    if (loading || isSubmitting || submissionRef.current) {
      console.log('Form submission blocked - already processing');
      return;
    }
    
    const submissionId = Date.now();
    submissionRef.current = submissionId;
    
    console.log('Starting form submission...', submissionId);
    setLoading(true);
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['name', 'value'];
      const validationErrors = {};
      
      requiredFields?.forEach(field => {
        if (!formData?.[field]?.toString()?.trim()) {
          validationErrors[field] = `${field?.replace('_', ' ')} is required`;
        }
      });

      // Value validation
      if (formData?.value && (isNaN(formData?.value) || parseFloat(formData?.value) < 0)) {
        validationErrors.value = 'Please enter a valid deal value';
      }

      // Date validation
      if (formData?.expected_close_date && new Date(formData?.expected_close_date) < new Date()) {
        validationErrors.expected_close_date = 'Expected close date cannot be in the past';
      }

      if (Object.keys(validationErrors)?.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        value: parseFloat(formData?.value) || null,
        stage: formData.stage || 'lead',
        probability: parseInt(formData.probability) || 0,
        expected_close_date: formData?.expected_close_date || null,
        source: formData.source || null,
        next_action: formData.next_action || null,
        company_id: formData.company_id || null,
        contact_id: formData.contact_id || null,
        custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined
      };

      // Remove undefined values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      // Pass data to parent component for API call
      console.log('Submitting form data to parent component:', submitData);
      await onSubmit(submitData);
      
      console.log('Form submission completed successfully');
    } catch (err) {
      console.error('Error in form submission:', err);
      
      // Handle different error formats
      let errorMessage = 'Failed to save deal. Please try again.';
      
      if (err?.message) {
        if (Array.isArray(err.message)) {
          // Handle validation errors (array of error objects)
          errorMessage = err.message.map(error => error.msg || error).join(', ');
        } else if (typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      
      setErrors({ 
        submit: errorMessage
      });
    } finally {
      console.log('Form submission completed, resetting states...');
      setLoading(false);
      setIsSubmitting(false);
      submissionRef.current = null;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update probability based on stage
    if (field === 'stage') {
      const stageProbs = {
        lead: 10,
        qualified: 25,
        proposal: 50,
        negotiation: 75,
        closed_won: 100,
        closed_lost: 0
      };
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        probability: stageProbs?.[value] || prev?.probability
      }));
    }
    
    // Clear field error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[field];
        return newErrors;
      });
    }
  };

  const handleCustomFieldChange = (fieldKey, value) => {
    if (!fieldKey) return;
    
    setCustomFieldValues(prev => ({ 
      ...prev, 
      [fieldKey]: value 
    }));
    
    // Clear field error when user changes value
    if (errors?.[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[fieldKey];
        return newErrors;
      });
    }
  };

  // Handle contact change and auto-populate company
  const handleContactChange = (contactId) => {
    const selectedContact = contacts?.find(c => c?.id === contactId);
    setFormData(prev => ({
      ...prev,
      contact_id: contactId,
      company_id: selectedContact?.company_id || prev?.company_id
    }));
  };

  // Use stages prop or fallback to default stages
  const dealStages = stages.length > 0 ? stages : [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' }
  ];

  const leadSources = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email_campaign', label: 'Email Campaign' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'event', label: 'Event' },
    { value: 'partner', label: 'Partner' },
    { value: 'other', label: 'Other' }
  ];

  console.log('DealForm rendering - deal:', deal?.id, 'contacts:', contacts.length, 'companies:', companies.length, 'stages:', stages.length);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Actions - Top */}
      <div className="flex justify-between items-center py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary">
          {deal ? 'Edit Deal' : 'Create New Deal'}
        </h3>
        <button
          type="submit"
          disabled={loading || isSaving || isSubmitting}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(loading || isSaving || isSubmitting) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>{deal ? 'Update Deal' : 'Create Deal'}</span>
        </button>
      </div>

      {/* Error Messages */}
      {errors?.submit && (
        <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg flex items-center space-x-2">
          <Icon name="AlertCircle" size={20} />
          <span>{errors?.submit}</span>
        </div>
      )}

      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Deal Name *
        </label>
        <input
          type="text"
          value={formData?.name}
          onChange={(e) => handleInputChange('name', e?.target?.value)}
          className={`w-full px-3 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary ${
            errors?.name ? 'border-error' : 'border-border'
          }`}
          placeholder="Enterprise Software License - Acme Corp"
          required
        />
        {errors?.name && (
          <p className="text-sm text-error mt-1">{errors?.name}</p>
        )}
      </div>

      {/* Value and Probability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Deal Value *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData?.value}
              onChange={(e) => handleInputChange('value', e?.target?.value)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary ${
                errors?.value ? 'border-error' : 'border-border'
              }`}
              placeholder="50000"
              required
            />
          </div>
          {errors?.value && (
            <p className="text-sm text-error mt-1">{errors?.value}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Stage
          </label>
          <select
            value={formData?.stage}
            onChange={(e) => handleInputChange('stage', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          >
            {dealStages?.map(stage => (
              <option key={stage?.value} value={stage?.value}>
                {stage?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Probability (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData?.probability}
            onChange={(e) => handleInputChange('probability', parseInt(e?.target?.value) || 0)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Contact and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Primary Contact
          </label>
          <select
            value={formData?.contact_id}
            onChange={(e) => handleContactChange(e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          >
            <option value="">Select Contact</option>
            {contacts?.map(contact => (
              <option key={contact?.id} value={contact?.id}>
                {contact?.full_name || `${contact?.first_name} ${contact?.last_name}`} - {contact?.company?.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Company
          </label>
          <select
            value={formData?.company_id}
            onChange={(e) => handleInputChange('company_id', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          >
            <option value="">Select Company</option>
            {companies?.map(company => (
              <option key={company?.id} value={company?.id}>
                {company?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Expected Close Date
          </label>
          <input
            type="date"
            value={formData?.expected_close_date}
            onChange={(e) => handleInputChange('expected_close_date', e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary ${
              errors?.expected_close_date ? 'border-error' : 'border-border'
            }`}
            min={new Date()?.toISOString()?.split('T')?.[0]}
          />
          {errors?.expected_close_date && (
            <p className="text-sm text-error mt-1">{errors?.expected_close_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Lead Source
          </label>
          <select
            value={formData?.lead_source}
            onChange={(e) => handleInputChange('lead_source', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          >
            {leadSources?.map(source => (
              <option key={source?.value} value={source?.value}>
                {source?.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Description
        </label>
        <textarea
          value={formData?.description}
          onChange={(e) => handleInputChange('description', e?.target?.value)}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
          placeholder="Describe the deal, requirements, and key details..."
        />
      </div>

      {/* Custom Fields */}
      {customFieldsLoading && (
        <div className="pt-6 border-t border-border">
          <div className="text-center py-4 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading custom fields...</p>
          </div>
        </div>
      )}

      {!customFieldsLoading && Array.isArray(customFields) && customFields.length > 0 && (
        <div className="pt-6 border-t border-border">
          <CustomFieldsGroup
            fields={customFields}
            values={customFieldValues || {}}
            onChange={handleCustomFieldChange}
            errors={errors || {}}
          />
        </div>
      )}

    </form>
  );
};

export default DealForm;