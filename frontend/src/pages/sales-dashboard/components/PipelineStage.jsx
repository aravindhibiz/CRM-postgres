import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const PipelineStage = ({ stage, totalValue, weightedValue }) => {
  const getStageColor = (stageId) => {
    const colors = {
      'lead': 'bg-surface border-border',
      'qualified': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50',
      'proposal': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50',
      'negotiation': 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/50',
      'closed': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50'
    };
    return colors?.[stageId] || 'bg-surface border-border';
  };

  const getStageIcon = (stageId) => {
    const icons = {
      'lead': 'UserPlus',
      'qualified': 'CheckCircle',
      'proposal': 'FileText',
      'negotiation': 'MessageSquare',
      'closed': 'Trophy'
    };
    return icons?.[stageId] || 'Circle';
  };

  return (
    <div className={`rounded-lg border-2 border-dashed p-4 ${getStageColor(stage?.id)}`}>
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name={getStageIcon(stage?.id)} size={16} className="text-text-secondary" />
          <h3 className="font-medium text-text-primary">{stage?.title}</h3>
        </div>
        <span className="text-sm font-medium text-text-secondary">
          {stage?.deals?.length}
        </span>
      </div>
      {/* Stage Metrics */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Total:</span>
          <span className="font-medium text-text-primary">
            ${(totalValue / 1000)?.toFixed(0)}K
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Weighted:</span>
          <span className="font-medium text-text-primary">
            ${(weightedValue / 1000)?.toFixed(0)}K
          </span>
        </div>
      </div>
      {/* Droppable Area */}
      <Droppable droppableId={stage?.id}>
        {(provided, snapshot) => (
          <div
            ref={provided?.innerRef}
            {...provided?.droppableProps}
            className={`min-h-[200px] space-y-3 ${
              snapshot?.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700/50' : ''
            }`}
          >
            {stage?.deals?.map((deal, index) => (
              <Draggable key={deal?.id} draggableId={deal?.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided?.innerRef}
                    {...provided?.draggableProps}
                    {...provided?.dragHandleProps}
                    className={`bg-surface rounded-lg p-3 border border-border shadow-sm cursor-move transition-all duration-150 hover:shadow-md ${
                      snapshot?.isDragging ? 'rotate-2 shadow-lg' : ''
                    }`}
                  >
                    {/* Deal Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-text-primary line-clamp-2">
                        {deal?.title}
                      </h4>
                      <Icon name="GripVertical" size={14} className="text-text-tertiary mt-1" />
                    </div>

                    {/* Deal Value */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-text-primary">
                        ${(deal?.value / 1000)?.toFixed(0)}K
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-400 rounded-full">
                        {deal?.probability}%
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Image
                        src={deal?.avatar}
                        alt={deal?.contact}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {deal?.contact}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {deal?.company}
                        </p>
                      </div>
                    </div>

                    {/* Deal Metadata */}
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{deal?.daysInStage} days in stage</span>
                      <span>{deal?.lastActivity}</span>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided?.placeholder}
            
            {/* Empty State */}
            {stage?.deals?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-text-tertiary">
                <Icon name="Plus" size={24} className="mb-2" />
                <span className="text-xs">Drop deals here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default PipelineStage;