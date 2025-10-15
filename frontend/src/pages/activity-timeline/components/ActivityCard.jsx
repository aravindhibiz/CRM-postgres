import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { configService } from '../../../services/configService';
import { useAuth } from '../../../contexts/AuthContext';

const ActivityCard = ({ activity, isLast, isSelected, onSelectionChange, showCheckbox = false, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { hasAnyPermission } = useAuth();

  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  const handleSelectionChange = (e) => {
    e.stopPropagation();
    onSelectionChange(e.target.checked);
  };

  // Helper functions to extract display data
  const getContactName = () => {
    // Data is already transformed by the parent component
    return activity?.contact || 'N/A';
  };

  const getCompanyName = () => {
    // Data is already transformed by the parent component
    return activity?.company || 'N/A';
  };

  const getUserName = () => {
    // Data is already transformed by the parent component
    return activity?.user || 'System';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'call':
        return 'Phone';
      case 'meeting':
        return 'Calendar';
      case 'deal_update':
        return 'TrendingUp';
      case 'task':
        return 'CheckSquare';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'email':
        return 'text-blue-700 bg-blue-100 border border-blue-200';
      case 'call':  
        return 'text-green-700 bg-green-100 border border-green-200';
      case 'meeting':
        return 'text-purple-700 bg-purple-100 border border-purple-200';
      case 'deal_update':
        return 'text-orange-700 bg-orange-100 border border-orange-200';
      case 'task':
        return 'text-indigo-700 bg-indigo-100 border border-indigo-200';
      default:
        return 'text-gray-700 bg-gray-100 border border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error-50';
      case 'medium':
        return 'text-warning bg-warning-50';
      case 'low':
        return 'text-success bg-success-50';
      default:
        return 'text-text-secondary bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp?.toLocaleDateString();
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'gmail':
        return 'Mail';
      case 'twilio':
        return 'Phone';
      case 'calendar':
        return 'Calendar';
      case 'system':
        return 'Settings';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-border"></div>
      )}
      <div className="flex space-x-4">
        {/* Timeline Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity?.type)} flex-shrink-0 shadow-sm`}>
          <Icon name={getActivityIcon(activity?.type)} size={20} />
        </div>

        {/* Activity Content */}
        <div className="flex-1 bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleSelectionChange}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-text-primary line-clamp-1">
                      {activity?.title || 'Untitled Activity'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(activity?.priority)} whitespace-nowrap`}>
                      {activity?.type || 'note'}
                    </span>
                    {activity?.deal?.value && (
                      <span className="px-3 py-1 bg-success-50 text-success rounded-full text-xs font-medium whitespace-nowrap">
                        {formatCurrency(activity.deal.value)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                    <span className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{formatTimestamp(activity?.timestamp)}</span>
                    </span>
                    {activity?.duration && (
                      <span className="flex items-center space-x-1">
                        <Icon name="Timer" size={14} />
                        <span>{activity.duration}</span>
                      </span>
                    )}
                    {getUserName() !== 'System' && (
                      <span className="flex items-center space-x-1">
                        <Icon name="User" size={14} />
                        <span>{getUserName()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {hasAnyPermission(['activities.edit_all', 'activities.edit_own']) && (
                  <button
                    onClick={() => onEdit && onEdit(activity)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all duration-150 ease-out border border-transparent hover:border-border"
                    title="Edit activity"
                  >
                    <Icon name="Edit" size={14} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}

                {hasAnyPermission(['activities.delete_all', 'activities.delete_own']) && (
                  <button
                    onClick={() => onDelete && onDelete(activity.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-white hover:bg-error rounded-lg transition-all duration-150 ease-out border border-transparent hover:border-error"
                    title="Delete activity"
                  >
                    <Icon name="Trash2" size={14} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Company Info */}
          <div className="px-6 py-4 bg-surface-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-black">
                    {getContactName().split(' ').map(n => n[0]).join('').substr(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-text-primary">{getContactName()}</div>
                  <div className="text-sm text-text-secondary flex items-center space-x-1">
                    <Icon name="Building" size={12} />
                    <span>{getCompanyName()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={12} className="mr-1" />
                  {activity?.type?.replace('_', ' ') || 'note'}
                </span>
              </div>
            </div>
          </div>

          {/* Description Preview */}
          {activity?.description && (
            <div className="px-6 py-4">
              <p className="text-text-primary text-sm leading-relaxed">
                {isExpanded 
                  ? activity?.description
                  : `${activity?.description?.substring(0, 200)}${activity?.description?.length > 200 ? '...' : ''}`
                }
              </p>
              {activity?.description?.length > 200 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-primary text-sm font-medium hover:text-primary-600 mt-2 transition-colors flex items-center space-x-1"
                >
                  <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={14} />
                </button>
              )}
            </div>
          )}

          {/* Additional Info */}
          {isExpanded && (
            <div className="space-y-4 border-t border-border pt-4">
              {/* Attachments */}
              {activity?.attachments && activity?.attachments?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {activity?.attachments?.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Icon name="Paperclip" size={14} className="text-text-tertiary" />
                        <span className="text-primary hover:text-primary-700 cursor-pointer">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deal Stage Info */}
              {activity?.type === 'deal_update' && activity?.previousStage && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2">Stage Progression</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{activity?.previousStage}</span>
                    <Icon name="ArrowRight" size={14} className="text-text-tertiary" />
                    <span className="px-2 py-1 bg-primary-50 text-primary rounded">{activity?.currentStage}</span>
                    <span className="text-text-secondary ml-2">({activity?.probability}% probability)</span>
                  </div>
                </div>
              )}

              {/* Meeting Details */}
              {activity?.type === 'meeting' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {activity?.location && (
                    <div>
                      <span className="font-medium text-text-primary">Location:</span>
                      <span className="text-text-secondary ml-2">{activity?.location}</span>
                    </div>
                  )}
                  {activity?.attendees && (
                    <div>
                      <span className="font-medium text-text-primary">Attendees:</span>
                      <span className="text-text-secondary ml-2">{activity?.attendees} people</span>
                    </div>
                  )}
                </div>
              )}

              {/* Call Details */}
              {activity?.type === 'call' && (
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="font-medium text-text-primary">Type:</span>
                    <span className="text-text-secondary ml-2 capitalize">{activity?.callType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-text-primary">Status:</span>
                    <span className="text-text-secondary ml-2 capitalize">{activity?.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;