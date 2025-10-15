import React, { useEffect } from 'react';
import Icon from 'components/AppIcon';
import { configService } from '../../../services/configService';
import { useAuth } from '../../../contexts/AuthContext';

const DealsGridView = ({ deals, stages, onEditDeal, onCloneDeal, onDeleteDeal }) => {
  const { hasAnyPermission } = useAuth();
  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Package" size={48} className="text-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No deals found
        </h3>
        <p className="text-text-secondary">
          Try adjusting your filters or create a new deal
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {deals.map((deal) => {
        const stage = stages.find(s => s.value === deal.stage);
        
        return (
          <div
            key={deal.id}
            className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => onEditDeal(deal)}
          >
            {/* Deal Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                {deal.name || 'Untitled Deal'}
              </h3>
              <p className="text-sm text-text-secondary line-clamp-2 min-h-[2.5rem]">
                {deal.description || 'No description'}
              </p>
            </div>

            {/* Deal Value */}
            <div className="mb-4">
              <div className="text-2xl font-bold text-text-primary">
                {formatCurrency(deal.value || 0)}
              </div>
              <div className="text-sm text-text-secondary">
                {deal.probability || 0}% probability
              </div>
            </div>

            {/* Stage Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                stage?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {stage?.label || deal.stage}
              </span>
            </div>

            {/* Deal Metadata */}
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span>{new Date(deal.created_at).toLocaleDateString()}</span>
              </div>
              
              {deal.updated_at && (
                <div className="flex items-center justify-between">
                  <span>Updated:</span>
                  <span>{new Date(deal.updated_at).toLocaleDateString()}</span>
                </div>
              )}
              
              {deal.contact_name && (
                <div className="flex items-center justify-between">
                  <span>Contact:</span>
                  <span className="truncate ml-2">{deal.contact_name}</span>
                </div>
              )}
              
              {deal.company_name && (
                <div className="flex items-center justify-between">
                  <span>Company:</span>
                  <span className="truncate ml-2">{deal.company_name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-center space-x-2">
                {/* Edit Button */}
                {hasAnyPermission(['deals.edit_all', 'deals.edit_own']) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDeal(deal);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                    title="Edit deal"
                  >
                    <Icon name="Edit" size={16} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                )}
                
                {/* Clone Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloneDeal(deal);
                  }}
                  className="flex items-center space-x-1 px-3 py-2 text-text-secondary hover:bg-surface-hover rounded-lg transition-colors duration-150"
                  title="Clone deal"
                >
                  <Icon name="Copy" size={16} />
                  <span className="text-sm font-medium">Clone</span>
                </button>
                
                {/* Delete Button */}
                {hasAnyPermission(['deals.delete_all', 'deals.delete_own']) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDeal(deal);
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-error hover:bg-error-50 rounded-lg transition-colors duration-150"
                    title="Delete deal"
                  >
                    <Icon name="Trash2" size={16} />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealsGridView;