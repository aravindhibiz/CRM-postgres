import React from 'react';
import Icon from 'components/AppIcon';
import { configService } from '../../../services/configService';

const DealDetailView = ({ deal, contacts, companies, stages, onEdit }) => {
  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  // Get stage details
  const stageDetails = stages.find(s => s.value === deal?.stage);

  // Get contact details
  const contact = contacts.find(c => c.id === deal?.contact_id);

  // Get company details
  const company = companies.find(c => c.id === deal?.company_id);

  // Lead source display mapping
  const leadSourceLabels = {
    'website': 'Website',
    'referral': 'Referral',
    'cold_call': 'Cold Call',
    'email_campaign': 'Email Campaign',
    'social_media': 'Social Media',
    'event': 'Event',
    'partner': 'Partner',
    'other': 'Other'
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Deal Details</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="Edit" size={16} />
            <span>Edit Deal</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Deal Name
            </label>
            <p className="text-text-primary text-base font-medium">
              {deal?.name || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Deal Value
            </label>
            <p className="text-text-primary text-base font-semibold">
              {formatCurrency(deal?.value || 0)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Stage
            </label>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${stageDetails?.color || 'bg-gray-100 text-gray-800'}`}>
              {stageDetails?.label || deal?.stage || 'N/A'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Probability
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${deal?.probability || 0}%` }}
                ></div>
              </div>
              <span className="text-text-primary text-sm font-medium">
                {deal?.probability || 0}%
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Primary Contact
            </label>
            <p className="text-text-primary text-base">
              {contact ? (
                <span className="flex items-center space-x-2">
                  <Icon name="User" size={16} className="text-text-tertiary" />
                  <span>{contact.first_name} {contact.last_name}</span>
                </span>
              ) : (
                'No contact assigned'
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Company
            </label>
            <p className="text-text-primary text-base">
              {company ? (
                <span className="flex items-center space-x-2">
                  <Icon name="Building" size={16} className="text-text-tertiary" />
                  <span>{company.name}</span>
                </span>
              ) : (
                'No company assigned'
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Expected Close Date
            </label>
            <p className="text-text-primary text-base">
              {deal?.expected_close_date ? (
                <span className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} className="text-text-tertiary" />
                  <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                </span>
              ) : (
                'No date set'
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Lead Source
            </label>
            <p className="text-text-primary text-base">
              {leadSourceLabels[deal?.lead_source] || deal?.lead_source || 'N/A'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Description
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-border">
            <p className="text-text-primary text-base whitespace-pre-wrap">
              {deal?.description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Custom Fields */}
        {deal?.custom_fields && Object.keys(deal.custom_fields).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Custom Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(deal.custom_fields).map(([key, value]) => {
                // Handle different value types
                let displayValue = 'N/A';
                if (value !== null && value !== undefined) {
                  if (typeof value === 'object') {
                    // If it's an object with a 'value' property, use that
                    displayValue = value.value || JSON.stringify(value);
                  } else {
                    displayValue = String(value);
                  }
                }

                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <p className="text-text-primary text-base">
                      {displayValue}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-text-tertiary mb-1">Deal ID</label>
              <p className="text-text-secondary font-mono">#{deal?.id}</p>
            </div>
            <div>
              <label className="block text-text-tertiary mb-1">Created</label>
              <p className="text-text-secondary">
                {deal?.created_at ? new Date(deal.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-text-tertiary mb-1">Last Updated</label>
              <p className="text-text-secondary">
                {deal?.updated_at ? new Date(deal.updated_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailView;
