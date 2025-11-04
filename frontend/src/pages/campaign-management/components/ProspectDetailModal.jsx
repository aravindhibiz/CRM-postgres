import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const ProspectDetailModal = ({ prospect, onClose, onUpdate, onConvert }) => {
  const { hasAnyPermission } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: prospect.first_name || '',
    last_name: prospect.last_name || '',
    email: prospect.email || '',
    phone: prospect.phone || '',
    company_name: prospect.company_name || '',
    job_title: prospect.job_title || '',
    industry: prospect.industry || '',
    description: prospect.description || '',
    notes: prospect.notes || '',
    status: (prospect.status || 'new').toLowerCase(),
    lead_score: prospect.lead_score || 0,
    source: (prospect.source || 'manual_entry').toLowerCase(),
    source_details: prospect.source_details || '',
    linkedin_url: prospect.linkedin_url || '',
    twitter_handle: prospect.twitter_handle || '',
    website: prospect.website || '',
    city: prospect.city || '',
    state: prospect.state || '',
    country: prospect.country || ''
  });

  const prospectStatuses = [
    { value: 'new', label: 'New' },
    { value: 'converted', label: 'Converted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation: first_name is required
    const validationErrors = {};

    if (!formData.first_name?.trim()) {
      validationErrors.first_name = 'First name is required';
    }

    // Validation: Either email OR phone must be provided
    if (!formData.email?.trim() && !formData.phone?.trim()) {
      validationErrors.contact = 'Either email or phone number is required';
    }

    // Validation: If email is provided, validate format
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        validationErrors.email = 'Please enter a valid email address';
      }
    }

    // Validation: If phone is provided, validate format (10 digits)
    if (formData.phone?.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        validationErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onUpdate(prospect.id, formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-lg">
                {(formData.first_name?.[0] || '') + (formData.last_name?.[0] || '')}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary">
                {formData.first_name} {formData.last_name}
              </h3>
              <p className="text-sm text-text-secondary">{formData.job_title || 'No title'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Messages */}
              {(errors.contact) && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-start space-x-2">
                  <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    {errors.contact && <p>{errors.contact}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.first_name ? 'border-red-500' : 'border-border'
                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email <span className="text-gray-500 text-xs">(Email or Phone required)</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full px-3 py-2 border ${
                      errors.contact || errors.email ? 'border-red-500' : 'border-border'
                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Phone <span className="text-gray-500 text-xs">(Email or Phone required)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    className={`w-full px-3 py-2 border ${
                      errors.contact || errors.phone ? 'border-red-500' : 'border-border'
                    } rounded-lg focus:ring-2 focus:ring-primary focus:border-primary`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Healthcare"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    name="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={handleChange}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., San Francisco"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g., California"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., United States"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled={formData.status === 'converted'}
                  >
                    {prospectStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Lead Score (0-100)
                  </label>
                  <input
                    type="number"
                    name="lead_score"
                    value={formData.lead_score}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief description of the prospect..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Icon name="Mail" size={16} className="text-text-tertiary" />
                      <span className="text-text-primary">{prospect.email}</span>
                    </div>
                  </div>

                  {prospect.phone && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Phone
                      </label>
                      <div className="flex items-center space-x-2">
                        <Icon name="Phone" size={16} className="text-text-tertiary" />
                        <span className="text-text-primary">{prospect.phone}</span>
                      </div>
                    </div>
                  )}

                  {prospect.company_name && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Company
                      </label>
                      <div className="flex items-center space-x-2">
                        <Icon name="Building" size={16} className="text-text-tertiary" />
                        <span className="text-text-primary">{prospect.company_name}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Status
                    </label>
                    <span className="text-text-primary">{prospect.status}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Lead Score
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                        <div
                          className={`h-2 rounded-full ${
                            prospect.lead_score >= 75
                              ? 'bg-green-500'
                              : prospect.lead_score >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${prospect.lead_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-text-primary font-medium">{prospect.lead_score || 0}</span>
                    </div>
                  </div>

                  {prospect.source && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Source
                      </label>
                      <span className="text-text-primary">{prospect.source}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {prospect.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Notes</h4>
                  <p className="text-text-secondary">{prospect.notes}</p>
                </div>
              )}

              {/* Conversion Info */}
              {prospect.status === 'converted' && prospect.converted_to_contact_id && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="CheckCircle" size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-green-900 mb-1">
                        Converted to Contact
                      </h4>
                      <p className="text-sm text-green-700">
                        Contact ID: {prospect.converted_to_contact_id.slice(0, 8)}
                      </p>
                      {prospect.converted_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Converted on {new Date(prospect.converted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-border">
                {hasAnyPermission(['prospects.edit_all', 'prospects.edit_own']) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Icon name="Edit" size={16} />
                    <span>Edit Prospect</span>
                  </button>
                )}
                {prospect.status?.toLowerCase() !== 'converted' && hasAnyPermission(['prospects.convert']) && (
                  <button
                    onClick={onConvert}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Icon name="UserPlus" size={16} />
                    <span>Convert to Contact</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProspectDetailModal;
