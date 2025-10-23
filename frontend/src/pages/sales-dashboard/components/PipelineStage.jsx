import React, { useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { configService } from '../../../services/configService';

const PipelineStage = ({ stage, totalValue, weightedValue }) => {
  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency for short display (e.g., €12K)
  const formatCurrencyShort = (value) => {
    const currency = configService.getCurrency();
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    if (value >= 1000000) {
      return formatter.format(value / 1000000).replace(/\.0/, '') + 'M';
    } else if (value >= 1000) {
      return formatter.format(value / 1000).replace(/\.0/, '') + 'K';
    } else {
      return formatter.format(value);
    }
  };

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
    <div className={`rounded-lg border-2 border-dashed p-3 h-full ${getStageColor(stage?.id)}`}>
      {/* Stage Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name={getStageIcon(stage?.id)} size={14} className="text-text-secondary" />
          <h3 className="font-semibold text-sm text-text-primary">{stage?.title}</h3>
        </div>
        <span className="text-xs font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-full">
          {stage?.deals?.length}
        </span>
      </div>
      {/* Stage Metrics */}
      <div className="mb-3 space-y-1 pb-3 border-b border-border">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Total:</span>
          <span className="font-semibold text-text-primary">
            {formatCurrencyShort(totalValue)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Weighted:</span>
          <span className="font-semibold text-text-primary">
            {formatCurrencyShort(weightedValue)}
          </span>
        </div>
      </div>
      {/* Droppable Area */}
      <Droppable droppableId={stage?.id}>
        {(provided, snapshot) => (
          <div
            ref={provided?.innerRef}
            {...provided?.droppableProps}
            className={`max-h-[500px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent ${
              snapshot?.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/20 rounded' : ''
            }`}
            style={{ minHeight: stage?.deals?.length === 0 ? '120px' : '200px' }}
          >
            {stage?.deals?.map((deal, index) => (
              <Draggable key={deal?.id} draggableId={deal?.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided?.innerRef}
                    {...provided?.draggableProps}
                    {...provided?.dragHandleProps}
                    className={`bg-surface rounded-lg p-2.5 border border-border shadow-sm cursor-move transition-all duration-150 hover:shadow-md hover:border-primary ${
                      snapshot?.isDragging ? 'rotate-2 shadow-lg ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* Deal Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xs font-semibold text-text-primary line-clamp-2 flex-1 pr-1">
                        {deal?.title}
                      </h4>
                      <Icon name="GripVertical" size={12} className="text-text-tertiary flex-shrink-0" />
                    </div>

                    {/* Deal Value */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-primary">
                        {formatCurrencyShort(deal?.value)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-400 rounded-full font-medium">
                        {deal?.probability}%
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Image
                        src={deal?.avatar}
                        alt={deal?.contact}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
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
                    <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
                      <span className="truncate">{deal?.daysInStage}d</span>
                      <span className="truncate">{deal?.lastActivity}</span>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided?.placeholder}
            
            {/* Empty State */}
            {stage?.deals?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-text-tertiary">
                <Icon name="Plus" size={20} className="mb-1" />
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