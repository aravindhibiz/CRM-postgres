import React, { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Icon from 'components/AppIcon';
import AddActivityModal from './AddActivityModal';
import { activitiesService } from '../../../services/activitiesService';

const ActivityTimeline = ({ activities, contact, onActivityAdded }) => {
  const [filter, setFilter] = useState('all');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'email':
        return 'Mail';
      case 'call':
        return 'Phone';
      case 'meeting':
        return 'Calendar';
      case 'note':
        return 'FileText';
      case 'task':
        return 'CheckSquare';
      default:
        return 'Activity';
    }
  };
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'email':
        return 'bg-primary-50 text-primary';
      case 'call':
        return 'bg-success-50 text-success';
      case 'meeting':
        return 'bg-secondary-50 text-secondary';
      case 'note':
        return 'bg-warning-50 text-warning';
      case 'task':
        return 'bg-accent-50 text-accent';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const handleAddActivity = async (activityData) => {
    try {
      const newActivity = await activitiesService.createActivity(activityData);
      if (onActivityAdded) {
        onActivityAdded(newActivity);
      }
      return newActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  const handleOpenAddModal = () => {
    setShowAddActivityModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddActivityModal(false);
  };
  
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities?.filter(activity => activity?.type === filter);
  
  const sortedActivities = [...filteredActivities]?.sort((a, b) => 
    new Date(b.scheduled_at || b.created_at) - new Date(a.scheduled_at || a.created_at)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="text-sm border border-border rounded-md py-1 px-2 text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Activities</option>
            <option value="email">Emails</option>
            <option value="call">Calls</option>
            <option value="meeting">Meetings</option>
            <option value="note">Notes</option>
            <option value="task">Tasks</option>
          </select>
          
          <button 
            className="inline-flex items-center space-x-2 px-3 py-1 border border-border rounded-md text-text-secondary hover:text-primary hover:border-primary transition-all duration-150 ease-out text-sm"
            onClick={handleOpenAddModal}
          >
            <Icon name="Plus" size={14} />
            <span>Log Activity</span>
          </button>
        </div>
      </div>
      {sortedActivities?.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
          
          {/* Activities */}
          <div className="space-y-6">
            {sortedActivities?.map((activity) => (
              <div key={activity?.id} className="relative pl-14">
                {/* Activity icon */}
                <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={20} />
                </div>
                
                {/* Activity content */}
                <div className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {activity?.type === 'email' && 'Email: '}
                        {activity?.type === 'call' && 'Call: '}
                        {activity?.type === 'meeting' && 'Meeting: '}
                        {activity?.subject || activity?.summary}
                      </h4>
                      <p className="text-sm text-text-tertiary">
                        {formatDateTime(activity?.scheduled_at || activity?.created_at)}
                        {activity?.duration_minutes && ` • ${activity?.duration_minutes} minutes`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-text-tertiary hover:text-text-primary">
                        <Icon name="Edit" size={14} />
                      </button>
                      <button className="text-text-tertiary hover:text-error">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                  
                                    {activity?.description && (
                    <div className="text-text-primary text-sm mt-2">
                      {activity?.description}
                    </div>
                  )}
                  
                  {activity?.summary && !activity?.subject && (
                    <div className="text-text-primary text-sm mt-2">
                      {activity?.summary}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Icon name="Calendar" size={32} className="text-text-tertiary mx-auto mb-3" />
          <h4 className="text-lg font-medium text-text-primary mb-1">No activities found</h4>
          <p className="text-text-secondary mb-4">
            {filter === 'all' ?'There are no activities recorded for this contact yet.' 
              : `There are no ${filter} activities recorded for this contact.`}
          </p>
          <button 
            className="btn-primary inline-flex items-center space-x-2"
            onClick={handleOpenAddModal}
          >
            <Icon name="Plus" size={16} />
            <span>Log an Activity</span>
          </button>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <AddActivityModal
          contact={contact}
          onClose={handleCloseAddModal}
          onActivityAdded={handleAddActivity}
        />
      )}
    </div>
  );
};

export default ActivityTimeline;