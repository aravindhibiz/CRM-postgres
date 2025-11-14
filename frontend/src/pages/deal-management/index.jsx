import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import Pagination from 'components/Pagination';
import { configService } from '../../services/configService';

import DealForm from './components/DealForm';
import DealDetailView from './components/DealDetailView';
import DocumentsSection from './components/DocumentsSection';
import DealsGridView from './components/DealsGridView';
import ExportDealsModal from '../sales-dashboard/components/ExportDealsModal';

import { dealsService } from '../../services/dealsService';
import { contactsService } from '../../services/contactsService';
import { companiesService } from '../../services/companiesService';
import { dealDocumentsService } from '../../services/dealDocumentsService';
import { dealActivitiesService } from '../../services/dealActivitiesService';

const DealManagement = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission, hasAnyPermission } = useAuth();
  
  // State management
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [allDeals, setAllDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const [isGridView, setIsGridView] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // New state for view mode
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Error and UI states
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Filter state
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Real-time subscription channels
  const [activityChannel, setActivityChannel] = useState(null);
  const [documentChannel, setDocumentChannel] = useState(null);

  // Deal stages and sales reps configuration
  const stages = [
    { value: "lead", label: "Lead", color: "bg-gray-100 text-gray-800" },
    { value: "qualified", label: "Qualified", color: "bg-blue-100 text-blue-800" },
    { value: "proposal", label: "Proposal", color: "bg-yellow-100 text-yellow-800" },
    { value: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800" },
    { value: "closed_won", label: "Closed Won", color: "bg-green-100 text-green-800" },
    { value: "closed_lost", label: "Closed Lost", color: "bg-red-100 text-red-800" }
  ];

  // Filter deals based on selected stage and search query
  const filteredDeals = allDeals.filter(deal => {
    // Stage filter
    const matchesStage = selectedStageFilter === 'all' || deal.stage === selectedStageFilter;
    
    // Search filter
    const matchesSearch = !searchQuery || 
      (deal.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStage && matchesSearch;
  });

  // Sort deals
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
        break;
      case 'value':
        aValue = a.value || 0;
        bValue = b.value || 0;
        break;
      case 'probability':
        aValue = a.probability || 0;
        bValue = b.probability || 0;
        break;
      case 'created_at':
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
        break;
      case 'stage':
        const stageOrder = { lead: 1, qualified: 2, proposal: 3, negotiation: 4, closed_won: 5, closed_lost: 6 };
        aValue = stageOrder[a.stage] || 0;
        bValue = stageOrder[b.stage] || 0;
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
  const totalItems = sortedDeals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeals = sortedDeals.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStageFilter, searchQuery]);

  // Handle pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Load initial data
  useEffect(() => {
    
    if (!user) return;
    
    const loadInitialData = async () => {
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Load all deals, contacts and companies in parallel
        const [dealsData, contactsData, companiesData] = await Promise.all([
          dealsService?.getUserDeals(),
          contactsService?.getUserContacts(),
          companiesService?.getAllCompanies()
        ]);
        
        
        
        setAllDeals(dealsData || []);
        setContacts(contactsData || []);
        setCompanies(companiesData || []);
        
        // Handle specific deal ID in URL
        if (dealId && dealId !== 'new') {

          setIsListView(false);
          setIsViewMode(true); // Start in view mode
          setShowForm(false);
          await loadDeal(dealId);
        } else if (dealId === 'new') {

          setIsListView(false);
          setIsViewMode(false);
          setShowForm(true);
          setSelectedDeal(null);
        } else {

          setIsListView(true);
          setIsViewMode(false);
          setShowForm(false);
        }
        
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
        
      }
    };

    loadInitialData();
  }, [dealId, user]);

  // Load specific deal data
  const loadDeal = async (id) => {
    try {
      const dealData = await dealsService?.getDealById(id);
      if (!dealData) {
        setError('Deal not found');
        setIsLoading(false);
        return;
      }
      
      setSelectedDeal(dealData);
      
      // Load activities and documents in parallel
      await Promise.all([
        loadActivities(id),
        loadDocuments(id)
      ]);
      
      // Set up real-time subscriptions
      setupRealtimeSubscriptions(id);
      
    } catch (err) {
      console.error('Error loading deal:', err);
      
      // Handle specific error cases with more precise detection
      if (err?.code === 'PGRST116' || err?.message?.includes('not found')) {
        setError('Deal not found. It may have been deleted or you may not have permission to view it.');
      } else if (err?.message?.toLowerCase().includes('permission') || err?.message?.toLowerCase().includes('policy')) {
        setError('Permission denied. You may not have access to view this deal.');
      } else if (err?.message?.includes('company') || err?.message?.includes('schema cache')) {
        setError('Could not load deal information. Please check your database connection and try refreshing the page.');
      } 
    } finally {
      setIsLoading(false);
    }
  };

  // Load deal activities
  const loadActivities = async (id) => {
    setIsLoadingActivities(true);
    try {
      const activitiesData = await dealActivitiesService?.getDealActivities(id);
      setActivities(activitiesData || []);
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Load deal documents
  const loadDocuments = async (id) => {
    setIsLoadingDocuments(true);
    try {
      const documentsData = await dealDocumentsService?.getDealDocuments(id);
      setDocuments(documentsData || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Set up real-time subscriptions
  const setupRealtimeSubscriptions = (id) => {
    // Subscribe to activity changes
    const activitySub = dealActivitiesService?.subscribeToActivityChanges(id, (payload) => {
      handleActivityChange(payload);
    });
    setActivityChannel(activitySub);

    // Subscribe to document changes
    const documentSub = dealDocumentsService?.subscribeToDocumentChanges(id, (payload) => {
      handleDocumentChange(payload);
    });
    setDocumentChannel(documentSub);
  };

  // Handle real-time activity changes
  const handleActivityChange = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setActivities(prev => {
      switch (eventType) {
        case 'INSERT':
          // Transform new record for UI
          const newActivity = {
            id: newRecord?.id,
            type: newRecord?.type,
            title: newRecord?.subject,
            description: newRecord?.description,
            timestamp: newRecord?.created_at,
            user: 'Unknown User', // Will be populated by reload
            dealId: newRecord?.deal_id
          };
          return [newActivity, ...prev];
          
        case 'DELETE':
          return prev?.filter(activity => activity?.id !== oldRecord?.id);
          
        case 'UPDATE':
          return prev?.map(activity => 
            activity?.id === newRecord?.id 
              ? { ...activity, ...newRecord }
              : activity
          );
          
        default:
          return prev;
      }
    });
  }, []);

  // Handle real-time document changes
  const handleDocumentChange = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setDocuments(prev => {
      switch (eventType) {
        case 'INSERT':
          // Transform new record for UI
          const newDocument = {
            id: newRecord?.id,
            name: newRecord?.name,
            size: dealDocumentsService?.formatFileSize(newRecord?.file_size),
            type: dealDocumentsService?.getFileExtension(newRecord?.name),
            uploadedAt: newRecord?.created_at,
            uploadedBy: 'Unknown User', // Will be populated by reload
            dealId: newRecord?.deal_id,
            fileUrl: newRecord?.file_url
          };
          return [newDocument, ...prev];
          
        case 'DELETE':
          return prev?.filter(doc => doc?.id !== oldRecord?.id);
          
        default:
          return prev;
      }
    });
  }, []);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (activityChannel) {
        dealActivitiesService?.unsubscribeFromActivityChanges(activityChannel);
      }
      if (documentChannel) {
        dealDocumentsService?.unsubscribeFromDocumentChanges(documentChannel);
      }
    };
  }, [activityChannel, documentChannel]);

  // Handle creating new deal
  const handleCreateNewDeal = () => {
    setSelectedDeal(null);
    setShowForm(true);
    setIsListView(false);
    navigate('/deal-management/new');
  };

  // Handle viewing deal details
  const handleViewDeal = async (deal) => {
    setIsViewMode(true);
    setShowForm(false);
    setIsListView(false);
    navigate(`/deal-management/${deal.id}`);

    // Fetch full deal data including custom fields
    try {
      const fullDealData = await dealsService?.getDealById(deal.id);
      setSelectedDeal(fullDealData);
    } catch (err) {
      console.error('Error loading full deal data:', err);
      // Fallback to the deal from list if fetch fails
      setSelectedDeal(deal);
    }
  };

  // Handle editing existing deal
  const handleEditDeal = () => {
    setIsViewMode(false);
    setShowForm(true);
  };

  // Handle going back to list view
  const handleBackToList = () => {
    setShowForm(false);
    setIsViewMode(false);
    setIsListView(true);
    setSelectedDeal(null);
    setError(null);
    navigate('/deal-management');
    // No need to refresh deals list since we update state immediately
  };

  // Load all deals
  const loadAllDeals = async () => {
    try {
      const dealsData = await dealsService?.getUserDeals();
      setAllDeals(dealsData || []);
    } catch (err) {
      console.error('Error loading deals:', err);
    }
  };

  // Handle saving deal (create or update)
  const handleSaveDeal = async (dealData) => {
    if (!user?.id) {
      setError('You must be logged in to save deals');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      let result;
      
      if (selectedDeal?.id) {
        // Update existing deal 
        result = await dealsService?.updateDeal(selectedDeal?.id, {
          ...dealData,
          owner_id: user?.id
        });
        
        if (result) {
          setSelectedDeal(result);
          // Update in deals list
          setAllDeals(prev => prev.map(deal => 
            deal.id === result.id ? result : deal
          ));
          
          // Show success toast
          toast.success(`Deal "${result.name || 'Untitled Deal'}" updated successfully!`);
        }
      } else {
        // Create new deal
        result = await dealsService?.createDeal({
          ...dealData,
          owner_id: user?.id
        });
        
        if (result?.id) {
          // Show success toast
          toast.success(`Deal "${dealData.name || 'Untitled Deal'}" created successfully!`);
          
          // Add to local state immediately for better UX
          setAllDeals(prev => [result, ...prev]);
        } else {
          throw new Error('Deal created but no ID returned');
        }
      }
      
      // If we get here, everything was successful
      setIsSaving(false);

      // Navigate back to list after successful creation or update
      handleBackToList();
      
    } catch (err) {
      console.error('Error saving deal:', err);
      
      // Handle specific error cases with more precise error detection
      if (err?.code === '23503') { // Foreign key violation
        const errorMsg = 'The selected company or contact is no longer available. Please refresh the page and select valid options.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err?.code === 'PGRST116' || err?.message?.includes('not found')) {
        const errorMsg = 'Deal not found. It may have been deleted by another user.';
        setError(errorMsg);
        toast.error(errorMsg);
        navigate('/deal-management');
        return;
      } else if (err?.message?.toLowerCase().includes('permission') || err?.message?.toLowerCase().includes('policy')) {
        const errorMsg = 'Permission denied. You may not have access to modify this deal.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err?.message?.includes('company') || err?.message?.includes('schema cache')) {
        const errorMsg = 'There was an issue accessing company information. Please refresh the page and try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = err?.message || 'Failed to save deal. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
      
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting deal
  const handleDeleteDeal = async () => {
    if (!selectedDeal?.id || !user?.id) return;
    
    try {
      await dealsService?.deleteDeal(selectedDeal?.id);
      
      // Show success toast
      toast.success(`Deal "${selectedDeal.name || 'Untitled Deal'}" deleted successfully!`);
      
      // Remove from local state
      setAllDeals(prev => prev.filter(deal => deal.id !== selectedDeal.id));
      
      navigate('/deal-management');
    } catch (err) {
      console.error('Error deleting deal:', err);
      const errorMsg = 'Failed to delete deal. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setShowDeleteModal(false);
  };

  // Handle cloning deal
  const handleCloneDeal = async () => {
    if (!selectedDeal || !user?.id) return;
    
    try {
      const clonedDealData = {
        name: `${selectedDeal?.name} (Copy)`,
        description: selectedDeal?.description,
        value: selectedDeal?.value,
        stage: 'lead',
        probability: 10,
        contact_id: selectedDeal?.contact_id,
        company_id: selectedDeal?.company_id,
        lead_source: selectedDeal?.lead_source,
        owner_id: user?.id
      };
      
      let result = await dealsService?.createDeal(clonedDealData);
      if (result?.id) {
        // Show success toast
        toast.success(`Deal "${clonedDealData.name}" cloned successfully!`);
        
        // Add to local state
        setAllDeals(prev => [result, ...prev]);
        
        navigate(`/deal-management/${result?.id}`);
      }
    } catch (err) {
      console.error('Error cloning deal:', err);
      const errorMsg = 'Failed to clone deal. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Handle creating task (placeholder)
  const handleCreateTask = () => {
    // TODO: Implement task creation functionality
    
    // This would typically open a task creation modal
  };

  // Handle export deals
  const handleExportDeals = () => {
    if (filteredDeals.length === 0) {
      setError('No deals to export');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setShowExportModal(true);
  };

  // Handle adding activity
  const handleAddActivity = async (activityData) => {
    if (!selectedDeal?.id) return;
    
    try {
      const newActivity = await dealActivitiesService?.createActivity({
        ...activityData,
        dealId: selectedDeal?.id,
        contactId: selectedDeal?.contact_id
      });
      
      // Optimistically add to local state (real-time subscription will also update)
      setActivities(prev => [newActivity, ...prev]);
      
    } catch (err) {
      console.error('Error adding activity:', err);
      setError('Failed to add activity. Please try again.');
    }
  };

  // Handle deleting activity
  const handleDeleteActivity = async (activityId) => {
    try {
      await dealActivitiesService?.deleteActivity(activityId);
      
      // Optimistically remove from local state
      setActivities(prev => prev?.filter(activity => activity?.id !== activityId));
      
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity. Please try again.');
    }
  };

  // Handle uploading document
  const handleUploadDocument = async (file, documentType = 'other') => {
    if (!selectedDeal?.id) return;
    
    try {
      const newDocument = await dealDocumentsService?.uploadDocument(
        file, 
        selectedDeal?.id, 
        documentType
      );
      
      // Optimistically add to local state
      setDocuments(prev => [newDocument, ...prev]);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      throw err; // Re-throw for component handling
    }
  };

  // Handle deleting document
  const handleDeleteDocument = async (documentId) => {
    try {
      // The delete is already done in the child component
      // Just update the local state
      setDocuments(prev => prev?.filter(doc => doc?.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-14 xs:pt-16 sm:pt-16">
          <div className="px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-text-secondary text-sm xs:text-base">Loading deal...</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  

  if (error && !selectedDeal && !isListView) {

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-14 xs:pt-16 sm:pt-16">
          <div className="px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <div className="hidden sm:block">
                <Breadcrumb />
              </div>
              <div className="text-center py-8 xs:py-12">
                <Icon name="AlertCircle" size={40} className="xs:w-12 xs:h-12 text-text-tertiary mx-auto mb-4" />
                <h2 className="text-lg xs:text-xl font-semibold text-text-primary mb-2">
                  {selectedDeal === null && dealId !== 'new' ? 'Deal Not Found' : 'Error'}
                </h2>
                <p className="text-text-secondary mb-4 xs:mb-6 text-sm xs:text-base px-4">{error}</p>
                <button
                  onClick={() => navigate('/sales-dashboard')}
                  className="btn-primary min-h-touch"
                >
                  Back to Dashboard
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
              <div className="bg-error-50 border border-error-200 text-error p-3 xs:p-4 rounded-lg flex items-center justify-between mb-4 xs:mb-6">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Icon name="AlertCircle" size={20} className="flex-shrink-0" />
                  <span className="text-xs xs:text-sm break-words">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-error hover:text-error-600 min-h-touch min-w-touch flex items-center justify-center -m-1 flex-shrink-0"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 xs:mb-6 sm:mb-8">
              <div className="mb-3 xs:mb-4 lg:mb-0">
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-text-primary mb-1 xs:mb-2">
                  {isListView ? 'Deal Management' : (selectedDeal?.name || 'New Deal')}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 xs:gap-x-4 text-xs xs:text-sm text-text-secondary">
                  {isListView ? (
                    <span className="hidden xs:inline">Manage all your deals</span>
                  ) : (
                    <>
                      {selectedDeal?.id && (
                        <>
                          <span className="hidden sm:inline">Deal ID: #{selectedDeal?.id}</span>
                          <span className="hidden sm:inline">•</span>
                        </>
                      )}
                      {selectedDeal?.created_at && (
                        <>
                          <span>Created: {new Date(selectedDeal.created_at)?.toLocaleDateString()}</span>
                          <span className="hidden xs:inline">•</span>
                        </>
                      )}
                      {selectedDeal?.updated_at && (
                        <span className="hidden xs:inline">Last updated: {new Date(selectedDeal.updated_at)?.toLocaleDateString()}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 xs:space-x-3">
                {isListView ? (
                  <>
                    {/* Export Button - Only for admin and sales_manager */}
                    {hasPermission('deals.export') && (
                      <button
                        onClick={handleExportDeals}
                        disabled={filteredDeals.length === 0}
                        className="flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base"
                        title="Export deals"
                      >
                        <Icon name="Download" size={16} className="flex-shrink-0" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                    )}
                    {hasPermission('deals.create') && (
                      <button
                        onClick={handleCreateNewDeal}
                        className="btn-primary flex items-center space-x-1.5 xs:space-x-2 min-h-touch text-sm xs:text-base"
                      >
                        <Icon name="Plus" size={16} className="flex-shrink-0" />
                        <span className="hidden xs:inline">Create Deal</span>
                        <span className="xs:hidden">Create</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleBackToList}
                    className="btn-secondary flex items-center space-x-1.5 xs:space-x-2 min-h-touch text-sm xs:text-base"
                  >
                    <Icon name="ArrowLeft" size={16} className="flex-shrink-0" />
                    <span className="hidden xs:inline">Back to List</span>
                    <span className="xs:hidden">Back</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            {isListView ? (
              // Deals List View
              <div className="bg-surface rounded-lg border border-border">
                {/* Search Bar */}
                <div className="p-3 xs:p-4 sm:p-6 border-b border-border">
                  <div className="relative">
                    <Icon
                      name="Search"
                      size={18}
                      className="absolute left-2.5 xs:left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary flex-shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Search deals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 xs:pl-10 pr-8 xs:pr-10 py-2 xs:py-2.5 sm:py-3 min-h-touch border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-text-primary placeholder-text-tertiary text-sm xs:text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 xs:right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary min-h-touch min-w-touch flex items-center justify-center -m-1"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 xs:p-4 sm:p-6 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
                    <h2 className="text-base xs:text-lg font-semibold text-text-primary">All Deals</h2>
                    <div className="flex flex-wrap items-center gap-2 xs:gap-3 sm:gap-4">
                      {/* Items per page selector */}
                      <div className="flex items-center space-x-1.5 xs:space-x-2">
                        <span className="text-xs xs:text-sm text-text-secondary whitespace-nowrap">Show:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                          className="text-xs xs:text-sm border border-border rounded-md px-1.5 xs:px-2 py-1 min-h-touch bg-surface"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 xs:p-1">
                        <button
                          onClick={() => setIsGridView(false)}
                          className={`flex items-center space-x-1 px-2 xs:px-3 py-1.5 min-h-touch rounded-md text-xs xs:text-sm font-medium transition-colors ${
                            !isGridView
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Icon name="List" size={16} />
                          <span className="hidden sm:inline">List</span>
                        </button>
                        <button
                          onClick={() => setIsGridView(true)}
                          className={`flex items-center space-x-1 px-2 xs:px-3 py-1.5 min-h-touch rounded-md text-xs xs:text-sm font-medium transition-colors ${
                            isGridView
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Icon name="Grid" size={16} />
                          <span className="hidden sm:inline">Grid</span>
                        </button>
                      </div>
                      <div className="text-xs xs:text-sm text-text-secondary whitespace-nowrap">
                        {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
                        {(selectedStageFilter !== 'all' || searchQuery) && ` (${allDeals.length} total)`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stage Filter */}
                  <div className="mt-3 xs:mt-4">
                    <div className="flex flex-wrap gap-1.5 xs:gap-2 -mx-3 px-3 xs:mx-0 xs:px-0 overflow-x-auto scrollbar-hide">
                      <button
                        onClick={() => setSelectedStageFilter('all')}
                        className={`px-2.5 xs:px-3 py-1.5 min-h-touch text-xs xs:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
                          selectedStageFilter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Stages ({allDeals.length})
                      </button>
                      {stages.map(stage => {
                        const stageCount = allDeals.filter(deal => deal.stage === stage.value).length;
                        return (
                          <button
                            key={stage.value}
                            onClick={() => setSelectedStageFilter(stage.value)}
                            className={`px-2.5 xs:px-3 py-1.5 min-h-touch text-xs xs:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
                              selectedStageFilter === stage.value
                                ? 'bg-primary text-white'
                                : `${stage.color} hover:opacity-80`
                            }`}
                          >
                            {stage.label} ({stageCount})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="p-6 xs:p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary text-sm xs:text-base">Loading deals...</p>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="p-6 xs:p-8 text-center">
                    <Icon name="Package" size={40} className="xs:w-12 xs:h-12 text-text-tertiary mx-auto mb-4" />
                    <h3 className="text-base xs:text-lg font-medium text-text-primary mb-2">
                      {selectedStageFilter === 'all' ? 'No deals yet' : `No deals in ${stages.find(s => s.value === selectedStageFilter)?.label} stage`}
                    </h3>
                    <p className="text-text-secondary mb-4 text-sm xs:text-base">
                      {selectedStageFilter === 'all'
                        ? 'Create your first deal to get started'
                        : 'Try selecting a different stage or create a new deal'
                      }
                    </p>
                    {selectedStageFilter === 'all' && hasPermission('deals.create') && (
                      <button
                        onClick={handleCreateNewDeal}
                        className="btn-primary min-h-touch"
                      >
                        Create Deal
                      </button>
                    )}
                  </div>
                ) : isGridView ? (
                  <div className="p-3 xs:p-4 sm:p-6">
                    <DealsGridView
                      deals={paginatedDeals}
                      stages={stages}
                      onViewDeal={handleViewDeal}
                      onEditDeal={(deal) => {
                        handleViewDeal(deal);
                        setTimeout(() => handleEditDeal(), 100);
                      }}
                      onCloneDeal={(deal) => {
                        setSelectedDeal(deal);
                        handleCloneDeal();
                      }}
                      onDeleteDeal={(deal) => {
                        setSelectedDeal(deal);
                        setShowDeleteModal(true);
                      }}
                    />

                    {/* Pagination for Grid View */}
                    {filteredDeals.length > 0 && (
                      <div className="mt-4 xs:mt-6 pt-4 xs:pt-6 border-t border-border">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={totalItems}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface-hover transition-colors"
                              onClick={() => handleSort('name')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Deal</span>
                                {sortField === 'name' && (
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
                              onClick={() => handleSort('stage')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Stage</span>
                                {sortField === 'stage' && (
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
                              onClick={() => handleSort('value')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Value</span>
                                {sortField === 'value' && (
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
                              onClick={() => handleSort('probability')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Probability</span>
                                {sortField === 'probability' && (
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
                              onClick={() => handleSort('created_at')}
                            >
                              <div className="flex items-center space-x-1">
                                <span>Created</span>
                                {sortField === 'created_at' && (
                                  <Icon 
                                    name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
                                    size={14} 
                                    className="text-primary"
                                  />
                                )}
                              </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border">
                          {paginatedDeals.map((deal) => (
                            <tr
                              key={deal.id}
                              className="hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
                              onClick={() => handleViewDeal(deal)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-text-primary">{deal.name || 'Untitled Deal'}</div>
                                  <div className="text-sm text-text-secondary truncate max-w-xs">{deal.description || 'No description'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  stages.find(s => s.value === deal.stage)?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {stages.find(s => s.value === deal.stage)?.label || deal.stage}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                {formatCurrency(deal.value || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                {deal.probability || 0}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                {new Date(deal.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {/* Edit Icon */}
                                  {hasAnyPermission(['deals.edit_all', 'deals.edit_own']) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDeal(deal);
                                        setTimeout(() => handleEditDeal(), 100);
                                      }}
                                      className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                                      title="Edit deal"
                                    >
                                      <Icon name="Edit" size={16} />
                                    </button>
                                  )}

                                  {/* Clone Icon */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDeal(deal);
                                      handleCloneDeal();
                                    }}
                                    className="p-2 text-text-secondary hover:bg-surface-hover rounded-lg transition-colors duration-150"
                                    title="Clone deal"
                                  >
                                    <Icon name="Copy" size={16} />
                                  </button>

                                  {/* Delete Icon */}
                                  {hasAnyPermission(['deals.delete_all', 'deals.delete_own']) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDeal(deal);
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-2 text-error hover:bg-error-50 rounded-lg transition-colors duration-150"
                                      title="Delete deal"
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

                    {/* Mobile Card View */}
                    <div className="md:hidden p-3 xs:p-4">
                      <div className="space-y-3">
                        {paginatedDeals.map((deal) => (
                          <div
                            key={deal.id}
                            className="bg-surface rounded-lg border border-border p-3 xs:p-4"
                            onClick={() => handleViewDeal(deal)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm xs:text-base font-medium text-text-primary truncate mb-1">
                                  {deal.name || 'Untitled Deal'}
                                </h3>
                                <p className="text-xs xs:text-sm text-text-secondary line-clamp-2 mb-2">
                                  {deal.description || 'No description'}
                                </p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                  stages.find(s => s.value === deal.stage)?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {stages.find(s => s.value === deal.stage)?.label || deal.stage}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-3 text-xs xs:text-sm">
                              <div>
                                <span className="text-text-tertiary">Value:</span>
                                <span className="ml-1 text-text-primary font-medium">{formatCurrency(deal.value || 0)}</span>
                              </div>
                              <div>
                                <span className="text-text-tertiary">Probability:</span>
                                <span className="ml-1 text-text-primary font-medium">{deal.probability || 0}%</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-text-tertiary">Created:</span>
                                <span className="ml-1 text-text-primary">{new Date(deal.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-3 border-t border-border">
                              {hasAnyPermission(['deals.edit_all', 'deals.edit_own']) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDeal(deal);
                                    setTimeout(() => handleEditDeal(), 100);
                                  }}
                                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 min-h-touch text-xs xs:text-sm text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                                >
                                  <Icon name="Edit" size={14} />
                                  <span>Edit</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDeal(deal);
                                  handleCloneDeal();
                                }}
                                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 min-h-touch text-xs xs:text-sm text-text-secondary bg-surface-hover hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <Icon name="Copy" size={14} />
                                <span>Clone</span>
                              </button>
                              {hasAnyPermission(['deals.delete_all', 'deals.delete_own']) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDeal(deal);
                                    setShowDeleteModal(true);
                                  }}
                                  className="flex items-center justify-center px-3 py-2 min-h-touch min-w-touch text-error bg-error-50 hover:bg-error-100 rounded-lg transition-colors"
                                >
                                  <Icon name="Trash2" size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pagination for List View */}
                    {filteredDeals.length > 0 && (
                      <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-t border-border">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={totalItems}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Deal Detail/Form View - Show loading, detail view, or form
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xs:gap-6 sm:gap-8">
                {/* Left Panel - Deal Detail or Form */}
                <div className="xl:col-span-8">
                  {isLoading ? (
                    <div className="bg-surface rounded-lg border border-border p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Loading deal...</p>
                      </div>
                    </div>
                  ) : isViewMode ? (
                    <DealDetailView
                      deal={selectedDeal}
                      contacts={contacts}
                      companies={companies}
                      stages={stages}
                      onEdit={hasAnyPermission(['deals.edit_all', 'deals.edit_own']) ? handleEditDeal : null}
                    />
                  ) : (
                    <DealForm
                      deal={selectedDeal}
                      contacts={contacts}
                      companies={companies}
                      stages={stages}
                      onSubmit={handleSaveDeal}
                      onCancel={handleBackToList}
                      isSaving={isSaving}
                    />
                  )}
                </div>

                {/* Right Panel - Documents */}
                {!isLoading && (
                  <div className="xl:col-span-4 space-y-6">
                    <DocumentsSection
                      documents={documents}
                      loading={isLoadingDocuments}
                      dealId={selectedDeal?.id}
                      onUploadDocument={isViewMode ? null : handleUploadDocument}
                      onDeleteDocument={isViewMode ? null : handleDeleteDocument}
                      readOnly={isViewMode}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 xs:p-4">
          <div className="bg-surface rounded-lg p-4 xs:p-6 max-w-md w-full">
            <div className="flex items-center space-x-2 xs:space-x-3 mb-3 xs:mb-4">
              <div className="w-10 h-10 bg-error-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <h3 className="text-base xs:text-lg font-semibold text-text-primary">Delete Deal</h3>
            </div>

            <p className="text-text-secondary mb-4 xs:mb-6 text-sm xs:text-base">
              Are you sure you want to delete "{selectedDeal?.name}"? This action cannot be undone.
            </p>

            <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 min-h-touch border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150 text-sm xs:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeal}
                className="flex-1 px-4 py-2 min-h-touch bg-error text-white rounded-lg hover:bg-error-600 transition-colors duration-150 text-sm xs:text-base"
              >
                Delete Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportDealsModal
          deals={filteredDeals}
          onClose={() => setShowExportModal(false)}
          filters={{
            stage: selectedStageFilter !== 'all' ? selectedStageFilter : null
          }}
        />
      )}
    </div>
  );
};

export default DealManagement;