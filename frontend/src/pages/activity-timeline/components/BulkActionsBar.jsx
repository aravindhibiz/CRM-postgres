import React from 'react';
import Icon from 'components/AppIcon';

const BulkActionsBar = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const handleAction = (action) => {
    // Get selected activity IDs - this would need to be passed from parent
    // For now, we'll simulate with the count
    const selectedIds = Array.from({ length: selectedCount }, (_, i) => `activity-${i}`);
    onBulkAction(action, selectedIds);
  };

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-primary">
          <Icon name="CheckSquare" size={20} />
          <span className="font-medium">{selectedCount} activities selected</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleAction('export')}
          className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-primary-300 rounded-md text-primary hover:bg-primary-50 transition-colors duration-150"
        >
          <Icon name="Download" size={16} />
          <span>Export</span>
        </button>
        
        <button
          onClick={() => handleAction('archive')}
          className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-primary-300 rounded-md text-primary hover:bg-primary-50 transition-colors duration-150"
        >
          <Icon name="Archive" size={16} />
          <span>Archive</span>
        </button>
        
        <button
          onClick={() => handleAction('delete')}
          className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 border border-red-300 rounded-md text-red-600 hover:bg-red-100 transition-colors duration-150"
        >
          <Icon name="Trash2" size={16} />
          <span>Delete</span>
        </button>
        
        <button
          onClick={onClearSelection}
          className="flex items-center space-x-2 px-3 py-1.5 text-text-secondary hover:text-text-primary transition-colors duration-150"
        >
          <Icon name="X" size={16} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;