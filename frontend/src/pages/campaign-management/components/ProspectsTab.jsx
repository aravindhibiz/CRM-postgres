import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Icon from 'components/AppIcon';
import { campaignsService } from '../../../services/campaignsService';
import { useAuth } from '../../../contexts/AuthContext';
import ProspectDetailModal from './ProspectDetailModal';
import ProspectConversionDialog from './ProspectConversionDialog';
import ProspectForm from './ProspectForm';
import CreateDealFromProspectDialog from './CreateDealFromProspectDialog';

const ProspectsTab = ({ campaignId }) => {
  const { hasAnyPermission } = useAuth();
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateDealDialog, setShowCreateDealDialog] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Prospect statuses
  const prospectStatuses = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (campaignId) {
      loadProspects();
    }
  }, [campaignId]);

  const loadProspects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campaignsService.getCampaignProspects(campaignId);
      setProspects(data || []);
    } catch (err) {
      console.error('Error loading prospects:', err);
      setError('Failed to load prospects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProspect = (prospect) => {
    setSelectedProspect(prospect);
    setShowDetailModal(true);
  };

  const handleConvertProspect = (prospect) => {
    setSelectedProspect(prospect);
    setShowConversionDialog(true);
  };

  const handleConversionComplete = async (result) => {
    setShowConversionDialog(false);
    setSelectedProspect(null);
    toast.success('Prospect converted to contact successfully!');

    // Reload prospects to update the list
    await loadProspects();
  };

  const handleUpdateProspect = async (prospectId, updates) => {
    try {
      await campaignsService.updateProspect(prospectId, updates);
      toast.success('Prospect updated successfully!');
      await loadProspects();
    } catch (err) {
      console.error('Error updating prospect:', err);
      toast.error('Failed to update prospect. Please try again.');
    }
  };

  const handleCreateProspect = async (prospectData) => {
    try {
      const newProspect = await campaignsService.createProspect(prospectData);

      // Add the prospect to the campaign's audience
      // This creates the campaign_contact association needed for deal linking
      try {
        await campaignsService.addAudience(campaignId, {
          contact_ids: [],
          prospect_ids: [newProspect.id]
        });
        console.log('✅ Prospect added to campaign audience');
      } catch (audienceError) {
        console.error('⚠️ Failed to add prospect to campaign audience:', audienceError);
        // Continue anyway - prospect was created
      }

      toast.success('Prospect created successfully!');
      await loadProspects();
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating prospect:', err);
      toast.error('Failed to create prospect. Please try again.');
      throw err; // Re-throw to keep the form open
    }
  };

  const handleCreateDeal = (prospect) => {
    setSelectedProspect(prospect);
    setShowCreateDealDialog(true);
  };

  const handleDealCreated = async (deal) => {
    console.log('Deal created:', deal);
    await loadProspects(); // Reload to update any prospect data
  };

  const handleDeleteProspect = async (prospect) => {
    if (!window.confirm(`Are you sure you want to delete ${prospect.first_name} ${prospect.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await campaignsService.deleteProspect(prospect.id);
      toast.success('Prospect deleted successfully!');
      await loadProspects();
    } catch (err) {
      console.error('Error deleting prospect:', err);
      toast.error('Failed to delete prospect. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    return prospectStatuses.find(s => s.value === normalizedStatus)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    return prospectStatuses.find(s => s.value === normalizedStatus)?.label || status;
  };

  // Filter prospects
  const filteredProspects = prospects.filter(prospect => {
    const normalizedStatus = (prospect.status || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
    const matchesSearch = !searchQuery ||
      (prospect.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prospect.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prospect.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prospect.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading prospects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <p className="text-error mb-4">{error}</p>
        <button onClick={loadProspects} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Campaign Prospects</h3>
          <p className="text-sm text-text-secondary">
            {filteredProspects.length} prospect{filteredProspects.length !== 1 ? 's' : ''}
            {(statusFilter !== 'all' || searchQuery) && ` (${prospects.length} total)`}
          </p>
        </div>
        {hasAnyPermission(['prospects.create']) && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="UserPlus" size={16} />
            <span>Add Prospect</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Icon
            name="Search"
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search prospects by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-tertiary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({prospects.length})
          </button>
          {prospectStatuses.map(status => {
            const count = prospects.filter(p => (p.status || '').toLowerCase() === status.value).length;
            return (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === status.value
                    ? 'bg-primary text-white'
                    : `${status.color} hover:opacity-80`
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Prospects List */}
      {filteredProspects.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Icon name="Users" size={48} className="text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {statusFilter === 'all' && !searchQuery
              ? 'No prospects yet'
              : 'No prospects found'}
          </h3>
          <p className="text-text-secondary">
            {statusFilter === 'all' && !searchQuery
              ? 'Prospects from this campaign will appear here'
              : 'Try adjusting your filters or search query'}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Prospect
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Lead Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredProspects.map((prospect) => (
                  <tr
                    key={prospect.id}
                    className="hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
                    onClick={() => handleViewProspect(prospect)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {(prospect.first_name?.[0] || '') + (prospect.last_name?.[0] || '')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {prospect.first_name} {prospect.last_name}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            ID: {prospect.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {prospect.email && (
                          <div className="flex items-center space-x-2 text-text-secondary">
                            <Icon name="Mail" size={14} />
                            <span>{prospect.email}</span>
                          </div>
                        )}
                        {prospect.phone && (
                          <div className="flex items-center space-x-2 text-text-secondary mt-1">
                            <Icon name="Phone" size={14} />
                            <span>{prospect.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {prospect.company_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prospect.status)}`}>
                        {getStatusLabel(prospect.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              prospect.lead_score >= 75
                                ? 'bg-green-500'
                                : prospect.lead_score >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${prospect.lead_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {prospect.lead_score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {prospect.source || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Create Deal Button - Only for converted prospects */}
                        {(prospect.status || '').toLowerCase() === 'converted' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateDeal(prospect);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
                            title="Create deal from this prospect"
                          >
                            <Icon name="DollarSign" size={16} />
                          </button>
                        )}

                        {/* Convert Button */}
                        {(prospect.status || '').toLowerCase() !== 'converted' && hasAnyPermission(['prospects.convert']) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConvertProspect(prospect);
                            }}
                            className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                            title="Convert to contact"
                          >
                            <Icon name="UserPlus" size={16} />
                          </button>
                        )}

                        {/* View Details Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProspect(prospect);
                          }}
                          className="p-2 text-text-secondary hover:bg-surface-hover rounded-lg transition-colors duration-150"
                          title="View details"
                        >
                          <Icon name="Eye" size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProspect(prospect);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                          title="Delete prospect"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prospect Detail Modal */}
      {showDetailModal && selectedProspect && (
        <ProspectDetailModal
          prospect={selectedProspect}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProspect(null);
          }}
          onUpdate={handleUpdateProspect}
          onConvert={() => {
            setShowDetailModal(false);
            setShowConversionDialog(true);
          }}
        />
      )}

      {/* Prospect Conversion Dialog */}
      {showConversionDialog && selectedProspect && (
        <ProspectConversionDialog
          prospect={selectedProspect}
          onClose={() => {
            setShowConversionDialog(false);
            setSelectedProspect(null);
          }}
          onConvert={handleConversionComplete}
        />
      )}

      {/* Create Prospect Form */}
      {showCreateForm && (
        <ProspectForm
          campaignId={campaignId}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateProspect}
        />
      )}

      {/* Create Deal From Prospect Dialog */}
      {showCreateDealDialog && selectedProspect && (
        <CreateDealFromProspectDialog
          prospect={selectedProspect}
          campaignId={campaignId}
          onClose={() => {
            setShowCreateDealDialog(false);
            setSelectedProspect(null);
          }}
          onSuccess={handleDealCreated}
        />
      )}
    </div>
  );
};

export default ProspectsTab;
