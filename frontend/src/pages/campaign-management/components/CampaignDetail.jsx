import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import OverviewTab from './OverviewTab';
import ProspectsTab from './ProspectsTab';
import PerformanceTab from './PerformanceTab';
import AudienceTab from './AudienceTab';
import ExecuteTab from './ExecuteTab';

const CampaignDetail = ({ campaign, statuses, types, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Info' },
    { id: 'prospects', label: 'Prospects', icon: 'Users' },
    { id: 'audience', label: 'Audience', icon: 'Target' },
    { id: 'execute', label: 'Execute', icon: 'Send' },
    { id: 'performance', label: 'Performance', icon: 'TrendingUp' }
  ];

  return (
    <div className="space-y-6">
      {/* Campaign Header Card */}
      <div className="bg-surface rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <Icon
                name={types.find(t => t.value === campaign?.type)?.icon || 'Megaphone'}
                size={24}
                className="text-primary"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{campaign?.name}</h2>
              <p className="text-sm text-text-secondary">
                {types.find(t => t.value === campaign?.type)?.label} Campaign
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="btn-primary flex items-center space-x-2"
              >
                <Icon name="Edit" size={16} />
                <span>Edit Campaign</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="btn-secondary text-error hover:bg-error-50 flex items-center space-x-2"
              >
                <Icon name="Trash2" size={16} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="px-6 py-4">
            <div className="text-sm text-text-secondary mb-1">Status</div>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              statuses.find(s => s.value === campaign?.status)?.color || 'bg-gray-100 text-gray-800'
            }`}>
              {statuses.find(s => s.value === campaign?.status)?.label || campaign?.status}
            </span>
          </div>

          <div className="px-6 py-4">
            <div className="text-sm text-text-secondary mb-1">Sent</div>
            <div className="text-2xl font-semibold text-text-primary">
              {campaign?.sent_count || 0}
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="text-sm text-text-secondary mb-1">Open Rate</div>
            <div className="text-2xl font-semibold text-text-primary">
              {campaign?.open_rate?.toFixed(1) || 0}%
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="text-sm text-text-secondary mb-1">Conversions</div>
            <div className="text-2xl font-semibold text-primary">
              {campaign?.converted_count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-surface rounded-lg border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-1 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab campaign={campaign} statuses={statuses} types={types} />
          )}
          {activeTab === 'execute' && (
            <ExecuteTab campaign={campaign} />
          )}
          {activeTab === 'audience' && (
            <AudienceTab campaignId={campaign?.id} />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab campaignId={campaign?.id} />
          )}
          {activeTab === 'prospects' && (
            <ProspectsTab campaignId={campaign?.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
