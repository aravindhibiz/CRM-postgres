import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Icon from 'components/AppIcon';
import { contactsService } from '../../../services/contactsService';
import { campaignsService } from '../../../services/campaignsService';

const AddAudienceModal = ({ campaignId, onClose, onSuccess }) => {
  const [contacts, setContacts] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState('contacts'); // 'contacts' or 'prospects'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => { 
    setIsLoading(true);
    try {
      const [contactsData, prospectsData] = await Promise.all([
        contactsService.getUserContacts(),
        campaignsService.getProspects()
      ]);


      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setProspects(Array.isArray(prospectsData) ? prospectsData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load contacts and prospects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    const currentList = selectedTab === 'contacts' ? filteredContacts : filteredProspects;
    const currentIds = currentList.map(item => item.id);

    if (currentIds.every(id => selectedIds.includes(id))) {
      // Deselect all from current tab
      setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      // Select all from current tab
      setSelectedIds(prev => {
        const newIds = [...prev];
        currentIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one contact or prospect');
      return;
    }

    setIsSubmitting(true);
    try {
      // Separate selected IDs into contacts and prospects
      const selectedContactIds = selectedIds.filter(id =>
        contacts.some(c => c.id === id)
      );
      const selectedProspectIds = selectedIds.filter(id =>
        prospects.some(p => p.id === id)
      );

      // Add audience with both contact and prospect IDs
      await campaignsService.addAudience(campaignId, {
        contact_ids: selectedContactIds,
        prospect_ids: selectedProspectIds
      });

      toast.success(`Added ${selectedIds.length} member${selectedIds.length !== 1 ? 's' : ''} to campaign audience`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding audience:', err);
      toast.error('Failed to add audience members. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    // Check if company is an object or string
    const companyName = typeof contact.company === 'object' && contact.company !== null
      ? (contact.company.name || '')
      : (contact.company || '');

    const matches = (
      (contact.first_name || '').toLowerCase().includes(query) ||
      (contact.last_name || '').toLowerCase().includes(query) ||
      (contact.email || '').toLowerCase().includes(query) ||
      companyName.toLowerCase().includes(query)
    );

    return matches;
  });

  // Filter prospects
  const filteredProspects = prospects.filter(prospect => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    // For prospects, company_name is the field
    const companyName = prospect.company_name || prospect.company || '';

    const matches = (
      (prospect.first_name || '').toLowerCase().includes(query) ||
      (prospect.last_name || '').toLowerCase().includes(query) ||
      (prospect.email || '').toLowerCase().includes(query) ||
      companyName.toLowerCase().includes(query)
    );

    return matches;
  });

  const currentList = selectedTab === 'contacts' ? filteredContacts : filteredProspects;
  const currentListIds = currentList.map(item => item.id);
  const isAllSelected = currentListIds.length > 0 && currentListIds.every(id => selectedIds.includes(id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Add Campaign Audience</h3>
              <p className="text-sm text-text-secondary">
                {selectedIds.length} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <div className="px-6 flex space-x-4">
            <button
              onClick={() => setSelectedTab('contacts')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                selectedTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setSelectedTab('prospects')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                selectedTab === 'prospects'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Prospects ({prospects.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border">
          <div className="relative">
            <Icon
              name="Search"
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              placeholder={`Search ${selectedTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">
                {searchQuery
                  ? `No ${selectedTab} found matching "${searchQuery}"`
                  : `No ${selectedTab} available`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center space-x-3 py-2 px-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">
                  Select All ({currentList.length})
                </span>
              </div>

              {/* List Items */}
              {currentList.map((item) => {
                // Get company name properly
                const companyName = selectedTab === 'contacts'
                  ? (typeof item.company === 'object' && item.company !== null ? item.company.name : item.company)
                  : (item.company_name || item.company);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelection(item.id)}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedIds.includes(item.id)
                        ? 'border-primary bg-primary-50'
                        : 'border-border hover:bg-surface-hover'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                    />
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-medium text-sm">
                        {(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">
                        {item.first_name} {item.last_name}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {item.email || 'No email'}
                        {companyName && ` • ${companyName}`}
                      </div>
                    </div>
                    {selectedTab === 'prospects' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'qualified' ? 'bg-green-100 text-green-800' :
                        item.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedIds.length === 0}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Icon name="UserPlus" size={16} />
                <span>Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAudienceModal;
