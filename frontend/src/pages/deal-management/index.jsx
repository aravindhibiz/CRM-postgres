import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';

import DealForm from './components/DealForm';
import ActivityTimeline from './components/ActivityTimeline';
import DocumentsSection from './components/DocumentsSection';
import DealActions from './components/DealActions';
import DealsGridView from './components/DealsGridView';

import dealsService from '../../services/dealsService';
import contactsService from '../../services/contactsService';
import companiesService from '../../services/companiesService';
import dealActivitiesService from '../../services/dealActivitiesService';
import dealDocumentsService from '../../services/dealDocumentsService';

const DealManagement = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Error and UI states
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filter state
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  
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

  // Filter deals based on selected stage
  const filteredDeals = selectedStageFilter === 'all' 
    ? allDeals 
    : allDeals.filter(deal => deal.stage === selectedStageFilter);

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
          setShowForm(true);
          await loadDeal(dealId);
        } else if (dealId === 'new') {
          
          setIsListView(false);
          setShowForm(true);
          setSelectedDeal(null);
        } else {
          
          setIsListView(true);
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
      } else {
        setError('Failed to load deal. Please try again.');
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

  // Handle editing existing deal
  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
    setIsListView(false);
    navigate(`/deal-management/${deal.id}`);
  };

  // Handle going back to list view
  const handleBackToList = () => {
    setShowForm(false);
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
      if (!selectedDeal?.id) {
        // For new deals, navigate back to list after successful creation
        setIsSaving(false);
        handleBackToList();
        return;
      }
      
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
  const handleDeleteDocument = async (documentId, filePath) => {
    try {
      await dealDocumentsService?.deleteDocument(documentId, filePath);
      
      // Optimistically remove from local state
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
        <main className="pt-16">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-text-secondary">Loading deal...</span>
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
        <main className="pt-16">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
              <div className="text-center py-12">
                <Icon name="AlertCircle" size={48} className="text-text-tertiary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  {selectedDeal === null && dealId !== 'new' ? 'Deal Not Found' : 'Error'}
                </h2>
                <p className="text-text-secondary mb-6">{error}</p>
                <button
                  onClick={() => navigate('/sales-dashboard')}
                  className="btn-primary"
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
      <main className="pt-16">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            
            {/* Error Alert */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={20} />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-error hover:text-error-600"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  {isListView ? 'Deal Management' : (selectedDeal?.name || 'New Deal')}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  {isListView ? (
                    <span>Manage all your deals</span>
                  ) : (
                    <>
                      {selectedDeal?.id && (
                        <>
                          <span>Deal ID: #{selectedDeal?.id}</span>
                          <span>•</span>
                        </>
                      )}
                      {selectedDeal?.created_at && (
                        <>
                          <span>Created: {new Date(selectedDeal.created_at)?.toLocaleDateString()}</span>
                          <span>•</span>
                        </>
                      )}
                      {selectedDeal?.updated_at && (
                        <span>Last updated: {new Date(selectedDeal.updated_at)?.toLocaleDateString()}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isListView ? (
                  <button
                    onClick={handleCreateNewDeal}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Icon name="Plus" size={16} />
                    <span>Create Deal</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBackToList}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Icon name="ArrowLeft" size={16} />
                      <span>Back to List</span>
                    </button>
                    {selectedDeal?.id && (
                      <DealActions
                        onSave={() => handleSaveDeal(selectedDeal)}
                        onDelete={() => setShowDeleteModal(true)}
                        onClone={handleCloneDeal}
                        onCreateTask={handleCreateTask}
                        isSaving={isSaving}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Main Content */}
            {isListView ? (
              // Deals List View
              <div className="bg-surface rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">All Deals</h2>
                    <div className="flex items-center space-x-4">
                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setIsGridView(false)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            !isGridView
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon name="List" size={16} />
                          <span>List</span>
                        </button>
                        <button
                          onClick={() => setIsGridView(true)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            isGridView
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon name="Grid" size={16} />
                          <span>Grid</span>
                        </button>
                      </div>
                      <div className="text-sm text-text-secondary">
                        {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} 
                        {selectedStageFilter !== 'all' && ` (${allDeals.length} total)`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stage Filter */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedStageFilter('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading deals...</p>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon name="Package" size={48} className="text-text-tertiary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      {selectedStageFilter === 'all' ? 'No deals yet' : `No deals in ${stages.find(s => s.value === selectedStageFilter)?.label} stage`}
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {selectedStageFilter === 'all' 
                        ? 'Create your first deal to get started'
                        : 'Try selecting a different stage or create a new deal'
                      }
                    </p>
                    {selectedStageFilter === 'all' && (
                      <button
                        onClick={handleCreateNewDeal}
                        className="btn-primary"
                      >
                        Create Deal
                      </button>
                    )}
                  </div>
                ) : isGridView ? (
                  <div className="p-6">
                    <DealsGridView
                      deals={filteredDeals}
                      stages={stages}
                      onEditDeal={handleEditDeal}
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Deal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Stage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Probability</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-border">
                        {filteredDeals.map((deal) => (
                          <tr key={deal.id} className="hover:bg-gray-50">
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
                              ${(deal.value || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                              {deal.probability || 0}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              {new Date(deal.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditDeal(deal)}
                                className="text-primary hover:text-primary-600 mr-3"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              // Deal Form View - Show loading or form
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Panel - Deal Form */}
                <div className="xl:col-span-8">
                  {isLoading ? (
                    <div className="bg-surface rounded-lg border border-border p-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Loading deal form...</p>
                      </div>
                    </div>
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

                {/* Right Panel - Activity & Documents */}
                {selectedDeal?.id && !isLoading && (
                  <div className="xl:col-span-4 space-y-6">
                    <ActivityTimeline
                      activities={activities}
                      loading={isLoadingActivities}
                      contact={selectedDeal?.contact}
                      onAddActivity={handleAddActivity}
                      onDeleteActivity={handleDeleteActivity}
                    />
                    
                    <DocumentsSection
                      documents={documents}
                      loading={isLoadingDocuments}
                      dealId={selectedDeal?.id}
                      onUploadDocument={handleUploadDocument}
                      onDeleteDocument={handleDeleteDocument}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error-50 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Delete Deal</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{selectedDeal?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeal}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error-600 transition-colors duration-150"
              >
                Delete Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealManagement;