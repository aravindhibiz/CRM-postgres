import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ActivityCard = ({ activity, isLast, isSelected, onSelectionChange, showCheckbox = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelectionChange = (e) => {
    e.stopPropagation();
    onSelectionChange(e.target.checked);
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
        return 'text-blue-600 bg-blue-50';
      case 'call':
        return 'text-green-600 bg-green-50';
      case 'meeting':
        return 'text-purple-600 bg-purple-50';
      case 'deal_update':
        return 'text-orange-600 bg-orange-50';
      case 'task':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
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
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity?.type)} flex-shrink-0`}>
          <Icon name={getActivityIcon(activity?.type)} size={20} />
        </div>

        {/* Activity Content */}
        <div className="flex-1 card p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
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
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">{activity?.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity?.priority)}`}>
                    {activity?.priority}
                  </span>
                  {activity?.dealValue && (
                    <span className="px-2 py-1 bg-success-50 text-success rounded-full text-xs font-medium">
                      {activity?.dealValue}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <div className="flex items-center space-x-2">
                    <Icon name={getChannelIcon(activity?.channel)} size={14} />
                    <span className="capitalize">{activity?.channel}</span>
                  </div>
                  <span>{formatTimestamp(activity?.timestamp)}</span>
                  {activity?.duration && (
                    <span>Duration: {activity?.duration}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all duration-150 ease-out"
              >
                <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
              </button>
            </div>
          </div>

          {/* Contact & Company Info */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-3">
              {activity?.contactAvatar && (
                <Image
                  src={activity?.contactAvatar}
                  alt={activity?.contact}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-medium text-text-primary">{activity?.contact}</div>
                <div className="text-sm text-text-secondary">{activity?.company}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              {activity?.user !== 'System' && activity?.avatar && (
                <div className="flex items-center space-x-2">
                  <Image
                    src={activity?.avatar}
                    alt={activity?.user}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-text-secondary">{activity?.user}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Preview */}
          <div className="mb-4">
            <p className="text-text-secondary text-sm leading-relaxed">
              {isExpanded 
                ? activity?.description
                : `${activity?.description?.substring(0, 150)}${activity?.description?.length > 150 ? '...' : ''}`
              }
            </p>
          </div>

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

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150 ease-out">
                <Icon name="MessageSquare" size={14} />
                <span>Reply</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150 ease-out">
                <Icon name="Plus" size={14} />
                <span>Follow-up</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-150 ease-out">
                <Icon name="Calendar" size={14} />
                <span>Schedule</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition-all duration-150 ease-out">
                <Icon name="Share" size={14} />
              </button>
              
              <button className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded transition-all duration-150 ease-out">
                <Icon name="MoreHorizontal" size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;