import React from 'react';
import Icon from 'components/AppIcon';

const DealActions = ({ onSave, onDelete, onClone, onCreateTask, isSaving }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      {/* Primary Actions */}
      <div className="flex space-x-3">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Icon name="Save" size={16} />
              <span>Save Deal</span>
            </>
          )}
        </button>

        <button
          onClick={onCreateTask}
          className="btn-secondary flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Create Task</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onClone}
          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
          title="Clone Deal"
        >
          <Icon name="Copy" size={16} />
          <span className="hidden sm:inline">Clone</span>
        </button>

        <button
          onClick={onDelete}
          className="flex items-center space-x-2 px-4 py-2 border border-error text-error rounded-lg hover:bg-error-50 transition-all duration-150"
          title="Delete Deal"
        >
          <Icon name="Trash2" size={16} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default DealActions;