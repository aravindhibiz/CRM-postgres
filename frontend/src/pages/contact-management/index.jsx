import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';

import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import ContactList from './components/ContactList';
import ContactDetail from './components/ContactDetail';
import ContactForm from './components/ContactForm';
import ImportContactsModal from './components/ImportContactsModal';
import ExportContactsModal from './components/ExportContactsModal';
import MergeDuplicatesModal from './components/MergeDuplicatesModal';
import FilterPanel from './components/FilterPanel';
import contactsService from '../../services/contactsService';
import { useAuth } from '../../contexts/AuthContext';

const ContactManagement = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    company: [],
    dealStage: [],
    lastContactDate: null,
    tags: []
  });

  // Load contacts data from Supabase
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError('');
      
      let contactsData = [];
      if (searchQuery) {
        contactsData = await contactsService?.searchContacts(searchQuery);
      } else {
        const filterParams = {};
        
        if (filters?.company?.length > 0) {
          filterParams.companies = filters?.company;
        }
        
        if (filters?.dealStage?.length > 0) {
          filterParams.dealStages = filters?.dealStage;
        }
        
        if (filters?.tags?.length > 0) {
          filterParams.tags = filters?.tags;
        }
        
        if (filters?.lastContactDate) {
          filterParams.dateRange = filters?.lastContactDate;
        }
        
        if (Object.keys(filterParams)?.length > 0) {
          contactsData = await contactsService?.filterContacts(filterParams);
        } else {
          contactsData = await contactsService?.getUserContacts();
        }
      }

      setContacts(contactsData || []);
      
      // Set first contact as selected by default for desktop view
      if (contactsData?.length > 0 && window.innerWidth >= 1024 && !selectedContact) {
        setSelectedContact(contactsData?.[0]);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      if (err?.message?.includes('Failed to fetch') || 
          err?.message?.includes('NetworkError')) {
        setError('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      } else {
        setError('Failed to load contacts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user, searchQuery, filters, activeTab]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Filter contacts based on active tab
  const filteredContacts = contacts?.filter(contact => {
    // Filter by active tab
    if (activeTab === 'active') {
      return contact?.status === 'active';
    } else if (activeTab === 'inactive') {
      return contact?.status === 'inactive';
    }
    return true; // 'all' tab
  });

  const handleContactSelect = (contact) => {
    
    console.log('handleContactSelect called with:', contact);
    try {
      setSelectedContact(contact);
      setIsAddingContact(false);
      setIsEditingContact(false);
    } catch (error) {
      console.error('Error in handleContactSelect:', error);
      setError('Something went wrong while selecting the contact. Please try again.');
    }
  };

  const handleContactMultiSelect = (contactId) => {
    console.log('handleContactMultiSelect called with:', contactId);
    try {
      setSelectedContacts(prev => {
        const newSelected = prev?.includes(contactId) 
          ? prev?.filter(id => id !== contactId)
          : [...(prev || []), contactId];
        console.log('Updated selectedContacts:', newSelected);
        return newSelected;
      });
    } catch (error) {
      console.error('Error in handleContactMultiSelect:', error);
      setError('Something went wrong while selecting contacts. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts?.length === filteredContacts?.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts?.map(contact => contact?.id));
    }
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsAddingContact(true);
    setIsEditingContact(false);
  };

  const handleEditContact = () => {
    setIsAddingContact(false);
    setIsEditingContact(true);
  };

  const handleSaveContact = async (contactData) => {
    try {
      setError('');
      let result;
      
      if (isAddingContact) {
        result = contactData;
        setSuccess('Contact created successfully!');
      } else if (isEditingContact && selectedContact) {
        result = contactData;
        setSuccess('Contact updated successfully!');
      }
      
      setSelectedContact(result);
      setIsAddingContact(false);
      setIsEditingContact(false);
      
      // Refresh contacts list
      loadContacts();
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save contact. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setIsAddingContact(false);
    setIsEditingContact(false);
    if (selectedContact === null && contacts?.length > 0) {
      setSelectedContact(contacts?.[0]);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      setError('');
      await contactsService?.deleteContact(contactId);
      setSuccess('Contact deleted successfully!');
      
      // Update local state
      const updatedContacts = contacts?.filter(contact => contact?.id !== contactId);
      setContacts(updatedContacts);
      
      if (selectedContact && selectedContact?.id === contactId) {
        setSelectedContact(updatedContacts?.length > 0 ? updatedContacts?.[0] : null);
      }
      
      setSelectedContacts(prev => prev?.filter(id => id !== contactId));
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    try {
      setError('');
      await contactsService?.deleteContacts(selectedContacts);
      setSuccess(`${selectedContacts?.length} contact(s) deleted successfully!`);
      
      // Update local state
      const updatedContacts = contacts?.filter(contact => !selectedContacts?.includes(contact?.id));
      setContacts(updatedContacts);
      
      if (selectedContact && selectedContacts?.includes(selectedContact?.id)) {
        setSelectedContact(updatedContacts?.length > 0 ? updatedContacts?.[0] : null);
      }
      
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error deleting contacts:', err);
      setError('Failed to delete contacts. Please try again.');
    }
  };

  const handleContactUpdate = (updatedContact) => {
    // Update the contact in the main contacts list
    const updatedContacts = contacts.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    );
    setContacts(updatedContacts);
    
    // Update the selected contact if it's the same one
    if (selectedContact && selectedContact.id === updatedContact.id) {
      setSelectedContact(updatedContact);
    }
  };

  const handleImportContacts = async (importedContacts) => {
    try {
      setError('');
      await contactsService?.importContacts(importedContacts);
      setSuccess(`${importedContacts?.length} contact(s) imported successfully!`);
      setIsImportModalOpen(false);
      loadContacts(); // Refresh the list
    } catch (err) {
      console.error('Error importing contacts:', err);
      setError('Failed to import contacts. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Contact Management</h1>
                <p className="text-text-secondary mt-1">Manage your customer relationships and communication history</p>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <button 
                  onClick={handleAddContact}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Icon name="UserPlus" size={18} />
                  <span>Add Contact</span>
                </button>
                
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                >
                  <Icon name="Upload" size={18} />
                  <span>Import</span>
                </button>
                
                <button 
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all duration-150 ease-out ${
                    Object.values(filters)?.some(f => Array.isArray(f) ? f?.length > 0 : f !== null) || isFilterPanelOpen
                      ? 'border-primary-500 bg-primary-50 text-primary' :'border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <Icon name="Filter" size={18} />
                  <span>Filter</span>
                  {Object.values(filters)?.some(f => Array.isArray(f) ? f?.length > 0 : f !== null) && (
                    <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {Object.values(filters)?.reduce((count, f) => count + (Array.isArray(f) ? f?.length : (f !== null ? 1 : 0)), 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-success-50 border border-success-200 text-success p-4 rounded-lg flex items-center space-x-2 mb-6">
                <Icon name="CheckCircle" size={20} />
                <span>{success}</span>
                <button
                  onClick={() => setSuccess('')}
                  className="ml-auto text-success hover:text-success-600"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg flex items-center space-x-2 mb-6">
                <Icon name="AlertCircle" size={20} />
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-error hover:text-error-600"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            
            {/* Filter Panel */}
            {isFilterPanelOpen && (
              <FilterPanel 
                filters={filters} 
                setFilters={setFilters} 
                onClose={() => setIsFilterPanelOpen(false)} 
              />
            )}
            
            {/* Search and Tabs */}
            <div className="mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Search" size={18} className="text-text-tertiary" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'all' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Contacts
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'active' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('inactive')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'inactive' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-text-secondary">Loading contacts...</span>
                </div>
              </div>
            ) : (
              /* Main Content Area */
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Contact List (Left Panel) */}
                <div className="w-full lg:w-1/3 xl:w-1/4">
                  <div className="bg-surface rounded-lg border border-border shadow-sm">
                    {/* List Header with Actions */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedContacts?.length === filteredContacts?.length && filteredContacts?.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                        />
                        <span className="ml-3 text-sm text-text-secondary">
                          {selectedContacts?.length > 0 ? `${selectedContacts?.length} selected` : `${filteredContacts?.length} contacts`}
                        </span>
                      </div>
                      
                      {selectedContacts?.length > 0 && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="text-text-secondary hover:text-text-primary"
                            title="Export Selected"
                          >
                            <Icon name="Download" size={16} />
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="text-error hover:text-error-600"
                            title="Delete Selected"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                          {selectedContacts?.length === 2 && (
                            <button
                              onClick={() => setIsMergeModalOpen(true)}
                              className="text-text-secondary hover:text-text-primary"
                              title="Merge Contacts"
                            >
                              <Icon name="GitMerge" size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Contact List */}
                    <ContactList
                      contacts={filteredContacts}
                      selectedContact={selectedContact}
                      selectedContacts={selectedContacts}
                      onContactSelect={handleContactSelect}
                      onContactMultiSelect={handleContactMultiSelect}
                      onDeleteContact={handleDeleteContact}
                    />
                  </div>
                </div>
                
                {/* Contact Detail or Form (Right Panel) */}
                <div className="w-full lg:w-2/3 xl:w-3/4">
                  {isAddingContact || isEditingContact ? (
                    <ContactForm
                      contact={isEditingContact ? selectedContact : null}
                      onSubmit={handleSaveContact}
                      onCancel={handleCancelForm}
                      isEditing={isEditingContact}
                    />
                  ) : selectedContact ? (
                    <ContactDetail
                      contact={selectedContact}
                      onEdit={handleEditContact}
                      onDelete={() => handleDeleteContact(selectedContact?.id)}
                      onContactUpdate={handleContactUpdate}
                    />
                  ) : (
                    <div className="bg-surface rounded-lg border border-border shadow-sm p-8 text-center">
                      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Users" size={24} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">No Contact Selected</h3>
                      <p className="text-text-secondary mb-6">Select a contact from the list or add a new one to get started.</p>
                      <button
                        onClick={handleAddContact}
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Icon name="UserPlus" size={18} />
                        <span>Add New Contact</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Modals */}
      {isImportModalOpen && (
        <ImportContactsModal
          onImport={handleImportContacts}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
      {isExportModalOpen && (
        <ExportContactsModal
          contacts={contacts?.filter(contact => selectedContacts?.includes(contact?.id))}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
      {isMergeModalOpen && selectedContacts?.length === 2 && (
        <MergeDuplicatesModal
          contact1={contacts?.find(c => c?.id === selectedContacts?.[0])}
          contact2={contacts?.find(c => c?.id === selectedContacts?.[1])}
          onMerge={(mergedContact) => {
            const updatedContacts = contacts?.filter(c => !selectedContacts?.includes(c?.id));
            setContacts([...updatedContacts, mergedContact]);
            setSelectedContact(mergedContact);
            setSelectedContacts([]);
            setIsMergeModalOpen(false);
          }}
          onClose={() => setIsMergeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ContactManagement;