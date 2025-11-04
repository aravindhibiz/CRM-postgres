import React from 'react';
import Icon from 'components/AppIcon';
import Pagination from 'components/Pagination';
import { useAuth } from '../../../contexts/AuthContext';
import { configService } from '../../../services/configService';

const CampaignsList = ({
  campaigns,
  allCampaigns,
  statuses,
  types,
  selectedStatusFilter,
  selectedTypeFilter,
  searchQuery,
  sortField,
  sortDirection,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onStatusFilterChange,
  onTypeFilterChange,
  onSearchChange,
  onSort,
  onPageChange,
  onItemsPerPageChange,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign
}) => {
  const { hasAnyPermission } = useAuth();

  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    return statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    return statuses.find(s => s.value === status)?.label || status;
  };

  const getTypeIcon = (type) => {
    return types.find(t => t.value === type)?.icon || 'Mail';
  };

  const getTypeLabel = (type) => {
    return types.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Search Bar */}
      <div className="p-6 border-b border-border">
        <div className="relative">
          <Icon
            name="Search"
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search campaigns by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-tertiary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">All Campaigns</h2>
          <div className="flex items-center space-x-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="text-sm border border-border rounded-md px-2 py-1 bg-surface"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="text-sm text-text-secondary">
              {totalItems} campaign{totalItems !== 1 ? 's' : ''}
              {(selectedStatusFilter !== 'all' || selectedTypeFilter !== 'all' || searchQuery) && ` (${Array.isArray(allCampaigns) ? allCampaigns.length : 0} total)`}
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">Filter by Status:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedStatusFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Statuses ({Array.isArray(allCampaigns) ? allCampaigns.length : 0})
            </button>
            {statuses.map(status => {
              const statusCount = Array.isArray(allCampaigns) ? allCampaigns.filter(campaign => campaign.status === status.value).length : 0;
              return (
                <button
                  key={status.value}
                  onClick={() => onStatusFilterChange(status.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedStatusFilter === status.value
                      ? 'bg-primary text-white'
                      : `${status.color} hover:opacity-80`
                  }`}
                >
                  {status.label} ({statusCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Filter by Type:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTypeFilterChange('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedTypeFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            {types.map(type => {
              const typeCount = Array.isArray(allCampaigns) ? allCampaigns.filter(campaign => campaign.type === type.value).length : 0;
              return (
                <button
                  key={type.value}
                  onClick={() => onTypeFilterChange(type.value)}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedTypeFilter === type.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon name={type.icon} size={14} />
                  <span>{type.label} ({typeCount})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      {campaigns.length === 0 ? (
        <div className="p-8 text-center">
          <Icon name="Megaphone" size={48} className="text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {selectedStatusFilter === 'all' && selectedTypeFilter === 'all' && !searchQuery
              ? 'No campaigns yet'
              : 'No campaigns found'}
          </h3>
          <p className="text-text-secondary mb-4">
            {selectedStatusFilter === 'all' && selectedTypeFilter === 'all' && !searchQuery
              ? 'Create your first campaign to get started'
              : 'Try adjusting your filters or search query'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover transition-colors"
                    onClick={() => onSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Campaign</span>
                      {sortField === 'name' && (
                        <Icon
                          name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                          size={14}
                          className="text-primary"
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover transition-colors"
                    onClick={() => onSort('budget')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Budget</span>
                      {sortField === 'budget' && (
                        <Icon
                          name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                          size={14}
                          className="text-primary"
                        />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover transition-colors"
                    onClick={() => onSort('start_date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Start Date</span>
                      {sortField === 'start_date' && (
                        <Icon
                          name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'}
                          size={14}
                          className="text-primary"
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
                    onClick={() => onViewCampaign(campaign)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {campaign.name || 'Untitled Campaign'}
                        </div>
                        <div className="text-sm text-text-secondary truncate max-w-xs">
                          {campaign.description || 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Icon name={getTypeIcon(campaign.type)} size={16} className="text-text-secondary" />
                        <span className="text-sm text-text-primary">{getTypeLabel(campaign.type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {formatCurrency(campaign.budget || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(campaign.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-xs text-text-secondary">
                          Sent: {campaign.sent_count || 0}
                        </div>
                        <div className="text-xs text-text-secondary">
                          Open: {campaign.open_rate?.toFixed(1) || 0}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Icon */}
                        {hasAnyPermission(['campaigns.edit_all', 'campaigns.edit_own']) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCampaign(campaign);
                            }}
                            className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                            title="Edit campaign"
                          >
                          <Icon name="Edit" size={16} />
                        </button>
                      )}

                      {/* Delete Icon */}
                      {hasAnyPermission(['campaigns.delete_all', 'campaigns.delete_own']) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCampaign(campaign);
                            }}
                            className="p-2 text-error hover:bg-error-50 rounded-lg transition-colors duration-150"
                            title="Delete campaign"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignsList;
