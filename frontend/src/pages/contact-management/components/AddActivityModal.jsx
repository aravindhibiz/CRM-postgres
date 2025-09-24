import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from 'components/AppIcon';

const AddActivityModal = ({ contact, onClose, onActivityAdded }) => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState({
    type: 'note',
    subject: '',
    description: '',
    scheduled_at: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    duration_minutes: 30
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = [
    { value: 'note', label: 'Note', icon: 'FileText' },
    { value: 'call', label: 'Call', icon: 'Phone' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar' },
    { value: 'task', label: 'Task', icon: 'CheckSquare' },
    { value: 'demo', label: 'Demo', icon: 'Monitor' },
    { value: 'proposal_sent', label: 'Proposal Sent', icon: 'FileText' },
    { value: 'document_shared', label: 'Document Shared', icon: 'Share' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivityData({
      ...activityData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activityData.subject.trim()) {
      toast.error('Please enter a subject for the activity');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const activityPayload = {
        type: activityData.type,
        subject: activityData.subject,
        description: activityData.description,
        duration_minutes: activityData.duration_minutes,
        scheduled_at: new Date(activityData.scheduled_at).toISOString(),
        contact_id: contact?.id,
        user_id: user?.id
      };

      await onActivityAdded(activityPayload);
      toast.success(`${activityData.type.charAt(0).toUpperCase() + activityData.type.slice(1)} activity logged successfully!`);
      onClose();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = activityTypes.find(type => type.value === activityData.type);

  return (
    <div className="fixed inset-0 z-1100 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Icon name={selectedType?.icon} size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-text-primary">Log Activity</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Contact Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-text-secondary">Contact</div>
                <div className="font-medium text-text-primary">
                  {contact?.first_name} {contact?.last_name}
                </div>
                {contact?.email && (
                  <div className="text-sm text-text-secondary">{contact.email}</div>
                )}
              </div>

              {/* Activity Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-primary mb-1">
                  Activity Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={activityData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={activityData.subject}
                  onChange={handleChange}
                  placeholder="Enter activity subject..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Content/Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={activityData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter activity details..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Date and Time */}
              <div>
                <label htmlFor="scheduled_at" className="block text-sm font-medium text-text-primary mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="scheduled_at"
                  name="scheduled_at"
                  value={activityData.scheduled_at}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-text-primary mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  value={activityData.duration_minutes}
                  onChange={handleChange}
                  min="5"
                  max="480"
                  placeholder="30"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Logging...</span>
                  </div>
                ) : (
                  'Log Activity'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;
