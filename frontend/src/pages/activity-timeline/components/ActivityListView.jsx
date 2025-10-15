import React from 'react';
import Icon from 'components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const ActivityListView = ({ 
  activities, 
  selectedActivities, 
  onActivitySelection, 
  onEdit, 
  onDelete,
  onSelectAll 
}) => {
  const { hasAnyPermission } = useAuth();

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
      case 'note':
        return 'FileText';
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
      case 'note':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[priority] || 'bg-gray-100 text-gray-700'}`}>
        {priority}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedActivities.size === activities.length && activities.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-border text-primary focus:ring-primary"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-16">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Icon name="Activity" size={32} className="text-gray-400" />
                    </div>
                    <p className="text-text-secondary text-sm">No activities found</p>
                  </div>
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr 
                  key={activity.id} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedActivities.has(activity.id)}
                      onChange={(e) => onActivitySelection(activity.id, e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </td>

                  {/* Type Icon */}
                  <td className="px-4 py-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <Icon name={getActivityIcon(activity.type)} size={16} />
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary line-clamp-1">
                        {activity.title || 'Untitled'}
                      </span>
                      {activity.description && (
                        <span className="text-xs text-text-tertiary line-clamp-1 mt-1">
                          {truncateText(activity.description, 80)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {activity.contactAvatar ? (
                        <img 
                          src={activity.contactAvatar} 
                          alt={activity.contact}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {activity.contact?.charAt(0) || 'N'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-text-secondary truncate max-w-[150px]">
                        {activity.contact || 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-text-secondary truncate block max-w-[150px]">
                      {activity.company || 'N/A'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1 text-sm text-text-tertiary">
                      <Icon name="Clock" size={14} />
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {activity.avatar ? (
                        <img 
                          src={activity.avatar} 
                          alt={activity.user}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {activity.user?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-text-secondary truncate max-w-[100px]">
                        {activity.user || 'System'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      {hasAnyPermission(['activities.update_all', 'activities.update_own']) && (
                        <button
                          onClick={() => onEdit(activity)}
                          className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary-50 rounded transition-colors duration-150"
                          title="Edit"
                        >
                          <Icon name="Edit2" size={16} />
                        </button>
                      )}
                      {hasAnyPermission(['activities.delete_all', 'activities.delete_own']) && (
                        <button
                          onClick={() => onDelete(activity.id)}
                          className="p-1.5 text-text-tertiary hover:text-error hover:bg-error-50 rounded transition-colors duration-150"
                          title="Delete"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityListView;
