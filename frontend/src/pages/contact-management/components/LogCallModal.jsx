import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const LogCallModal = ({ contact, onClose, onLog }) => {
  const [callData, setCallData] = useState({
    contactId: contact?.id,
    date: new Date()?.toISOString()?.slice(0, 16), // Format: YYYY-MM-DDThh:mm
    duration: 15,
    direction: 'outbound',
    summary: '',
    outcome: 'completed'
  });
  const [isLogging, setIsLogging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setCallData({
      ...callData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsLogging(true);
    
    // Simulate logging call
    setTimeout(() => {
      onLog({
        ...callData,
        id: Date.now(),
        type: 'call'
      });
    }, 1000);
  };

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
              <h3 className="text-lg font-semibold text-text-primary">Log Call</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={`${contact?.firstName} ${contact?.lastName}`}
                    className="input-field"
                    readOnly
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      value={callData?.date}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-text-secondary mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={callData?.duration}
                      onChange={handleChange}
                      min="1"
                      max="240"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="direction" className="block text-sm font-medium text-text-secondary mb-1">
                    Call Direction
                  </label>
                  <select
                    id="direction"
                    name="direction"
                    value={callData?.direction}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="outcome" className="block text-sm font-medium text-text-secondary mb-1">
                    Call Outcome
                  </label>
                  <select
                    id="outcome"
                    name="outcome"
                    value={callData?.outcome}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="completed">Completed</option>
                    <option value="left-voicemail">Left Voicemail</option>
                    <option value="no-answer">No Answer</option>
                    <option value="busy">Busy</option>
                    <option value="wrong-number">Wrong Number</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-text-secondary mb-1">
                    Call Summary
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={callData?.summary}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter call notes and summary..."
                    className="input-field"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLogging}
                className={`btn-primary inline-flex items-center ${
                  isLogging ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLogging ? (
                  <>
                    <Icon name="Loader" size={16} className="animate-spin mr-2" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Log Call
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogCallModal;