import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import dealsService from '../../../services/dealsService';
import contactsService from '../../../services/contactsService';
import companiesService from '../../../services/companiesService';

const DealForm = ({ deal = null, contacts = [], companies = [], stages = [], onSubmit, onCancel, isSaving = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
    next_step: '',
    competitor_info: '',
    tags: [],
    owner_id: user?.id || ''
  });
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  // Populate form when deal prop changes
  useEffect(() => {
    if (deal) {
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
        next_step: deal?.next_step || '',
        competitor_info: deal?.competitor_info || '',
        tags: deal?.tags || [],
        owner_id: deal?.owner_id || user?.id || ''
      });
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
        next_step: '',
        competitor_info: '',
        tags: [],
        owner_id: user?.id || ''
      });
    }
  }, [deal, user?.id]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
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
        ...formData,
        value: parseFloat(formData?.value) || 0,
        expected_close_date: formData?.expected_close_date || null
      };

      let result;
      if (deal) {
        // Update existing deal
        result = await dealsService?.updateDeal(deal?.id, submitData);
      } else {
        // Create new deal
        result = await dealsService?.createDeal(submitData);
      }

      onSubmit(result);
    } catch (err) {
      console.error('Error saving deal:', err);
      setErrors({ 
        submit: err?.message || 'Failed to save deal. Please try again.' 
      });
    } finally {
      setLoading(false);
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
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
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
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

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Description
        </label>
        <textarea
          value={formData?.description}
          onChange={(e) => handleInputChange('description', e?.target?.value)}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Describe the deal, requirements, and key details..."
        />
      </div>

      {/* Next Step and Competitor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Next Step
          </label>
          <input
            type="text"
            value={formData?.next_step}
            onChange={(e) => handleInputChange('next_step', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
            placeholder="Schedule demo, send proposal, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Competitor Information
          </label>
          <input
            type="text"
            value={formData?.competitor_info}
            onChange={(e) => handleInputChange('competitor_info', e?.target?.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
            placeholder="Competing against..."
          />
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
          disabled={loading || isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isSaving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          {(loading || isSaving) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>{deal ? 'Update Deal' : 'Create Deal'}</span>
        </button>
      </div>
    </form>
  );
};

export default DealForm;