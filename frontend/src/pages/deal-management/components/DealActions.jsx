import React from 'react';
import Icon from 'components/AppIcon';

const DealActions = ({ onSave, isSaving }) => {
  return (
    <div className="flex items-center justify-end">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center space-x-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
      >
        {isSaving ? (
          <>
            <Icon name="Loader2" size={16} className="animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Icon name="Save" size={16} />
            <span>Save Deal</span>
          </>
        )}
      </button>
    </div>
  );
};

export default DealActions;