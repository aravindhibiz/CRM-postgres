import React from 'react';
import Icon from 'components/AppIcon';

const DealsGridView = ({ deals, stages, onEditDeal }) => {
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
                ${(deal.value || 0).toLocaleString()}
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

            {/* Action Button */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDeal(deal);
                }}
                className="w-full text-sm text-primary hover:text-primary-600 font-medium flex items-center justify-center space-x-1"
              >
                <Icon name="Edit" size={14} />
                <span>Edit Deal</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealsGridView;