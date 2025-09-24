import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import activitiesService from '../../../services/activitiesService';
import contactsService from '../../../services/contactsService';
import dealsService from '../../../services/dealsService';

const AddActivityModal = ({ isOpen, onClose, onActivityAdded, prefilledData = {} }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const initialFormState = useCallback(() => ({
    type: 'note',
    subject: '',
    description: '',
    contact_id: '',
    deal_id: '',
    duration_minutes: '',
    scheduled_at: '',
    user_id: user?.id || ''
  }), [user]);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [contactsData, dealsData] = await Promise.all([
            contactsService.getUserContacts(),
            dealsService.getUserDeals()
          ]);
          setContacts(contactsData || []);
          setDeals(dealsData || []);
        } catch (err) {
          console.error("Error loading modal data:", err);
          setErrors({ submit: "Failed to load contacts and deals." });
        }
      };
      loadData();
      setFormData({ ...initialFormState(), ...prefilledData });
    } else {
      setFormData({});
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const requiredFields = ['type', 'subject'];
      const validationErrors = {};
      
      requiredFields.forEach(field => {
        if (!formData[field]?.trim()) {
          validationErrors[field] = `${field.replace('_', ' ')} is required`;
        }
      });

      if (['call', 'meeting'].includes(formData.type) && formData.duration_minutes && 
          (isNaN(formData.duration_minutes) || parseInt(formData.duration_minutes) <= 0)) {
        validationErrors.duration_minutes = 'Please enter a valid duration';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        scheduled_at: formData.scheduled_at || null,
        user_id: user?.id,
        contact_id: formData.contact_id || null,
        deal_id: formData.deal_id || null,
      };

      const newActivity = await activitiesService.createActivity(submitData);
      onActivityAdded(newActivity);
      onClose();

    } catch (err) {
      console.error('Error creating activity:', err);
      setErrors({ 
        submit: err.message || 'Failed to create activity. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const activityTypes = [
    { value: 'note', label: 'Note', icon: 'FileText' },
    { value: 'call', label: 'Call', icon: 'Phone' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar' },
    { value: 'task', label: 'Task', icon: 'CheckSquare' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full relative z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Add New Activity</h3>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <Icon name="X" size={24} />
              </button>
            </div>

            {errors.submit && (
              <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">Activity Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {activityTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('type', type.value)}
                      className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                        formData.type === type.value
                          ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-50'
                      }`}
                    >
                      <Icon name={type.icon} size={20} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className={`w-full input-field ${errors.subject ? 'border-error' : ''}`}
                  required
                />
                {errors.subject && <p className="text-sm text-error mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full input-field"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Related Contact</label>
                  <select
                    value={formData.contact_id || ''}
                    onChange={(e) => handleInputChange('contact_id', e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Related Deal</label>
                  <select
                    value={formData.deal_id || ''}
                    onChange={(e) => handleInputChange('deal_id', e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">Select Deal</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>{deal.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {['call', 'meeting'].includes(formData.type) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration_minutes || ''}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                      className={`w-full input-field ${errors.duration_minutes ? 'border-error' : ''}`}
                    />
                    {errors.duration_minutes && <p className="text-sm text-error mt-1">{errors.duration_minutes}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Date/Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at || ''}
                      onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                      className="w-full input-field"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;
