import React from 'react';
import Icon from 'components/AppIcon';

const ActivityFilters = ({ selectedFilters, onFiltersChange }) => {
  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'email', label: 'Emails', icon: 'Mail' },
    { value: 'call', label: 'Calls', icon: 'Phone' },
    { value: 'meeting', label: 'Meetings', icon: 'Calendar' },
    { value: 'deal_update', label: 'Deal Updates', icon: 'TrendingUp' },
    { value: 'task', label: 'Tasks', icon: 'CheckSquare' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const channels = [
    { value: 'all', label: 'All Channels', icon: 'Globe' },
    { value: 'gmail', label: 'Gmail', icon: 'Mail' },
    { value: 'twilio', label: 'Phone', icon: 'Phone' },
    { value: 'calendar', label: 'Calendar', icon: 'Calendar' },
    { value: 'system', label: 'System', icon: 'Settings' }
  ];

  const teamMembers = [
    { value: 'all', label: 'All Team Members' },
    { value: 'michael', label: 'Michael Rodriguez' },
    { value: 'jennifer', label: 'Jennifer Walsh' },
    { value: 'alex', label: 'Alex Thompson' },
    { value: 'sarah', label: 'Sarah Chen' }
  ];

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...selectedFilters,
      [filterType]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Activity Type Filter */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Activity Type</h4>
        <div className="space-y-2">
          {activityTypes?.map((type) => (
            <label key={type?.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="activityType"
                value={type?.value}
                checked={selectedFilters?.activityType === type?.value}
                onChange={(e) => handleFilterChange('activityType', e?.target?.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2">
                <Icon name={type?.icon} size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">{type?.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Date Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Date Range</h4>
        <div className="space-y-2">
          {dateRanges?.map((range) => (
            <label key={range?.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="dateRange"
                value={range?.value}
                checked={selectedFilters?.dateRange === range?.value}
                onChange={(e) => handleFilterChange('dateRange', e?.target?.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary-500"
              />
              <span className="text-sm text-text-secondary">{range?.label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Channel Filter */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Communication Channel</h4>
        <div className="space-y-2">
          {channels?.map((channel) => (
            <label key={channel?.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="channel"
                value={channel?.value}
                checked={selectedFilters?.channel === channel?.value}
                onChange={(e) => handleFilterChange('channel', e?.target?.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary-500"
              />
              <div className="flex items-center space-x-2">
                <Icon name={channel?.icon} size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">{channel?.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Team Member Filter */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Team Member</h4>
        <div className="space-y-2">
          {teamMembers?.map((member) => (
            <label key={member?.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="teamMember"
                value={member?.value}
                checked={selectedFilters?.teamMember === member?.value}
                onChange={(e) => handleFilterChange('teamMember', e?.target?.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary-500"
              />
              <span className="text-sm text-text-secondary">{member?.label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-text-primary mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150 ease-out">
            <Icon name="Filter" size={16} />
            <span>Save Current Filter</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150 ease-out">
            <Icon name="RefreshCw" size={16} />
            <span>Refresh Timeline</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150 ease-out">
            <Icon name="Settings" size={16} />
            <span>Timeline Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilters;