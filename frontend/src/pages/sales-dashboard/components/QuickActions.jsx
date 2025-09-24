import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const QuickActions = () => {
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  const quickActions = [
    {
      id: 'add-deal',
      title: 'Add New Deal',
      description: 'Create a new sales opportunity',
      icon: 'Plus',
      color: 'bg-primary text-white',
      hoverColor: 'hover:bg-primary-700',
      action: () => setShowAddDealModal(true)
    },
    {
      id: 'add-contact',
      title: 'Add Contact',
      description: 'Add a new customer contact',
      icon: 'UserPlus',
      color: 'bg-success text-white',
      hoverColor: 'hover:bg-success-600',
      action: () => setShowAddContactModal(true)
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Book a call or demo',
      icon: 'Calendar',
      color: 'bg-accent text-white',
      hoverColor: 'hover:bg-accent-600',
      action: () => window.open('https://calendar.google.com', '_blank')
    },
    {
      id: 'send-email',
      title: 'Send Email',
      description: 'Compose and send email',
      icon: 'Mail',
      color: 'bg-secondary text-white',
      hoverColor: 'hover:bg-secondary-600',
      action: () => window.open('mailto:', '_blank')
    }
  ];

  const shortcuts = [
    { title: 'Deal Management', path: '/deal-management', icon: 'Target' },
    { title: 'Contact Management', path: '/contact-management', icon: 'Users' },
    { title: 'Pipeline Analytics', path: '/pipeline-analytics', icon: 'TrendingUp' },
    { title: 'Activity Timeline', path: '/activity-timeline', icon: 'Clock' }
  ];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Quick Actions</h3>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className={`${action?.color} ${action?.hoverColor} p-4 rounded-lg transition-all duration-150 text-left group`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Icon name={action?.icon} size={20} />
              <span className="font-medium text-sm">{action?.title}</span>
            </div>
            <p className="text-xs opacity-90">{action?.description}</p>
          </button>
        ))}
      </div>
      {/* Quick Navigation */}
      <div className="border-t border-border pt-6">
        <h4 className="text-sm font-medium text-text-primary mb-4">Quick Navigation</h4>
        <div className="space-y-2">
          {shortcuts?.map((shortcut) => (
            <Link
              key={shortcut?.path}
              to={shortcut?.path}
              className="flex items-center space-x-3 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
            >
              <Icon name={shortcut?.icon} size={16} />
              <span className="text-sm">{shortcut?.title}</span>
              <Icon name="ChevronRight" size={14} className="ml-auto" />
            </Link>
          ))}
        </div>
      </div>
      {/* Add Deal Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1300">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Add New Deal</h3>
              <button
                onClick={() => setShowAddDealModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Deal Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter deal title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Company
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Deal Value
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  onClick={() => setShowAddDealModal(false)}
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1300">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Add New Contact</h3>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="email@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Company
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Company name"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  onClick={() => setShowAddContactModal(false)}
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;