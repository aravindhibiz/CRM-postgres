import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomFieldsGroup } from '../../../components/CustomFieldInput';
import { customFieldsAPI } from '../../../services/customFieldsAPI';

const CompanyForm = ({ company = null, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    description: '',
    revenue: '',
    owner_id: user?.id || ''
  });

  const [errors, setErrors] = useState({});

  // Industry options
  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Consulting',
    'Media',
    'Transportation',
    'Energy',
    'Hospitality',
    'Telecommunications',
    'Agriculture',
    'Construction',
    'Legal',
    'Other'
  ];

  // Company size options
  const sizeOptions = [
    'Small (1-50)',
    'Medium (51-250)',
    'Large (251-1000)',
    'Enterprise (1000+)'
  ];

  // Load custom fields
  useEffect(() => {
    loadCustomFields();

    if (company) {
      setFormData({
        name: company?.name || '',
        industry: company?.industry || '',
        size: company?.size || '',
        website: company?.website || '',
        phone: company?.phone || '',
        email: company?.email || '',
        address: company?.address || '',
        city: company?.city || '',
        state: company?.state || '',
        zip_code: company?.zip_code || '',
        country: company?.country || '',
        description: company?.description || '',
        revenue: company?.revenue || '',
        owner_id: company?.owner_id || user?.id || ''
      });

      // Load custom field values
      if (company?.custom_fields) {
        const fieldValues = {};
        Object.entries(company.custom_fields).forEach(([key, fieldData]) => {
          if (fieldData?.value !== null && fieldData?.value !== undefined) {
            fieldValues[key] = fieldData.value;
          }
        });
        setCustomFieldValues(fieldValues);
      } else if (company?.id) {
        loadCustomFieldValues(company.id);
      }
    }
  }, [company, user]);

  const loadCustomFields = async () => {
    setCustomFieldsLoading(true);
    try {
      const fields = await customFieldsAPI.getAllFields({
        entity_type: 'company',
        is_active: true
      });

      // Filter to form placement
      const formFields = fields?.filter(f =>
        f.placement === 'form' || f.placement === 'both'
      );
      setCustomFields(formFields || []);
    } catch (err) {
      console.error('Error loading custom fields:', err);
    } finally {
      setCustomFieldsLoading(false);
    }
  };

  const loadCustomFieldValues = async (companyId) => {
    try {
      const fieldsWithValues = await customFieldsAPI.getEntityCustomFields(
        'company',
        companyId
      );

      const fieldValues = {};
      fieldsWithValues?.forEach(field => {
        fieldValues[field.field_key] = field.current_value;
      });
      setCustomFieldValues(fieldValues);
    } catch (err) {
      console.error('Error loading custom field values:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCustomFieldChange = (fieldKey, value) => {
    console.log('handleCustomFieldChange called:', { fieldKey, value });
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('Validating form with data:', formData);
    console.log('Custom fields for validation:', customFields);
    console.log('Custom field values for validation:', customFieldValues);

    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = 'Company name is required';
    }

    // Email format validation
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Website format validation (basic)
    if (formData.website && !formData.website.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/)) {
      if (!formData.website.match(/^https?:\/\//)) {
        // Allow formats without http/https for now
      }
    }

    // Revenue validation
    if (formData.revenue && isNaN(formData.revenue)) {
      newErrors.revenue = 'Revenue must be a number';
    }

    // Validate required custom fields
    customFields?.forEach(field => {
      const fieldKey = field.field_key || field.id;
      console.log(`Checking custom field: ${field.name}, required: ${field.is_required}, field_key: ${fieldKey}, value:`, customFieldValues[fieldKey]);
      if (field.is_required && !customFieldValues[fieldKey]) {
        newErrors[`custom_${fieldKey}`] = `${field.name} is required`;
      }
    });

    console.log('Validation result:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('CompanyForm handleSubmit called');
    console.log('Form data:', formData);
    console.log('Custom field values:', customFieldValues);

    // Validate form
    const newErrors = validateForm();
    console.log('Validation errors:', newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Form validation failed, not submitting');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        revenue: formData.revenue ? parseInt(formData.revenue) : null,
        custom_fields: customFieldValues
      };

      console.log('Submitting data:', submitData);
      await onSubmit(submitData);
      console.log('Form submitted successfully');
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrors({ submit: err?.message || 'Failed to save company' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">
          {company ? 'Edit Company' : 'Add New Company'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start space-x-3">
          <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-error font-medium">Error</p>
            <p className="text-error-600 text-sm">{errors.submit}</p>
          </div>
        </div>
      )}

      <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Building2" size={20} className="mr-2" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Corporation"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-error' : 'border-border'
                }`}
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Industry</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Company Size
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Size</option>
                {sizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.website ? 'border-error' : 'border-border'
                }`}
              />
              {errors.website && (
                <p className="text-error text-sm mt-1">{errors.website}</p>
              )}
            </div>

            {/* Revenue */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Annual Revenue ($)
              </label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                placeholder="1000000"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.revenue ? 'border-error' : 'border-border'
                }`}
              />
              {errors.revenue && (
                <p className="text-error text-sm mt-1">{errors.revenue}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Phone" size={20} className="mr-2" />
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@company.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? 'border-error' : 'border-border'
                }`}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="MapPin" size={20} className="mr-2" />
            Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Business St, Suite 100"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="San Francisco"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="CA"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Zip / Postal Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="94102"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="FileText" size={20} className="mr-2" />
            Description
          </h3>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Company Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional information about the company..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        {customFields?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="Settings" size={20} className="mr-2" />
              Additional Information
            </h3>

            {customFieldsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <CustomFieldsGroup
                fields={customFields}
                values={customFieldValues}
                onChange={handleCustomFieldChange}
                errors={errors}
              />
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          disabled={loading}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{loading ? 'Saving...' : company ? 'Update Company' : 'Create Company'}</span>
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;
