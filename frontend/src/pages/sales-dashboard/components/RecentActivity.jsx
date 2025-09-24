import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import activitiesService from '../../../services/activitiesService';

const RecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    }
  }, [user]);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await activitiesService?.getRecentActivity(10);
      setActivities(data || []);
    } catch (err) {
      console.error('Error loading recent activity:', err);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      email: 'Mail',
      call: 'Phone', 
      meeting: 'Calendar',
      note: 'FileText',
      task: 'CheckSquare',
      demo: 'Play',
      proposal_sent: 'Send'
    };
    return icons?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      email: 'text-blue-600',
      call: 'text-green-600',
      meeting: 'text-purple-600', 
      note: 'text-gray-600',
      task: 'text-orange-600',
      demo: 'text-indigo-600',
      proposal_sent: 'text-red-600'
    };
    return colors?.[type] || 'text-gray-600';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityDate?.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Icon name="Activity" size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Sign in to view recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <button 
          onClick={loadRecentActivity}
          className="text-text-tertiary hover:text-text-secondary"
          disabled={loading}
        >
          <Icon name="RefreshCw" size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {error && (
        <div className="bg-error-50 text-error text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)]?.map((_, index) => (
            <div key={index} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Activity" size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity?.type === 'email' ? 'bg-blue-100' :
                activity?.type === 'call' ? 'bg-green-100' :
                activity?.type === 'meeting' ? 'bg-purple-100' :
                activity?.type === 'note'? 'bg-gray-100' : 'bg-orange-100'
              }`}>
                <Icon 
                  name={getActivityIcon(activity?.type)} 
                  size={16} 
                  className={getActivityColor(activity?.type)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">
                  {activity?.title}
                </p>
                
                <div className="flex items-center space-x-2 text-xs text-text-secondary mt-1">
                  <span>{activity?.user}</span>
                  {activity?.contact && (
                    <>
                      <span>•</span>
                      <span>{activity?.contact}</span>
                    </>
                  )}
                  {activity?.company && (
                    <>
                      <span>•</span>
                      <span>{activity?.company}</span>
                    </>
                  )}
                </div>
                
                <p className="text-xs text-text-tertiary mt-1">
                  {formatTimeAgo(activity?.time)}
                </p>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-border">
            <button className="text-sm text-primary hover:text-primary-600 font-medium">
              View all activity →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;