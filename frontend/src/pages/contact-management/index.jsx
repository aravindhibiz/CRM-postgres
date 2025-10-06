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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load contacts data from Supabase
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
      
      console.log('handleSaveContact called with:', {
        isAddingContact,
        isEditingContact,
        selectedContactId: selectedContact?.id,
        contactData
      });
      
      if (isAddingContact) {
        // Create new contact
        console.log('Creating new contact...');
        
        let companyId = contactData.company_id;
        
        // Handle company creation if companyName is provided but no company_id
        if (contactData.companyName?.trim() && !companyId) {
          console.log('Creating new company:', contactData.companyName);
          
          try {
            // First check if company already exists
            const existingCompanies = await companiesService?.searchCompanies(contactData.companyName?.trim());
            const existingCompany = existingCompanies?.find(
              company => company.name?.toLowerCase() === contactData.companyName?.trim()?.toLowerCase()
            );
            
            if (existingCompany) {
              console.log('Found existing company:', existingCompany);
              companyId = existingCompany.id;
            } else {
              // Create new company
              const newCompany = await companiesService?.createCompany({
                name: contactData.companyName?.trim()
              });
              console.log('Created new company:', newCompany);
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
        console.log('Updating existing contact:', selectedContact?.id);
        
        let companyId = contactData.company_id;
        
        // Handle company creation if companyName is provided but no company_id
        if (contactData.companyName?.trim() && !companyId) {
          console.log('Creating new company for update:', contactData.companyName);
          
          try {
            // First check if company already exists
            const existingCompanies = await companiesService?.searchCompanies(contactData.companyName?.trim());
            const existingCompany = existingCompanies?.find(
              company => company.name?.toLowerCase() === contactData.companyName?.trim()?.toLowerCase()
            );
            
            if (existingCompany) {
              console.log('Found existing company:', existingCompany);
              companyId = existingCompany.id;
            } else {
              // Create new company
              const newCompany = await companiesService?.createCompany({
                name: contactData.companyName?.trim()
              });
              console.log('Created new company:', newCompany);
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
        
        console.log('Cleaned data for update:', cleanedData);
        result = await contactsService?.updateContact(selectedContact?.id, cleanedData);
        console.log('Update result:', result);
        setSuccess(`Contact "${result?.first_name} ${result?.last_name}" updated successfully!`);
      } else {
        console.log('No valid action - missing conditions:', {
          isAddingContact,
          isEditingContact,
          hasSelectedContact: !!selectedContact
        });
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
      
      console.log('Setting error message:', errorMessage);
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
      setLoading(true);
      console.log('Calling import API with contacts:', importedContacts);
      const result = await contactsService?.importContacts(importedContacts);
      console.log('Import result:', result);
      
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
                {permissionsService.hasPermission(user?.role, 'contacts', 'create') && (
                  <button
                    onClick={handleAddContact}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Icon name="UserPlus" size={18} />
                    <span>Add Contact</span>
                  </button>
                )}

                {permissionsService.hasPermission(user?.role, 'contacts', 'import_export') && (
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
                  >
                    <Icon name="Upload" size={18} />
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
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-4 py-2 text-sm font-medium ${
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