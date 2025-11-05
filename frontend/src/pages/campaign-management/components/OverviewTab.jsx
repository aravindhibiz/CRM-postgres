import React from 'react';
import Icon from 'components/AppIcon';
import { configService } from '../../../services/configService';

const OverviewTab = ({ campaign, statuses, types }) => {
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString();
  };

  const getROI = () => {
    if (!campaign?.budget || campaign.budget === 0) return 0;
    const actualCost = campaign.actual_cost || campaign.budget;
    const revenue = campaign.actual_revenue || 0;
    if (actualCost === 0) return 0;
    return (((revenue - actualCost) / actualCost) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Campaign Name
            </label>
            <p className="text-text-primary text-base font-medium">
              {campaign?.name || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Campaign Type
            </label>
            <div className="flex items-center space-x-2">
              <Icon
                name={types.find(t => t.value === campaign?.type)?.icon || 'Megaphone'}
                size={16}
                className="text-text-tertiary"
              />
              <span className="text-text-primary text-base">
                {types.find(t => t.value === campaign?.type)?.label || campaign?.type || 'N/A'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              statuses.find(s => s.value === campaign?.status)?.color || 'bg-gray-100 text-gray-800'
            }`}>
              {statuses.find(s => s.value === campaign?.status)?.label || campaign?.status || 'N/A'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Owner
            </label>
            <p className="text-text-primary text-base">
              {campaign?.owner_name || 'Unassigned'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <p className="text-text-primary text-base">
              {campaign?.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Start Date
            </label>
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-text-tertiary" />
              <span className="text-text-primary text-base">
                {formatDate(campaign?.start_date)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              End Date
            </label>
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-text-tertiary" />
              <span className="text-text-primary text-base">
                {formatDate(campaign?.end_date)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Created At
            </label>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-text-tertiary" />
              <span className="text-text-primary text-base">
                {formatDateTime(campaign?.created_at)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Last Updated
            </label>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-text-tertiary" />
              <span className="text-text-primary text-base">
                {formatDateTime(campaign?.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Campaign Details - Only show for email campaigns */}
      {campaign?.type === 'email' && (
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Mail" size={20} className="mr-2" />
            Email Campaign Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Template
              </label>
              <p className="text-text-primary text-base">
                {campaign?.email_template_name || campaign?.email_template_id || 'Not selected'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Subject
              </label>
              <p className="text-text-primary text-base">
                {campaign?.email_subject || 'Not set'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                From Name
              </label>
              <p className="text-text-primary text-base">
                {campaign?.email_from_name || 'System default'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                From Email
              </label>
              <p className="text-text-primary text-base">
                {campaign?.email_from_email || 'System default'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget & ROI */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Budget & ROI</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Budget
            </label>
            <div className="text-2xl font-semibold text-blue-900">
              {formatCurrency(campaign?.budget || 0)}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Actual Revenue
            </label>
            <div className="text-2xl font-semibold text-purple-900">
              {formatCurrency(campaign?.actual_revenue || 0)}
            </div>
          </div>

          <div className={`rounded-lg p-4 ${
            getROI() >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <label className={`block text-sm font-medium mb-2 ${
              getROI() >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              ROI
            </label>
            <div className={`text-2xl font-semibold ${
              getROI() >= 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {getROI()}%
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Actual Cost
            </label>
            <div className="text-lg font-medium text-text-primary">
              {formatCurrency(campaign?.actual_cost || 0)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Expected Revenue
            </label>
            <div className="text-lg font-medium text-text-primary">
              {formatCurrency(campaign?.expected_revenue || 0)}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OverviewTab;
