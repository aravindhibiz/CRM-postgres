import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import Pagination from 'components/Pagination';

import CampaignsList from './components/CampaignsList';
import CampaignDetail from './components/CampaignDetail';
import CampaignForm from './components/CampaignForm';

import { campaignsService } from '../../services/campaignsService';

const CampaignManagement = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission, hasAnyPermission } = useAuth();

  // State management
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Error and UI states
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filter state
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Campaign status options
  const campaignStatuses = [
    { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
    { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "paused", label: "Paused", color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "Completed", color: "bg-purple-100 text-purple-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" }
  ];

  // Campaign types
  const campaignTypes = [
    { value: "email", label: "Email", icon: "Mail" },
    { value: "web_form", label: "Web Form", icon: "Globe" },
    { value: "phone", label: "Phone", icon: "Phone" },
    { value: "social_media", label: "Social Media", icon: "Share2" },
    { value: "manual_entry", label: "Manual Entry", icon: "Edit" }
  ];

  // Filter campaigns based on selected filters and search query
  const filteredCampaigns = (Array.isArray(allCampaigns) ? allCampaigns : []).filter(campaign => {
    // Status filter
    const matchesStatus = selectedStatusFilter === 'all' || campaign.status === selectedStatusFilter;

    // Type filter
    const matchesType = selectedTypeFilter === 'all' || campaign.type === selectedTypeFilter;

    // Search filter
    const matchesSearch = !searchQuery ||
      (campaign.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
        break;
      case 'start_date':
        aValue = new Date(a.start_date || 0).getTime();
        bValue = new Date(b.start_date || 0).getTime();
        break;
      case 'budget':
        aValue = a.budget || 0;
        bValue = b.budget || 0;
        break;
      case 'created_at':
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Pagination calculations
  const totalItems = sortedCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = sortedCampaigns.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatusFilter, selectedTypeFilter, searchQuery]);

  // Handle pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const campaignsData = await campaignsService.getCampaigns();
        setAllCampaigns(Array.isArray(campaignsData) ? campaignsData : []);

        // Handle specific campaign ID in URL
        if (campaignId && campaignId !== 'new') {
          setIsListView(false);
          setIsViewMode(true);
          setShowForm(false);
          await loadCampaign(campaignId);
        } else if (campaignId === 'new') {
          setIsListView(false);
          setIsViewMode(false);
          setShowForm(true);
          setSelectedCampaign(null);
        } else {
          setIsListView(true);
          setIsViewMode(false);
          setShowForm(false);
        }

      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data. Please refresh the page.');
        setAllCampaigns([]); // Ensure it's always an array
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [campaignId, user]);

  // Load specific campaign data
  const loadCampaign = async (id) => {
    try {
      const campaignData = await campaignsService.getCampaignById(id);
      if (!campaignData) {
        setError('Campaign not found');
        setIsLoading(false);
        return;
      }

      setSelectedCampaign(campaignData);

    } catch (err) {
      console.error('Error loading campaign:', err);
      setError('Failed to load campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating new campaign
  const handleCreateNewCampaign = () => {
    setSelectedCampaign(null);
    setShowForm(true);
    setIsListView(false);
    navigate('/campaign-management/new');
  };

  // Handle viewing campaign details
  const handleViewCampaign = async (campaign) => {
    setIsViewMode(true);
    setShowForm(false);
    setIsListView(false);
    navigate(`/campaign-management/${campaign.id}`);

    try {
      const fullCampaignData = await campaignsService.getCampaignById(campaign.id);
      setSelectedCampaign(fullCampaignData);
    } catch (err) {
      console.error('Error loading full campaign data:', err);
      setSelectedCampaign(campaign);
    }
  };

  // Handle editing existing campaign
  const handleEditCampaign = () => {
    setIsViewMode(false);
    setShowForm(true);
  };

  // Handle going back to list view
  const handleBackToList = () => {
    setShowForm(false);
    setIsViewMode(false);
    setIsListView(true);
    setSelectedCampaign(null);
    setError(null);
    navigate('/campaign-management');
  };

  // Handle saving campaign (create or update)
  const handleSaveCampaign = async (campaignData) => {
    if (!user?.id) {
      setError('You must be logged in to save campaigns');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;

      if (selectedCampaign?.id) {
        // Update existing campaign
        result = await campaignsService.updateCampaign(selectedCampaign.id, {
          ...campaignData,
          owner_id: user.id
        });

        if (result) {
          setSelectedCampaign(result);
          setAllCampaigns(prev => prev.map(campaign =>
            campaign.id === result.id ? result : campaign
          ));

          toast.success(`Campaign "${result.name}" updated successfully!`);
        }
      } else {
        // Create new campaign
        result = await campaignsService.createCampaign({
          ...campaignData,
          owner_id: user.id
        });

        if (result?.id) {
          toast.success(`Campaign "${campaignData.name}" created successfully!`);
          setAllCampaigns(prev => [result, ...prev]);
        } else {
          throw new Error('Campaign created but no ID returned');
        }
      }

      setIsSaving(false);
      handleBackToList();

    } catch (err) {
      console.error('Error saving campaign:', err);
      const errorMsg = err?.message || 'Failed to save campaign. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting campaign
  const handleDeleteCampaign = async () => {
    if (!selectedCampaign?.id || !user?.id) return;

    try {
      await campaignsService.deleteCampaign(selectedCampaign.id);

      toast.success(`Campaign "${selectedCampaign.name}" deleted successfully!`);

      setAllCampaigns(prev => prev.filter(campaign => campaign.id !== selectedCampaign.id));

      navigate('/campaign-management');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      const errorMsg = 'Failed to delete campaign. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setShowDeleteModal(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-text-secondary">Loading campaigns...</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error && !selectedCampaign && !isListView) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
              <div className="text-center py-12">
                <Icon name="AlertCircle" size={48} className="text-text-tertiary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  {selectedCampaign === null && campaignId !== 'new' ? 'Campaign Not Found' : 'Error'}
                </h2>
                <p className="text-text-secondary mb-6">{error}</p>
                <button
                  onClick={() => navigate('/campaign-management')}
                  className="btn-primary"
                >
                  Back to Campaigns
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 xs:pt-16 sm:pt-16">
        <div className="px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="hidden sm:block">
              <Breadcrumb />
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error p-3 xs:p-4 rounded-lg flex items-start xs:items-center justify-between mb-4 xs:mb-6 gap-2">
                <div className="flex items-start xs:items-center space-x-2 flex-1 min-w-0">
                  <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5 xs:mt-0" />
                  <span className="text-sm xs:text-base break-words">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-error hover:text-error-600 flex-shrink-0 min-h-touch min-w-touch flex items-center justify-center -m-1"
                  aria-label="Close error"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 xs:mb-6 sm:mb-8 gap-3 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-text-primary mb-1 xs:mb-2 truncate">
                  {isListView ? 'Campaign Management' : (selectedCampaign?.name || 'New Campaign')}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 xs:gap-x-4 gap-y-1 text-xs xs:text-sm text-text-secondary">
                  {isListView ? (
                    <span>Manage all your marketing campaigns</span>
                  ) : (
                    <>
                      {selectedCampaign?.id && (
                        <>
                          <span className="hidden xs:inline">Campaign ID: #{selectedCampaign.id.slice(0, 8)}</span>
                          <span className="xs:inline hidden xs:inline">•</span>
                        </>
                      )}
                      {selectedCampaign?.created_at && (
                        <>
                          <span className="hidden sm:inline">Created: {new Date(selectedCampaign.created_at).toLocaleDateString()}</span>
                          <span className="hidden sm:inline">•</span>
                        </>
                      )}
                      {selectedCampaign?.updated_at && (
                        <span className="hidden sm:inline">Last updated: {new Date(selectedCampaign.updated_at).toLocaleDateString()}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 xs:space-x-3 flex-shrink-0 w-full sm:w-auto">
                {isListView ? (
                  <>
                    {hasPermission('campaigns.create') && (
                      <button
                        onClick={handleCreateNewCampaign}
                        className="btn-primary flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch text-sm xs:text-base flex-1 sm:flex-initial justify-center"
                      >
                        <Icon name="Plus" size={16} />
                        <span className="hidden xs:inline">Create Campaign</span>
                        <span className="xs:hidden">Create</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleBackToList}
                    className="btn-secondary flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch text-sm xs:text-base"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    <span>Back to List</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            {isListView ? (
              <CampaignsList
                campaigns={paginatedCampaigns}
                allCampaigns={allCampaigns}
                statuses={campaignStatuses}
                types={campaignTypes}
                selectedStatusFilter={selectedStatusFilter}
                selectedTypeFilter={selectedTypeFilter}
                searchQuery={searchQuery}
                sortField={sortField}
                sortDirection={sortDirection}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                totalPages={totalPages}
                onStatusFilterChange={setSelectedStatusFilter}
                onTypeFilterChange={setSelectedTypeFilter}
                onSearchChange={setSearchQuery}
                onSort={handleSort}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onViewCampaign={handleViewCampaign}
                onEditCampaign={(campaign) => {
                  handleViewCampaign(campaign);
                  setTimeout(() => handleEditCampaign(), 100);
                }}
                onDeleteCampaign={(campaign) => {
                  setSelectedCampaign(campaign);
                  setShowDeleteModal(true);
                }}
              />
            ) : (
              <div>
                {isLoading ? (
                  <div className="bg-surface rounded-lg border border-border p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-text-secondary">Loading campaign...</p>
                    </div>
                  </div>
                ) : isViewMode ? (
                  <CampaignDetail
                    campaign={selectedCampaign}
                    statuses={campaignStatuses}
                    types={campaignTypes}
                    onEdit={
                      (hasPermission('campaigns.edit_all') ||
                       (hasPermission('campaigns.edit_own') && selectedCampaign?.owner_id === user?.id))
                        ? handleEditCampaign
                        : null
                    }
                    onDelete={
                      (hasPermission('campaigns.delete_all') ||
                       (hasPermission('campaigns.delete_own') && selectedCampaign?.owner_id === user?.id))
                        ? () => setShowDeleteModal(true)
                        : null
                    }
                  />
                ) : (
                  <CampaignForm
                    campaign={selectedCampaign}
                    types={campaignTypes}
                    statuses={campaignStatuses}
                    onSubmit={handleSaveCampaign}
                    onCancel={handleBackToList}
                    isSaving={isSaving}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error-50 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Delete Campaign</h3>
            </div>

            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{selectedCampaign?.name}"? This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error-600 transition-colors duration-150"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;
