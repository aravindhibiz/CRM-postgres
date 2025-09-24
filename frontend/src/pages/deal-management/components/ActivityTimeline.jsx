import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ActivityTimeline = ({ 
  activities = [], 
  loading = false, 
  contact = null, 
  onAddActivity, 
  onDeleteActivity 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'note',
    title: '',
    description: ''
  });

  const activityTypes = [
    { value: 'email', label: 'Email', icon: 'Mail', color: 'text-blue-600' },
    { value: 'call', label: 'Call', icon: 'Phone', color: 'text-green-600' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar', color: 'text-purple-600' },
    { value: 'note', label: 'Note', icon: 'FileText', color: 'text-gray-600' },
    { value: 'task', label: 'Task', icon: 'CheckSquare', color: 'text-orange-600' },
    { value: 'demo', label: 'Demo', icon: 'Play', color: 'text-indigo-600' }
  ];

  const getActivityTypeInfo = (type) => {
    return activityTypes?.find(t => t?.value === type) || activityTypes?.find(t => t?.value === 'note');
  };

  const handleAddActivity = async () => {
    if (!newActivity?.title?.trim()) return;

    try {
      await onAddActivity?.(newActivity);
      setNewActivity({ type: 'note', title: '', description: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date?.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date?.getFullYear() !== now?.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors duration-150 text-sm"
          >
            <Icon name="Plus" size={16} />
            <span>Add</span>
          </button>
        </div>
        
        {contact && (
          <div className="mt-2 text-sm text-text-secondary">
            Primary Contact: {contact?.first_name} {contact?.last_name}
            {contact?.email && (
              <a 
                href={`mailto:${contact?.email}`}
                className="ml-2 text-primary hover:text-primary-600"
              >
                {contact?.email}
              </a>
            )}
          </div>
        )}
      </div>
      {/* Activities List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-text-secondary">Loading activities...</span>
          </div>
        ) : activities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="text-text-tertiary mx-auto mb-2" />
            <p className="text-text-secondary">No activities yet</p>
            <p className="text-sm text-text-tertiary mt-1">Add your first activity to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity, index) => {
              const typeInfo = getActivityTypeInfo(activity?.type);
              
              return (
                <div key={activity?.id} className="flex space-x-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center ${
                      index === 0 ? 'border-primary' : 'border-border'
                    }`}>
                      <Icon 
                        name={typeInfo?.icon} 
                        size={14} 
                        className={index === 0 ? 'text-primary' : typeInfo?.color}
                      />
                    </div>
                    {index < activities?.length - 1 && (
                      <div className="w-0.5 h-6 bg-border mt-1"></div>
                    )}
                  </div>
                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-background rounded-lg p-4 border border-border hover:border-border-hover transition-colors duration-150">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-text-primary text-sm">
                              {activity?.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${typeInfo?.value === 'email' ? 'blue' : typeInfo?.value === 'call' ? 'green' : typeInfo?.value === 'meeting' ? 'purple' : 'gray'}-100 text-${typeInfo?.value === 'email' ? 'blue' : typeInfo?.value === 'call' ? 'green' : typeInfo?.value === 'meeting' ? 'purple' : 'gray'}-800`}>
                              {typeInfo?.label}
                            </span>
                          </div>
                          
                          {activity?.description && (
                            <p className="text-sm text-text-secondary mb-2 line-clamp-3">
                              {activity?.description}
                            </p>
                          )}
                          
                          <div className="flex items-center text-xs text-text-tertiary space-x-2">
                            <span>{activity?.user}</span>
                            <span>•</span>
                            <span>{formatDate(activity?.timestamp)}</span>
                            {activity?.duration && (
                              <>
                                <span>•</span>
                                <span>{activity?.duration} min</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => onDeleteActivity?.(activity?.id)}
                          className="ml-2 text-text-tertiary hover:text-error transition-colors duration-150"
                          title="Delete activity"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Add Activity</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-tertiary hover:text-text-secondary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Activity Type
                </label>
                <select
                  value={newActivity?.type}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, type: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                >
                  {activityTypes?.map(type => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newActivity?.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="What happened?"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={newActivity?.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e?.target?.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Add details..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                disabled={!newActivity?.title?.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;