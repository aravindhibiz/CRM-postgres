import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import contactsService from '../../../services/contactsService';
import companiesService from '../../../services/companiesService';

const ContactForm = ({ contact = null, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
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
    status: 'prospect',
    lead_source: 'website',
    notes: '',
    tags: [],
    linkedin_url: '',
    twitter_url: '',
    owner_id: user?.id || ''
  });
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  // Load companies and populate form
  useEffect(() => {
    loadCompanies();
    
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
        status: contact?.status || 'prospect',
        lead_source: contact?.lead_source || 'website',
        notes: contact?.notes || '',
        tags: contact?.tags || [],
        linkedin_url: contact?.linkedin_url || '',
        twitter_url: contact?.twitter_url || '',
        owner_id: contact?.owner_id || user?.id || ''
      });
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

      // Prepare data for submission - remove companyName from the payload
      const { companyName, ...submitData } = formData;

      let result;
      if (contact) {
        // Update existing contact
        result = await contactsService?.updateContact(contact?.id, submitData);
      } else {
        // Create new contact - include companyName for service to handle
        result = await contactsService?.createContact(formData);
      }

      onSubmit?.(result);
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

  const addTag = () => {
    if (newTag?.trim() && !formData?.tags?.includes(newTag?.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev?.tags || []), newTag?.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev?.tags?.filter(tag => tag !== tagToRemove) || []
    }));
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
    { value: 'prospect', label: 'Prospect' },
    { value: 'active', label: 'Active' },
    { value: 'customer', label: 'Customer' },
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
          >
            {leadSources?.map(source => (
              <option key={source?.value} value={source?.value}>
                {source?.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData?.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-primary-600 hover:text-primary-800"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
            placeholder="Add a tag and press Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-text-secondary text-white rounded-lg hover:bg-text-primary transition-colors duration-150"
          >
            Add
          </button>
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
            value={formData?.linkedin_url}
            onChange={(e) => handleInputChange('linkedin_url', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Twitter URL
          </label>
          <input
            type="url"
            value={formData?.twitter_url}
            onChange={(e) => handleInputChange('twitter_url', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
            placeholder="https://twitter.com/johndoe"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Notes
        </label>
        <textarea
          value={formData?.notes}
          onChange={(e) => handleInputChange('notes', e?.target?.value)}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Additional notes about this contact..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
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