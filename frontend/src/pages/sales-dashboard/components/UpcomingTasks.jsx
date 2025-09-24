import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import tasksService from '../../../services/tasksService';

const UpcomingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadUpcomingTasks();
    }
  }, [user]);

  const loadUpcomingTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tasksService?.getUpcomingTasks(7); // Next 7 days
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading upcoming tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksService?.completeTask(taskId);
      // Refresh tasks after completion
      loadUpcomingTasks();
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100', 
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors?.[priority] || 'text-gray-600 bg-gray-100';
  };

  const formatDueDate = (dueDate, daysUntilDue) => {
    if (!dueDate) return null;
    
    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };

  if (!user) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Tasks</h3>
        <div className="text-center py-8">
          <Icon name="CheckSquare" size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Sign in to view your tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Upcoming Tasks</h3>
        <button 
          onClick={loadUpcomingTasks}
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
          {[...Array(4)]?.map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="CheckSquare" size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">No upcoming tasks</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks?.slice(0, 6)?.map((task) => (
            <div key={task?.id} className="flex items-start space-x-3 group">
              <button
                onClick={() => handleCompleteTask(task?.id)}
                className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  task?.status === 'completed'
                    ? 'bg-success border-success text-white' :'border-border hover:border-primary hover:bg-primary-50'
                }`}
              >
                {task?.status === 'completed' && (
                  <Icon name="Check" size={12} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className={`text-sm font-medium ${
                    task?.status === 'completed' 
                      ? 'text-text-secondary line-through' :'text-text-primary'
                  }`}>
                    {task?.title}
                  </h4>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task?.priority)} ml-2 flex-shrink-0`}>
                    {task?.priority}
                  </span>
                </div>
                
                {task?.description && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {task?.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-text-tertiary mt-2">
                  {task?.deal && (
                    <>
                      <Icon name="Briefcase" size={12} />
                      <span>{task?.deal}</span>
                    </>
                  )}
                  
                  {task?.contact && (
                    <>
                      <span>•</span>
                      <Icon name="User" size={12} />
                      <span>{task?.contact}</span>
                    </>
                  )}
                </div>
                
                {task?.dueDate && (
                  <div className={`text-xs mt-2 ${
                    task?.isOverdue 
                      ? 'text-error font-medium' 
                      : task?.daysUntilDue === 0
                      ? 'text-warning font-medium' :'text-text-tertiary'
                  }`}>
                    {formatDueDate(task?.dueDate, task?.daysUntilDue)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {tasks?.length > 6 && (
            <div className="pt-3 border-t border-border">
              <button className="text-sm text-primary hover:text-primary-600 font-medium">
                View all tasks ({tasks?.length}) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;