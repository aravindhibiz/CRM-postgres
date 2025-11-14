import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';

import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import ContactList from './components/ContactList';
import ContactGrid from './components/ContactGrid';
import ContactDetail from './components/ContactDetail';
import ContactForm from './components/ContactForm';
import ImportContactsModal from './components/ImportContactsModal';
import ExportContactsModal from './components/ExportContactsModal';
import MergeDuplicatesModal from './components/MergeDuplicatesModal';
import { contactsService } from '../../services/contactsService';
import { companiesService } from '../../services/companiesService';
import { useAuth } from '../../contexts/AuthContext';
import { permissionsService } from '../../services/permissionsService';

const ContactManagement = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'split'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError('');
      
      let contactsData = [];
      if (searchQuery) {
        contactsData = await contactsService?.searchContacts(searchQuery);
      } else {
        contactsData = await contactsService?.getUserContacts();
      }

      setContacts(contactsData || []);
      
      // Only set first contact as selected when in split view mode
      if (contactsData?.length > 0 && viewMode === 'split' && !selectedContact) {
        try {
          const fullContactData = await contactsService?.getContactById(contactsData[0].id);
          setSelectedContact(fullContactData);
        } catch (err) {
          console.error('Error loading full contact data:', err);
          setSelectedContact(contactsData?.[0]);
        }
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
  }, [user, searchQuery, activeTab]);

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
    } else if (activeTab === 'my') {
      return contact?.owner_id === user?.id;
    }
    return true; // 'all' tab
  });

  const handleContactSelect = async (contact) => {
    
    try {
      // Fetch full contact data including custom fields
      if (contact?.id) {
        const fullContactData = await contactsService?.getContactById(contact.id);
        setSelectedContact(fullContactData);
      } else {
        setSelectedContact(contact);
      }
      // Switch to split view when a contact is selected
      setViewMode('split');
      setIsAddingContact(false);
      setIsEditingContact(false);
    } catch (error) {
      console.error('Error in handleContactSelect:', error);
      // Fallback to the basic contact data if fetch fails
      setSelectedContact(contact);
      setViewMode('split');
      setIsAddingContact(false);
      setIsEditingContact(false);
      setError('Could not load full contact details. Showing basic information.');
    }
  };

  const handleContactMultiSelect = (contactId) => {
    try {
      setSelectedContacts(prev => {
        const newSelected = prev?.includes(contactId) 
          ? prev?.filter(id => id !== contactId)
          : [...(prev || []), contactId];
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

  const handleBackToGrid = () => {
    setViewMode('grid');
    setSelectedContact(null);
    setIsAddingContact(false);
    setIsEditingContact(false);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsAddingContact(true);
    setIsEditingContact(false);
    setViewMode('split');
  };

  const handleEditContact = async () => {
    setIsAddingContact(false);
    setIsEditingContact(true);
    
    // Fetch full contact data including custom fields
    if (selectedContact?.id) {
      try {
        const fullContactData = await contactsService?.getContactById(selectedContact.id);
        setSelectedContact(fullContactData);
      } catch (err) {
        console.error('Error loading full contact data:', err);
        // Continue with current selectedContact if fetch fails
      }
    }
  };

  const handleSaveContact = async (contactData) => {
    try {
      setError('');
      let result;

      if (isAddingContact) {
        // Create new contact
        
        let companyId = contactData.company_id;
        
        // Handle company creation if companyName is provided but no company_id
        if (contactData.companyName?.trim() && !companyId) {
          
          try {
            // First check if company already exists
            const existingCompanies = await companiesService?.searchCompanies(contactData.companyName?.trim());
            const existingCompany = existingCompanies?.find(
              company => company.name?.toLowerCase() === contactData.companyName?.trim()?.toLowerCase()
            );
            
            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              // Create new company
              const newCompany = await companiesService?.createCompany({
                name: contactData.companyName?.trim()
              });
              companyId = newCompany.id;
            }
          } catch (companyError) {
            console.error('Error handling company:', companyError);
            throw new Error(`Failed to create company "${contactData.companyName}": ${companyError.message}`);
          }
        }
        
        // Clean the data - convert empty strings to null for optional UUID fields
        const { companyName, ...cleanedData } = {
          ...contactData,
          company_id: companyId || null,
          owner_id: user?.id
        };
        
        // Remove any undefined or empty string fields that should be null
        Object.keys(cleanedData).forEach(key => {
          if (cleanedData[key] === '' && ['company_id'].includes(key)) {
            cleanedData[key] = null;
          }
        });
        
        result = await contactsService?.createContact(cleanedData);
        setSuccess(`Contact "${result?.first_name} ${result?.last_name}" created successfully!`);
      } else if (isEditingContact && selectedContact) {
        // Update existing contact
        
        let companyId = contactData.company_id;
        
        // Handle company creation if companyName is provided but no company_id
        if (contactData.companyName?.trim() && !companyId) {
          
          try {
            // First check if company already exists
            const existingCompanies = await companiesService?.searchCompanies(contactData.companyName?.trim());
            const existingCompany = existingCompanies?.find(
              company => company.name?.toLowerCase() === contactData.companyName?.trim()?.toLowerCase()
            );
            
            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              // Create new company
              const newCompany = await companiesService?.createCompany({
                name: contactData.companyName?.trim()
              });
              companyId = newCompany.id;
            }
          } catch (companyError) {
            console.error('Error handling company:', companyError);
            throw new Error(`Failed to create company "${contactData.companyName}": ${companyError.message}`);
          }
        }
        
        // Clean the data - convert empty strings to null for optional UUID fields
        const { companyName, ...cleanedData } = {
          ...contactData,
          company_id: companyId || null,
          owner_id: contactData.owner_id || user?.id
        };
        
        // Remove any undefined or empty string fields that should be null
        Object.keys(cleanedData).forEach(key => {
          if (cleanedData[key] === '' && ['company_id'].includes(key)) {
            cleanedData[key] = null;
          }
        });
        
        result = await contactsService?.updateContact(selectedContact?.id, cleanedData);
        setSuccess(`Contact "${result?.first_name} ${result?.last_name}" updated successfully!`);
      }
      
      setSelectedContact(result);
      setIsAddingContact(false);
      setIsEditingContact(false);
      
      // Refresh contacts list
      loadContacts();
    } catch (err) {
      console.error('Error saving contact:', err);
      
      // Handle different error formats
      let errorMessage = 'Failed to save contact. Please try again.';
      
      if (err?.message) {
        if (Array.isArray(err.message)) {
          // Handle validation errors (array of error objects)
          errorMessage = err.message.map(error => error.msg || error.message || error).join(', ');
        } else if (typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
    // Find the contact to get their name for the confirmation message
    const contactToDelete = contacts?.find(c => c?.id === contactId);
    const contactName = contactToDelete 
      ? `${contactToDelete.first_name} ${contactToDelete.last_name}` 
      : 'this contact';
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${contactName}?\n\nThis action cannot be undone`
    );
    
    if (!confirmed) {
      return; // User cancelled
    }
    
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
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedContacts?.length} contact(s)?\n\nThis action cannot be undone and will permanently remove:\n• All contact information\n• All associated activities\n• All associated deals\n• All notes and tasks`
    );
    
    if (!confirmed) {
      return; // User cancelled
    }
    
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
      setLoading(true);
      const result = await contactsService?.importContacts(importedContacts);
      
      // Check for errors
      if (result?.error_count > 0 && result?.errors?.length > 0) {
        console.error('Import errors:', result.errors);
        setError(`Import failed with ${result.error_count} errors: ${result.errors.join(', ')}`);
        setLoading(false);
        return;
      }
      
      // Close modal first
      setIsImportModalOpen(false);
      
      // Force reload contacts
      await loadContacts();
      
      // Show success message
      setSuccess(`${result?.imported_count || importedContacts?.length} contact(s) imported successfully!`);
      
      setLoading(false);
    } catch (err) {
      console.error('Error importing contacts:', err);
      setError(err?.message || 'Failed to import contacts. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 xs:pt-16 sm:pt-16">
        <div className="px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="hidden sm:block">
              <Breadcrumb />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 xs:mb-6 gap-3 sm:gap-0">
              <div className="w-full sm:w-auto">
                <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-text-primary">Contact Management</h1>
                <p className="text-xs xs:text-sm text-text-secondary mt-1 hidden xs:block">Manage your customer relationships and communication history</p>
              </div>

              <div className="flex flex-wrap gap-2 xs:gap-3 w-full sm:w-auto">
                {/* View Toggle */}
                <div className="inline-flex items-center border border-border rounded-lg bg-surface flex-shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center space-x-1 xs:space-x-2 px-2.5 xs:px-3 py-2 min-h-touch rounded-l-lg transition-all duration-150 ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                    title="Grid View"
                    aria-label="Grid View"
                  >
                    <Icon name="Grid" size={16} className="xs:w-[18px] xs:h-[18px]" />
                    <span className="hidden sm:inline text-sm">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`inline-flex items-center space-x-1 xs:space-x-2 px-2.5 xs:px-3 py-2 min-h-touch rounded-r-lg transition-all duration-150 ${
                      viewMode === 'split'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                    title="List View"
                    aria-label="List View"
                  >
                    <Icon name="List" size={16} className="xs:w-[18px] xs:h-[18px]" />
                    <span className="hidden sm:inline text-sm">List</span>
                  </button>
                </div>

                {permissionsService.hasPermission(user?.role, 'contacts', 'create') && (
                  <button
                    onClick={handleAddContact}
                    className="btn-primary inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch text-sm xs:text-base flex-shrink-0"
                  >
                    <Icon name="UserPlus" size={16} className="xs:w-[18px] xs:h-[18px]" />
                    <span className="hidden xs:inline">Add Contact</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                )}

                {permissionsService.hasPermission(user?.role, 'contacts', 'import_export') && (
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out text-sm xs:text-base flex-shrink-0"
                  >
                    <Icon name="Upload" size={16} className="xs:w-[18px] xs:h-[18px]" />
                    <span>Import</span>
                  </button>
                )}
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
            
            {/* Search and Tabs */}
            <div className="mb-4 xs:mb-6">
              <div className="relative mb-3 xs:mb-4">
                <div className="absolute inset-y-0 left-0 pl-2.5 xs:pl-3 flex items-center pointer-events-none">
                  <Icon name="Search" size={16} className="xs:w-[18px] xs:h-[18px] text-text-tertiary" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="input-field pl-8 xs:pl-10 text-sm xs:text-base min-h-touch"
                />
              </div>

              <div className="flex border-b border-border overflow-x-auto -mx-3 px-3 xs:mx-0 xs:px-0 scrollbar-hide">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium whitespace-nowrap min-h-touch flex items-center ${
                    activeTab === 'all' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Contacts
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium whitespace-nowrap min-h-touch flex items-center ${
                    activeTab === 'active' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('inactive')}
                  className={`px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium whitespace-nowrap min-h-touch flex items-center ${
                    activeTab === 'inactive' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Inactive
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium whitespace-nowrap min-h-touch flex items-center ${
                    activeTab === 'my' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  My Contacts
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
            ) : viewMode === 'grid' ? (
              /* Grid View - Show all contacts as cards */
              <div className="bg-surface rounded-lg border border-border shadow-sm p-3 xs:p-4 sm:p-6">
                <ContactGrid
                  contacts={filteredContacts}
                  onContactSelect={handleContactSelect}
                  onDeleteContact={handleDeleteContact}
                />
              </div>
            ) : (
              /* Split View - Contact List + Detail */
              <div className="flex flex-col lg:flex-row gap-4 xs:gap-6">
                {/* Contact List (Left Panel) */}
                <div className="w-full lg:w-1/3 xl:w-1/4">
                  <div className="bg-surface rounded-lg border border-border shadow-sm">
                    {/* List Header with Actions */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <button
                        onClick={handleBackToGrid}
                        className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
                        title="Back to grid view"
                      >
                        <Icon name="ArrowLeft" size={16} />
                        <span className="text-sm">Back to Grid</span>
                      </button>
                      
                      {selectedContacts?.length > 0 && (
                        <div className="flex space-x-2">
                          {permissionsService.hasPermission(user?.role, 'contacts', 'import_export') && (
                            <button
                              onClick={() => setIsExportModalOpen(true)}
                              className="text-text-secondary hover:text-text-primary"
                              title="Export Selected"
                            >
                              <Icon name="Download" size={16} />
                            </button>
                          )}
                          {permissionsService.hasPermission(user?.role, 'contacts', 'delete_own') && (
                            <button
                              onClick={handleBulkDelete}
                              className="text-error hover:text-error-600"
                              title="Delete Selected"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          )}
                          {selectedContacts?.length === 2 && permissionsService.hasPermission(user?.role, 'contacts', 'merge_duplicates') && (
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