import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const DealsList = ({ deals, contactName }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };
  
  const getStageLabel = (stage) => {
    switch (stage) {
      case 'discovery':
        return 'Discovery';
      case 'proposal':
        return 'Proposal';
      case 'negotiation':
        return 'Negotiation';
      case 'closed-won':
        return 'Closed Won';
      case 'closed-lost':
        return 'Closed Lost';
      default:
        return stage?.charAt(0)?.toUpperCase() + stage?.slice(1);
    }
  };
  
  const getStageColor = (stage) => {
    switch (stage) {
      case 'discovery':
        return 'bg-primary-50 text-primary';
      case 'proposal':
        return 'bg-secondary-50 text-secondary';
      case 'negotiation':
        return 'bg-warning-50 text-warning';
      case 'closed-won':
        return 'bg-success-50 text-success';
      case 'closed-lost':
        return 'bg-error-50 text-error';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Deals</h3>
        
        <Link
          to="/deal-management"
          className="inline-flex items-center space-x-2 px-3 py-1 border border-border rounded-md text-text-secondary hover:text-primary hover:border-primary transition-all duration-150 ease-out text-sm"
        >
          <Icon name="Plus" size={14} />
          <span>Add Deal</span>
        </Link>
      </div>
      {deals?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-surface-hover text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Deal Name
                </th>
                <th className="px-4 py-3 bg-surface-hover text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-4 py-3 bg-surface-hover text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 bg-surface-hover text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {deals?.map((deal) => (
                <tr key={deal?.id} className="hover:bg-surface-hover">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{deal?.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(deal?.stage)}`}>
                      {getStageLabel(deal?.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-text-primary font-medium">
                    {formatCurrency(deal?.value)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to={`/deal-management?deal=${deal?.id}`}
                      className="text-primary hover:text-primary-700"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Icon name="Target" size={32} className="text-text-tertiary mx-auto mb-3" />
          <h4 className="text-lg font-medium text-text-primary mb-1">No deals found</h4>
          <p className="text-text-secondary mb-4">
            {contactName} doesn't have any deals associated yet.
          </p>
          <Link
            to="/deal-management"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>Create a Deal</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DealsList;