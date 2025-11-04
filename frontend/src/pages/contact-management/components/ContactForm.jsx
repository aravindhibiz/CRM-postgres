import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { companiesService } from '../../../services/companiesService';
import { CustomFieldsGroup } from '../../../components/CustomFieldInput';
import { customFieldsAPI } from '../../../services/customFieldsAPI';



const ContactForm = ({ contact = null, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    position: '',
    department: '',
    company_id: '',
    companyName: '', // Keep for new company creation
    status: 'active',
    lead_source: 'website',
    social_linkedin: '',
    social_twitter: '',
    owner_id: user?.id || ''
  });
  const [errors, setErrors] = useState({});



  // Load companies and custom fields
  useEffect(() => {
    loadCompanies();
    loadCustomFields();

    if (contact) {
      setFormData({
        first_name: contact?.first_name || '',
        last_name: contact?.last_name || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        mobile: contact?.mobile || '',
        position: contact?.position || '',
        department: contact?.department || '',
        company_id: contact?.company_id || '',
        companyName: '',
        status: contact?.status || 'active',
        lead_source: contact?.lead_source || 'website',
        social_linkedin: contact?.social_linkedin || '',
        social_twitter: contact?.social_twitter || '',
        owner_id: contact?.owner_id || user?.id || ''
      });

      // Load custom field values from contact object or API
      if (contact?.custom_fields) {
        // Use custom_fields from contact object (already includes values)
        console.log('Using custom fields from contact object:', contact.custom_fields);
        const fieldValues = {};
        Object.entries(contact.custom_fields).forEach(([key, fieldData]) => {
          if (fieldData?.value !== null && fieldData?.value !== undefined) {
            fieldValues[key] = fieldData.value;
          }
        });
        console.log('Custom field values extracted:', fieldValues);
        setCustomFieldValues(fieldValues);
      } else if (contact?.id) {
        // Fallback: Load from API
        loadCustomFieldValues(contact.id);
      }
    }
  }, [contact, user]);

  const loadCompanies = async () => {
    try {
      const companiesData = await companiesService?.getAllCompanies();
      setCompanies(companiesData || []);
    } catch (err) {
      console.error('Error loading companies:', err);
      setErrors({ 
        submit: 'Failed to load companies. Please try refreshing the page.' 
      });
    }
  };

  const loadCustomFields = async () => {
    setCustomFieldsLoading(true);
    try {
      console.log('Loading custom fields for contacts...');
      const fields = await customFieldsAPI.getAllFields({
        entity_type: 'contact',
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

  const loadCustomFieldValues = async (contactId) => {
    try {
      console.log('Loading custom field values for contact:', contactId);
      const fieldsWithValues = await customFieldsAPI.getEntityCustomFields('contact', contactId);
      
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
    setLoading(true);
    setErrors({});

    try {
      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email'];
      const validationErrors = {};
      
      requiredFields?.forEach(field => {
        if (!formData?.[field]?.trim()) {
          validationErrors[field] = `${field?.replace('_', ' ')} is required`;
        }
      });

      // Email validation
      if (formData?.email && !/\S+@\S+\.\S+/?.test(formData?.email)) {
        validationErrors.email = 'Please enter a valid email address';
      }

      if (Object.keys(validationErrors)?.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined
      };

      // Pass data to parent component for API call
      console.log('Submitting contact form data to parent component:', submitData);
      await onSubmit?.(submitData);
    } catch (err) {
      console.error('Error saving contact:', err);
      setErrors({ 
        submit: err?.message || 'Failed to save contact. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

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

  const contactStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Messages */}
      {errors?.submit && (
        <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg flex items-center space-x-2">
          <Icon name="AlertCircle" size={20} />
          <span>{errors?.submit}</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={formData?.first_name}
            onChange={(e) => handleInputChange('first_name', e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary ${
              errors?.first_name ? 'border-error' : 'border-border'
            }`}
            placeholder="John"
            required
          />
          {errors?.first_name && (
            <p className="text-sm text-error mt-1">{errors?.first_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={formData?.last_name}
            onChange={(e) => handleInputChange('last_name', e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary ${
              errors?.last_name ? 'border-error' : 'border-border'
            }`}
            placeholder="Doe"
            required
          />
          {errors?.last_name && (
            <p className="text-sm text-error mt-1">{errors?.last_name}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary ${
              errors?.email ? 'border-error' : 'border-border'
            }`}
            placeholder="john.doe@company.com"
            required
          />
          {errors?.email && (
            <p className="text-sm text-error mt-1">{errors?.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Position
          </label>
          <input
            type="text"
            value={formData?.position}
            onChange={(e) => handleInputChange('position', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
            placeholder="Sales Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Department
          </label>
          <input
            type="text"
            value={formData?.department}
            onChange={(e) => handleInputChange('department', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
            placeholder="Sales"
          />
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Company
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={formData?.company_id}
            onChange={(e) => handleInputChange('company_id', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          >
            <option value="">Select Existing Company</option>
            {companies?.map(company => (
              <option key={company?.id} value={company?.id}>
                {company?.name}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            value={formData?.companyName}
            onChange={(e) => handleInputChange('companyName', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
            placeholder="Or enter new company name"
          />
        </div>
      </div>

      {/* Status and Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Status
          </label>
          <select
            value={formData?.status}
            onChange={(e) => handleInputChange('status', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-primary focus:border-primary"
          >
            {contactStatuses?.map(status => (
              <option key={status?.value} value={status?.value}>
                {status?.label}
              </option>
            ))}
          </select>
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

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={formData?.social_linkedin}
            onChange={(e) => handleInputChange('social_linkedin', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Twitter URL
          </label>
          <input
            type="url"
            value={formData?.social_twitter}
            onChange={(e) => handleInputChange('social_twitter', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-tertiary focus:ring-primary focus:border-primary"
            placeholder="https://twitter.com/johndoe"
          />
        </div>
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-text-secondary hover:text-text-primary dark:hover:text-text-primary transition-colors duration-150"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>{contact ? 'Update Contact' : 'Create Contact'}</span>
        </button>
      </div>
    </form>
  );
};

export default ContactForm;