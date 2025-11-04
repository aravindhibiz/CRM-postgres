import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const CampaignForm = ({
  campaign = null,
  types = [],
  statuses = [],
  onSubmit,
  onCancel,
  isSaving = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    expected_revenue: '',
    email_template_id: '',
    owner_id: user?.id || ''
  });
  const [errors, setErrors] = useState({});

  // Populate form when campaign prop changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        type: campaign.type || 'email',
        status: campaign.status || 'draft',
        description: campaign.description || '',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        budget: campaign.budget?.toString() || '',
        expected_revenue: campaign.expected_revenue?.toString() || '',
        email_template_id: campaign.email_template_id || '',
        owner_id: campaign.owner_id || user?.id || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'email',
        status: 'draft',
        description: '',
        start_date: '',
        end_date: '',
        budget: '',
        expected_revenue: '',
        email_template_id: '',
        owner_id: user?.id || ''
      });
    }
  }, [campaign, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Campaign type is required';
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (formData.expected_revenue && isNaN(parseFloat(formData.expected_revenue))) {
      newErrors.expected_revenue = 'Expected revenue must be a valid number';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clean the data before submission
    const cleanData = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      description: formData.description.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      expected_revenue: formData.expected_revenue ? parseFloat(formData.expected_revenue) : 0,
      email_template_id: formData.email_template_id || null,
      owner_id: formData.owner_id || user?.id
    };

    onSubmit(cleanData);
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary">
          {campaign ? 'Edit Campaign' : 'Create New Campaign'}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.name ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Enter campaign name"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-2">
                  Campaign Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.type ? 'border-error' : 'border-border'
                  }`}
                  required
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error">{errors.type}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter campaign description"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-text-secondary mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-text-secondary mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.end_date ? 'border-error' : 'border-border'
                  }`}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-error">{errors.end_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Budget & Revenue */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Budget & Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-text-secondary mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.budget ? 'border-error' : 'border-border'
                  }`}
                  placeholder="0.00"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-error">{errors.budget}</p>
                )}
              </div>

              <div>
                <label htmlFor="expected_revenue" className="block text-sm font-medium text-text-secondary mb-2">
                  Expected Revenue
                </label>
                <input
                  type="number"
                  id="expected_revenue"
                  name="expected_revenue"
                  value={formData.expected_revenue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.expected_revenue ? 'border-error' : 'border-border'
                  }`}
                  placeholder="0.00"
                />
                {errors.expected_revenue && (
                  <p className="mt-1 text-sm text-error">{errors.expected_revenue}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email Template (only for email campaigns) */}
          {formData.type === 'email' && (
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Email Configuration</h3>
              <div>
                <label htmlFor="email_template_id" className="block text-sm font-medium text-text-secondary mb-2">
                  Email Template (Optional)
                </label>
                <input
                  type="text"
                  id="email_template_id"
                  name="email_template_id"
                  value={formData.email_template_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter email template ID"
                />
                <p className="mt-1 text-xs text-text-tertiary">
                  Leave blank to select template later
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name={campaign ? 'Save' : 'Plus'} size={16} />
                <span>{campaign ? 'Update Campaign' : 'Create Campaign'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
