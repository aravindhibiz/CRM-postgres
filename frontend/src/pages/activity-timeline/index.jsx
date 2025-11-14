import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { activitiesService } from '../../services/activitiesService';

import ActivityCard from './components/ActivityCard';
import ActivityFilters from './components/ActivityFilters';
import AddActivityModal from './components/AddActivityModal';
import ActivityInsights from './components/ActivityInsights';
import BulkActionsBar from './components/BulkActionsBar';
import ActivityTemplateModal from './components/ActivityTemplateModal';
import ActivityListView from './components/ActivityListView';
import ActivityCalendar from './components/ActivityCalendar';

const ActivityTimeline = () => {
  const { user, hasAnyPermission } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedFilters, setSelectedFilters] = useState({
    activityType: 'all',
    dateRange: 'all',
    teamMember: 'all',
    channel: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'insights'
  const [displayMode, setDisplayMode] = useState('auto'); // 'auto', 'list', or 'timeline'
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  const loadActivities = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const data = await activitiesService.getUserActivities();
      setActivities(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadActivities();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loadActivities]);

  const handleActivityAdded = (newActivity) => {
    setActivities(prevActivities => [newActivity, ...prevActivities]);
  };

  const handleEditActivity = async (activity) => {
    try {
      // Fetch full activity data with custom fields
      const fullActivity = await activitiesService.getActivityById(activity.id);
      setEditingActivity(fullActivity);
      setIsAddModalOpen(true);
    } catch (err) {
      console.error('Error fetching activity for editing:', err);
      // Fallback to the activity object we have
      setEditingActivity(activity);
      setIsAddModalOpen(true);
    }
  };

  const handleActivityUpdated = (updatedActivity) => {
    setActivities(prevActivities =>
      prevActivities.map(act => act.id === updatedActivity.id ? updatedActivity : act)
    );
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    try {
      await activitiesService.deleteActivity(activityId);
      setActivities(prevActivities => prevActivities.filter(activity => activity.id !== activityId));
      // Clear from selection if it was selected
      setSelectedActivities(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        setShowBulkActions(newSet.size > 0);
        return newSet;
      });
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity. Please try again.');
    }
  };

  const handleBulkAction = async (action, activityIds) => {
    try {
      switch (action) {
        case 'delete':
          // Confirmation dialog for bulk delete
          if (!window.confirm(`Are you sure you want to delete ${activityIds.length} activities? This action cannot be undone.`)) {
            return;
          }
          // Implementation for bulk delete
          await Promise.all(activityIds.map(id => activitiesService.deleteActivity(id)));
          setActivities(prev => prev.filter(activity => !activityIds.includes(activity.id)));
          break;
        case 'export':
          // Implementation for bulk export
          const selectedActivitiesData = activities.filter(activity => activityIds.includes(activity.id));
          const exportData = selectedActivitiesData.map(activity => ({
            id: activity.id,
            timestamp: activity.created_at,
            type: activity.type,
            subject: activity.subject,
            description: activity.description,
            contact: activity.contact ? `${activity.contact.first_name} ${activity.contact.last_name}` : 'N/A',
            company: activity.contact?.company?.name || 'N/A',
            user: activity.user ? `${activity.user.first_name} ${activity.user.last_name}` : 'N/A',
            duration_minutes: activity.duration_minutes || null,
            scheduled_at: activity.scheduled_at || null
          }));
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `selected_activities_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
        default:
          break;
      }
      setSelectedActivities(new Set());
      setShowBulkActions(false);
    } catch (err) {
      console.error('Bulk action failed:', err);
      setError('Failed to perform bulk action. Please try again.');
    }
  };

  const handleActivitySelection = (activityId, isSelected) => {
    setSelectedActivities(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(activityId);
      } else {
        newSet.delete(activityId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedActivities.size === filteredActivities.length) {
      setSelectedActivities(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedActivities(new Set(filteredActivities.map(activity => activity.id)));
      setShowBulkActions(true);
    }
  };

  const transformedActivities = useMemo(() => {
    return activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      channel: activity.channel || 'system',
      title: activity.subject,
      description: activity.description,
      contact_id: activity.contact_id, // Added missing contact_id field!
      contact: activity.contact ? `${activity.contact.first_name} ${activity.contact.last_name}` : 'N/A',
      company: activity.contact?.company?.name || 'N/A',
      timestamp: new Date(activity.created_at),
      user: activity.user ? `${activity.user.first_name} ${activity.user.last_name}` : 'System',
      avatar: activity.user?.avatar_url || null,
      contactAvatar: activity.contact?.avatar_url || null,
      status: activity.status,
      priority: activity.priority,
      dealValue: activity.deal ? `${activity.deal.value?.toLocaleString()}` : null,
      attachments: activity.attachments || [],
      duration: activity.duration_minutes ? `${activity.duration_minutes} min` : null,
      previousStage: activity.metadata?.previous_stage,
      currentStage: activity.metadata?.current_stage,
      probability: activity.metadata?.probability,
      meetingType: activity.metadata?.meeting_type,
      location: activity.metadata?.location,
      attendees: activity.metadata?.attendees,
      callType: activity.metadata?.call_type,
    }));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return transformedActivities.filter(activity => {
      const matchesType = selectedFilters.activityType === 'all' || activity.type === selectedFilters.activityType;
      const matchesChannel = selectedFilters.channel === 'all' || activity.channel === selectedFilters.channel;
      const matchesContact = selectedFilters.teamMember === 'all' || activity.contact_id === selectedFilters.teamMember;

      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        activity.title?.toLowerCase().includes(lowerCaseQuery) ||
        activity.description?.toLowerCase().includes(lowerCaseQuery) ||
        activity.contact?.toLowerCase().includes(lowerCaseQuery) ||
        activity.company?.toLowerCase().includes(lowerCaseQuery);
      
      let matchesDate = true;
      if (selectedFilters.dateRange !== 'all') {
        const now = new Date();
        const activityDate = new Date(activity.timestamp);
        switch (selectedFilters.dateRange) {
          case 'today':
            matchesDate = activityDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = activityDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = activityDate >= monthAgo;
            break;
          default:
            break;
        }
      }

      return matchesType && matchesChannel && matchesContact && matchesSearch && matchesDate;
    });
  }, [transformedActivities, selectedFilters, searchQuery]);

  const handleExportTimeline = () => {
    const exportData = filteredActivities.map(activity => ({
      timestamp: activity.timestamp.toISOString(),
      type: activity.type,
      title: activity.title,
      contact: activity.contact,
      company: activity.company,
      user: activity.user,
      description: activity.description
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_timeline_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Activity Timeline</h1>
              <p className="text-text-secondary">
                Unified view of all customer interactions across communication channels
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
              {/* Display Mode Toggle - Show when contact is selected */}
              {selectedFilters.teamMember !== 'all' && (
                <div className="flex items-center bg-surface border border-border rounded-lg p-1">
                  <button
                    onClick={() => setDisplayMode('timeline')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-150 flex items-center space-x-1 ${
                      displayMode === 'timeline' 
                        ? 'bg-primary text-white' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="GitBranch" size={16} />
                    <span>Timeline</span>
                  </button>
                  <button
                    onClick={() => setDisplayMode('list')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-150 flex items-center space-x-1 ${
                      displayMode === 'list' 
                        ? 'bg-primary text-white' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="List" size={16} />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => setDisplayMode('calendar')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-150 flex items-center space-x-1 ${
                      displayMode === 'calendar' 
                        ? 'bg-primary text-white' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="Calendar" size={16} />
                    <span>Calendar</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                >
                  <Icon name="FileTemplate" size={16} />
                  <span>Templates</span>
                </button>
                
                <button
                  onClick={handleExportTimeline}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                >
                  <Icon name="Download" size={16} />
                  <span>Export</span>
                </button>
                
                {hasAnyPermission(['activities.create_all', 'activities.create_own']) && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Icon name="Plus" size={16} />
                    <span>Add Activity</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg mb-6 flex items-center space-x-2">
              <Icon name="AlertCircle" size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6">
            <div className="relative max-w-md">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search activities, contacts, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`lg:w-80 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="card sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-1 text-text-secondary hover:text-text-primary"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <ActivityFilters
                    selectedFilters={selectedFilters}
                    onFiltersChange={setSelectedFilters}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-50"
            >
              <Icon name="Filter" size={20} />
            </button>

            <div className="flex-1">
              {/* Bulk Actions Bar */}
              {showBulkActions && (
                <BulkActionsBar
                  selectedCount={selectedActivities.size}
                  selectedIds={Array.from(selectedActivities)}
                  onBulkAction={handleBulkAction}
                  onClearSelection={() => {
                    setSelectedActivities(new Set());
                    setShowBulkActions(false);
                  }}
                />
              )}

              {/* Activity Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-text-secondary">
                    Showing {filteredActivities.length} of {activities.length} activities
                    {selectedFilters.teamMember === 'all' && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        • List view (all contacts)
                      </span>
                    )}
                    {selectedFilters.teamMember !== 'all' && displayMode === 'timeline' && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        • Timeline view
                      </span>
                    )}
                    {selectedFilters.teamMember !== 'all' && displayMode === 'list' && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        • List view
                      </span>
                    )}
                    {selectedFilters.teamMember !== 'all' && displayMode === 'calendar' && (
                      <span className="ml-2 text-xs text-text-tertiary">
                        • Calendar view
                      </span>
                    )}
                  </div>
                  
                  {filteredActivities.length > 0 && (
                    <label className="flex items-center space-x-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={selectedActivities.size === filteredActivities.length}
                        onChange={handleSelectAll}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Select all</span>
                    </label>
                  )}
                </div>
                
                {(selectedFilters.activityType !== 'all' || selectedFilters.dateRange !== 'all' || 
                  selectedFilters.channel !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedFilters({
                        activityType: 'all',
                        dateRange: 'all',
                        teamMember: 'all',
                        channel: 'all'
                      });
                      setSearchQuery('');
                    }}
                    className="text-sm text-primary hover:text-primary-700 transition-colors duration-150 ease-out"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Content based on view mode */}
              {viewMode === 'insights' ? (
                <ActivityInsights activities={filteredActivities} />
              ) : (
                <>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-text-secondary">Loading activities...</p>
                    </div>
                  ) : (
                    <>
                      {filteredActivities.length > 0 ? (
                        // Show calendar view when displayMode is 'calendar'
                        displayMode === 'calendar' ? (
                          <ActivityCalendar 
                            filters={selectedFilters}
                            currentUser={user}
                            onActivityAdded={handleActivityAdded}
                            onActivityUpdated={handleActivityUpdated}
                            onEditActivity={handleEditActivity}
                          />
                        ) : (
                          // Show list view for all contacts, or when list mode is selected
                          // Show timeline view only when a specific contact is selected AND displayMode is 'timeline'
                          (selectedFilters.teamMember === 'all' || displayMode === 'list') ? (
                            <ActivityListView
                              activities={filteredActivities}
                              selectedActivities={selectedActivities}
                              onActivitySelection={handleActivitySelection}
                              onEdit={handleEditActivity}
                              onDelete={handleDeleteActivity}
                              onSelectAll={handleSelectAll}
                            />
                          ) : (
                            <div className="space-y-6">
                              {filteredActivities.map((activity, index) => (
                                <ActivityCard
                                  key={activity.id}
                                  activity={activity}
                                  isLast={index === filteredActivities.length - 1}
                                  isSelected={selectedActivities.has(activity.id)}
                                  onSelectionChange={(isSelected) => handleActivitySelection(activity.id, isSelected)}
                                  showCheckbox={true}
                                  onEdit={handleEditActivity}
                                  onDelete={handleDeleteActivity}
                                />
                              ))}
                            </div>
                          )
                        )
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="Clock" size={32} className="text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-text-primary mb-2">No activities found</h3>
                          <p className="text-text-secondary mb-4">
                            Try adjusting your filters or search terms to find activities.
                          </p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary"
                          >
                            Add First Activity
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {isAddModalOpen && (
        <AddActivityModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedTemplate(null);
            setEditingActivity(null);
          }}
          onActivityAdded={handleActivityAdded}
          onActivityUpdated={handleActivityUpdated}
          prefilledData={selectedTemplate ? selectedTemplate.template : {}}
          templateData={selectedTemplate}
          editingActivity={editingActivity}
        />
      )}
      
      {isTemplateModalOpen && (
        <ActivityTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onTemplateSelected={(template) => {
            setSelectedTemplate(template);
            setIsTemplateModalOpen(false);
            setIsAddModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default ActivityTimeline; // "Enterprise CRM Implementation - TechCorp" moved from "Proposal Sent" to "Negotiation" stage.

// Stage progression details:
// • Previous stage: Proposal Sent (7 days)
// • Current stage: Negotiation
// • Probability updated: 60% → 75%
// • Expected close date: March 15, 2024
// • Deal value: $45,000

// Automated follow-up tasks created:
// • Schedule contract review meeting
// • Prepare implementation timeline
// • Coordinate with legal team for contract terms`,
//       contact: 'Sarah Johnson',
//       company: 'TechCorp Solutions',
//       timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
//       user: 'System',
//       avatar: null,
//       contactAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
//       previousStage: 'Proposal Sent',
//       currentStage: 'Negotiation',
//       probability: 75,
//       status: 'updated',
//       priority: 'medium',
//       dealValue: '$45,000'
//     },
//     {
//       id: 5,
//       type: 'email',
//       channel: 'gmail',
//       title: 'Contract Terms Received',
//       description: `Received contract terms and conditions from GlobalTech's legal team. Key points for review:

// • Payment terms: Net 30 days
// • Implementation timeline: 90 days from contract signing
// • Data migration requirements: Full Salesforce export
// • Training requirements: 20 hours of user training
// • Support level: Premium support with 4-hour response SLA
// • Contract duration: 3 years with annual renewal option

// Legal review scheduled for tomorrow morning. Contract looks favorable with minor adjustments needed for implementation timeline.`,
//       contact: 'Lisa Park',company: 'GlobalTech Industries',timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),user: 'Alex Thompson',avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',contactAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',status: 'received',priority: 'high',dealValue: '$125,000',
//       attachments: ['contract_terms_globaltech.pdf', 'sla_agreement.pdf']
//     },
//     {
//       id: 6,
//       type: 'task',channel: 'system',title: 'Follow-up Task Completed',
//       description: `Completed follow-up task: "Send pricing comparison document to InnovateTech"

// Task details:
// • Created: 3 days ago
// • Assigned to: Jennifer Walsh
// • Priority: High
// • Due date: Today
// • Status: Completed

// Actions taken:
// • Prepared comprehensive pricing comparison with competitors
// • Highlighted SalesFlow Pro's unique value propositions
// • Included ROI calculator and implementation timeline
// • Sent via email with read receipt confirmation

// Next action: Schedule follow-up call within 48 hours to discuss pricing feedback.`,
//       contact: 'David Chen',
//       company: 'InnovateTech',
//       timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
//       user: 'Jennifer Walsh',
//       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
//       contactAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
//       taskType: 'follow_up',
//       status: 'completed',
//       priority: 'high',
//       dealValue: '$42,000'
//     }
//   ];

//   const filteredActivities = useMemo(() => {
//     return activities?.filter(activity => {
//       const matchesType = selectedFilters?.activityType === 'all' || activity?.type === selectedFilters?.activityType;
//       const matchesChannel = selectedFilters?.channel === 'all' || activity?.channel === selectedFilters?.channel;
//       const matchesSearch = searchQuery === '' || 
//         activity?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
//         activity?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
//         activity?.contact?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
//         activity?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase());
      
//       let matchesDate = true;
//       if (selectedFilters?.dateRange !== 'all') {
//         const now = new Date();
//         const activityDate = new Date(activity.timestamp);
//         switch (selectedFilters?.dateRange) {
//           case 'today':
//             matchesDate = activityDate?.toDateString() === now?.toDateString();
//             break;
//           case 'week':
//             const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//             matchesDate = activityDate >= weekAgo;
//             break;
//           case 'month':
//             const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//             matchesDate = activityDate >= monthAgo;
//             break;
//         }
//       }

//       return matchesType && matchesChannel && matchesSearch && matchesDate;
//     });
//   }, [activities, selectedFilters, searchQuery]);

//   const handleExportTimeline = () => {
//     const exportData = filteredActivities?.map(activity => ({
//       timestamp: activity?.timestamp?.toISOString(),
//       type: activity?.type,
//       title: activity?.title,
//       contact: activity?.contact,
//       company: activity?.company,
//       user: activity?.user,
//       description: activity?.description
//     }));
    
//     const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `activity_timeline_${new Date()?.toISOString()?.split('T')?.[0]}.json`;
//     document.body?.appendChild(a);
//     a?.click();
//     document.body?.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <main className="pt-16">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <Breadcrumb />
          
//           {/* Page Header */}
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-text-primary mb-2">Activity Timeline</h1>
//               <p className="text-text-secondary">
//                 Unified view of all customer interactions across communication channels
//               </p>
//             </div>
            
//             <div className="flex items-center space-x-4 mt-4 lg:mt-0">
//               <button
//                 onClick={handleExportTimeline}
//                 className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
//               >
//                 <Icon name="Download" size={16} />
//                 <span>Export Timeline</span>
//               </button>
              
//               <button
//                 onClick={() => setIsAddModalOpen(true)}
//                 className="btn-primary flex items-center space-x-2"
//               >
//                 <Icon name="Plus" size={16} />
//                 <span>Add Activity</span>
//               </button>
//             </div>
//           </div>

//           {/* Search Bar */}
//           <div className="mb-6">
//             <div className="relative max-w-md">
//               <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
//               <input
//                 type="text"
//                 placeholder="Search activities, contacts, or companies..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e?.target?.value)}
//                 className="input-field pl-10"
//               />
//             </div>
//           </div>

//           <div className="flex flex-col lg:flex-row gap-6">
//             {/* Sidebar Filters */}
//             <div className={`lg:w-80 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
//               <div className="card p-6 sticky top-24">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
//                   <button
//                     onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//                     className="lg:hidden p-1 text-text-secondary hover:text-text-primary"
//                   >
//                     <Icon name="X" size={20} />
//                   </button>
//                 </div>
                
//                 <ActivityFilters
//                   selectedFilters={selectedFilters}
//                   onFiltersChange={setSelectedFilters}
//                 />
//               </div>
//             </div>

//             {/* Mobile Filter Toggle */}
//             <button
//               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//               className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-50"
//             >
//               <Icon name="Filter" size={20} />
//             </button>

//             {/* Timeline Content */}
//             <div className="flex-1">
//               {/* Results Summary */}
//               <div className="flex items-center justify-between mb-6">
//                 <div className="text-sm text-text-secondary">
//                   Showing {filteredActivities?.length} of {activities?.length} activities
//                 </div>
                
//                 {(selectedFilters?.activityType !== 'all' || selectedFilters?.dateRange !== 'all' || 
//                   selectedFilters?.channel !== 'all' || searchQuery) && (
//                   <button
//                     onClick={() => {
//                       setSelectedFilters({
//                         activityType: 'all',
//                         dateRange: 'all',
//                         teamMember: 'all',
//                         channel: 'all'
//                       });
//                       setSearchQuery('');
//                     }}
//                     className="text-sm text-primary hover:text-primary-700 transition-colors duration-150 ease-out"
//                   >
//                     Clear all filters
//                   </button>
//                 )}
//               </div>

//               {/* Timeline */}
//               <div className="space-y-6">
//                 {filteredActivities?.length > 0 ? (
//                   filteredActivities?.map((activity, index) => (
//                     <ActivityCard
//                       key={activity?.id}
//                       activity={activity}
//                       isLast={index === filteredActivities?.length - 1}
//                     />
//                   ))
//                 ) : (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <Icon name="Clock" size={32} className="text-primary" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-text-primary mb-2">No activities found</h3>
//                     <p className="text-text-secondary mb-4">
//                       Try adjusting your filters or search terms to find activities.
//                     </p>
//                     <button
//                       onClick={() => setIsAddModalOpen(true)}
//                       className="btn-primary"
//                     >
//                       Add First Activity
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//       {/* Add Activity Modal */}
//       {isAddModalOpen && (
//         <AddActivityModal
//           isOpen={isAddModalOpen}
//           onClose={() => setIsAddModalOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ActivityTimeline;