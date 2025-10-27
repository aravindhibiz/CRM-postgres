import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import ActivityTimeline from './ActivityTimeline';
import DealsList from './DealsList';
import Notes from './Notes';
import ComposeEmailModal from './ComposeEmailModal';
import { activitiesService } from '../../../services/activitiesService';
import { dealsService } from '../../../services/dealsService';
import { useAuth } from '../../../contexts/AuthContext';

const ContactDetail = ({ contact, onEdit, onDelete, onContactUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [contactActivities, setContactActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [contactDeals, setContactDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [notesCount, setNotesCount] = useState(0);
  const { hasAnyPermission } = useAuth();
  
  if (!contact) return null;

  // Fetch activities for this specific contact
  useEffect(() => {
    const fetchContactActivities = async () => {
      if (!contact?.id) return;
      
      try {
        setLoadingActivities(true);
        console.log(`Fetching activities for contact: ${contact.id}`);
        
        // Get all activities and filter for this contact
        const allActivities = await activitiesService.getUserActivities();
        const filteredActivities = allActivities.filter(activity => 
          activity.contact_id === contact.id
        );
        
        console.log(`Found ${filteredActivities.length} activities for contact ${contact.first_name} ${contact.last_name}`);
        setContactActivities(filteredActivities);
      } catch (error) {
        console.error('Error fetching contact activities:', error);
        setContactActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchContactActivities();
  }, [contact?.id]);

  // Fetch deals for this specific contact
  useEffect(() => {
    const fetchContactDeals = async () => {
      if (!contact?.id) return;
      
      try {
        setLoadingDeals(true);
        console.log(`Fetching deals for contact: ${contact.id}`);
        
        // Get all deals and filter for this contact
        const allDeals = await dealsService.getUserDeals();
        const filteredDeals = allDeals.filter(deal => 
          deal.contact_id === contact.id
        );
        
        console.log(`Found ${filteredDeals.length} deals for contact ${contact.first_name} ${contact.last_name}`);
        setContactDeals(filteredDeals);
      } catch (error) {
        console.error('Error fetching contact deals:', error);
        setContactDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchContactDeals();
  }, [contact?.id]);

  const handleActivityAdded = (newActivity) => {
    // Add the new activity to the local activities state
    setContactActivities(prevActivities => [newActivity, ...prevActivities]);

    if (onContactUpdate) {
      // Update the contact with the new activity
      const updatedContact = {
        ...contact,
        activities: [newActivity, ...(contact.activities || [])]
      };
      onContactUpdate(updatedContact);
    }
  };

  const handleActivityUpdated = (updatedActivity) => {
    // Update the activity in the local activities state
    setContactActivities(prevActivities =>
      prevActivities.map(activity =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );

    if (onContactUpdate) {
      // Update the contact with the updated activity
      const updatedContact = {
        ...contact,
        activities: contact.activities?.map(activity =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      };
      onContactUpdate(updatedContact);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never contacted';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderSocialIcon = (platform) => {
    switch (platform) {
      case 'linkedin':
        return 'Linkedin';
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      default:
        return 'Link';
    }
  };

  // Extract social profiles from URLs
  const getSocialProfiles = () => {
    const profiles = {};
    if (contact?.social_linkedin) {
      profiles.linkedin = contact?.social_linkedin;
    }
    if (contact?.social_twitter) {
      profiles.twitter = contact?.social_twitter;
    }
    return profiles;
  };

  const socialProfiles = getSocialProfiles();

  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm">
      {/* Contact Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="relative mr-4">
              <Image
                src={contact?.avatar_url || '/assets/images/no_image.png'}
                alt={`${contact?.first_name || ''} ${contact?.last_name || ''}`}
                className="w-16 h-16 rounded-full object-cover"
              />
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-surface ${
                contact?.status === 'active' ? 'bg-success' : 'bg-text-tertiary'
              }`}></span>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {contact?.full_name || `${contact?.first_name || ''} ${contact?.last_name || ''}`?.trim() || 'Unnamed Contact'}
              </h2>
              <div className="flex items-center text-text-secondary">
                <span>{contact?.position || 'No position'}</span>
                {contact?.company && (
                  <>
                    <span className="mx-2">•</span>
                    {contact?.company_id ? (
                      <Link
                        to={`/company-management/${contact.company_id}`}
                        className="text-primary hover:underline flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="Building2" size={14} />
                        <span>{contact.company.name}</span>
                      </Link>
                    ) : (
                      <span>{contact.company.name}</span>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {contact?.tags?.map((tag, index) => (
                  <span 
                    key={`${tag}-${index}`} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary"
                  >
                    {tag}
                  </span>
                )) || null}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-all duration-150 ease-out"
            >
              <Icon name="Mail" size={16} />
              <span>Email</span>
            </button>
            
            {hasAnyPermission(['contacts.edit_all', 'contacts.edit_own']) && (
              <button
                onClick={onEdit}
                className="inline-flex items-center space-x-2 px-3 py-2 border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-all duration-150 ease-out"
              >
                <Icon name="Edit" size={16} />
                <span>Edit</span>
              </button>
            )}
            
            {hasAnyPermission(['contacts.delete_all', 'contacts.delete_own']) && (
              <div className="relative group">
                
                
                {/* <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-10 hidden group-hover:block"> */}
                  <div className="py-1">
                    <button
                      onClick={onDelete}
                      className="flex w-full items-center px-4 py-2 text-sm text-error hover:bg-surface-hover"
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                {/* </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'overview' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'activity' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
            }`}
          >
            Activity ({contactActivities.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'deals' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
            }`}
          >
            Deals ({contactDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'notes' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
            }`}
          >
            Notes ({notesCount})
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                {contact?.email && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Icon name="Mail" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-secondary">Email</span>
                    </div>
                    <a href={`mailto:${contact?.email}`} className="text-primary hover:underline">
                      {contact?.email}
                    </a>
                  </div>
                )}
                
                {contact?.phone && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Icon name="Phone" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-secondary">Phone</span>
                    </div>
                    <a href={`tel:${contact?.phone}`} className="text-text-primary">
                      {contact?.phone}
                    </a>
                  </div>
                )}

                {contact?.mobile && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Icon name="Smartphone" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-secondary">Mobile</span>
                    </div>
                    <a href={`tel:${contact?.mobile}`} className="text-text-primary">
                      {contact?.mobile}
                    </a>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center mb-1">
                    <Icon name="Building" size={16} className="text-text-tertiary mr-2" />
                    <span className="text-sm text-text-secondary">Company</span>
                  </div>
                  <span className="text-text-primary">{contact?.company?.name || 'No Company'}</span>
                </div>
                
                {contact?.position && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Icon name="Briefcase" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-secondary">Position</span>
                    </div>
                    <span className="text-text-primary">{contact?.position}</span>
                  </div>
                )}

                {contact?.department && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Icon name="Users" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-secondary">Department</span>
                    </div>
                    <span className="text-text-primary">{contact?.department}</span>
                  </div>
                )}

                {contact?.lead_source && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Icon name="Target" size={16} className="text-text-tertiary mr-2" />
                      <span className="text-sm text-text-secondary">Lead Source</span>
                    </div>
                    <span className="text-text-primary capitalize">{contact?.lead_source?.replace('_', ' ')}</span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center mb-1">
                    <Icon name="Calendar" size={16} className="text-text-tertiary mr-2" />
                    <span className="text-sm text-text-secondary">Last Contacted</span>
                  </div>
                  <span className="text-text-primary">{formatDate(contact?.last_contact_date)}</span>
                </div>
              </div>
            </div>
            
            {/* Social Profiles & Custom Fields */}
            <div className="space-y-6">
              {/* Social Profiles */}
              <div className="card p-5">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Social Profiles</h3>
                
                {Object.keys(socialProfiles)?.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(socialProfiles)?.map(([platform, url]) => (
                      <a 
                        key={platform}
                        href={url?.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-text-primary hover:text-primary transition-colors duration-150 ease-out"
                      >
                        <Icon name={renderSocialIcon(platform)} size={16} className="mr-2" />
                        <span>{platform?.charAt(0)?.toUpperCase() + platform?.slice(1)}</span>
                        <Icon name="ExternalLink" size={14} className="ml-2" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">No social profiles added</p>
                )}
              </div>
              
              {/* Custom Fields */}
              <div className="card p-5">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Additional Information</h3>
                
                {contact?.custom_fields && Object.keys(contact?.custom_fields)?.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(contact?.custom_fields)?.map(([key, fieldData]) => {
                      // Handle both direct values and field objects with metadata
                      const displayValue = typeof fieldData === 'object' && fieldData !== null && 'value' in fieldData
                        ? fieldData.value
                        : fieldData;
                      
                      // Format the field name
                      const fieldName = key?.replace(/_/g, ' ')?.replace(/([A-Z])/g, ' $1')?.trim()
                        ?.split(' ')
                        ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        ?.join(' ');
                      
                      // Don't display if value is null or undefined
                      if (displayValue === null || displayValue === undefined || displayValue === '') {
                        return null;
                      }
                      
                      return (
                        <div key={key} className="pb-3 border-b border-border last:border-0">
                          <div className="text-sm font-medium text-text-secondary mb-1">
                            {fieldName}
                          </div>
                          <div className="text-text-primary">
                            {typeof displayValue === 'boolean' 
                              ? (displayValue ? 'Yes' : 'No')
                              : Array.isArray(displayValue)
                              ? displayValue.join(', ')
                              : String(displayValue)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">No additional information</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <ActivityTimeline
            activities={contactActivities}
            contact={contact}
            onActivityAdded={handleActivityAdded}
            onActivityUpdated={handleActivityUpdated}
            loading={loadingActivities}
          />
        )}
        
        {activeTab === 'deals' && (
          <DealsList 
            deals={contactDeals} 
            contactName={contact?.full_name || `${contact?.first_name || ''} ${contact?.last_name || ''}`?.trim() || 'Unnamed Contact'}
            loading={loadingDeals}
          />
        )}
        
        {activeTab === 'notes' && (
          <Notes contact={contact} onNotesCountChange={setNotesCount} />
        )}
      </div>
      {/* Modals */}
      {isEmailModalOpen && (
        <ComposeEmailModal
          contact={contact}
          onClose={() => setIsEmailModalOpen(false)}
          onSend={(emailData) => {
            console.log('Email sent:', emailData);
            setIsEmailModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ContactDetail;