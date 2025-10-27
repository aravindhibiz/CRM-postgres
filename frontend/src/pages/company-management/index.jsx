import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Icon from 'components/AppIcon';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import CompanyGrid from './components/CompanyGrid';
import CompanyDetail from './components/CompanyDetail';
import CompanyForm from './components/CompanyForm';
import FilterPanel from './components/FilterPanel';
import CompanyStats from './components/CompanyStats';
import ImportCompaniesModal from './components/ImportCompaniesModal';
import ExportCompaniesModal from './components/ExportCompaniesModal';
import { companiesService } from '../../services/companiesService';
import { useAuth } from '../../contexts/AuthContext';

const CompanyManagement = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // State management
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'split'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: [],
    size: [],
    location: [],
    revenueRange: null
  });
  const [stats, setStats] = useState(null);

  // Load companies data
  const loadCompanies = async () => {
    try {
      console.log('DEBUG: loadCompanies() called');
      setLoading(true);

      let companiesData = [];
      if (searchQuery) {
        console.log('DEBUG: Loading companies with search:', searchQuery);
        companiesData = await companiesService.searchCompanies(searchQuery);
      } else if (Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) {
        console.log('DEBUG: Loading companies with filters:', filters);
        companiesData = await companiesService.filterCompanies(filters);
      } else {
        console.log('DEBUG: Loading all companies');
        companiesData = await companiesService.getAllCompanies();
      }

      console.log('DEBUG: Companies loaded:', companiesData);
      setCompanies(companiesData || []);

      // If URL has companyId, load that company
      if (companyId && !selectedCompany) {
        const company = await companiesService.getCompanyById(companyId);
        if (company) {
          setSelectedCompany(company);
          setViewMode('split');
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      toast.error('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      console.log('DEBUG: loadStats() called');
      const statsData = await companiesService.getCompanyStats();
      console.log('DEBUG: Stats loaded:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading company statistics:', err);
    }
  };

  useEffect(() => {
    console.log('DEBUG: useEffect triggered - user:', user, 'searchQuery:', searchQuery, 'filters:', filters, 'activeTab:', activeTab, 'companyId:', companyId);
    if (user) {
      console.log('DEBUG: User exists, loading companies and stats');
      loadCompanies();
      loadStats();
    } else {
      console.log('DEBUG: No user, skipping load');
    }
  }, [user, searchQuery, filters, activeTab, companyId]);

  // Filter companies based on active tab
  const filteredCompanies = companies?.filter(company => {
    if (activeTab === 'my') {
      return company?.owner_id === user?.id;
    }
    // Add more tab filters as needed
    return true; // 'all' tab
  });

  const handleCompanySelect = async (company) => {
    try {
      if (company?.id) {
        const fullCompanyData = await companiesService.getCompanyById(company.id);
        setSelectedCompany(fullCompanyData);
        navigate(`/company-management/${company.id}`);
      } else {
        setSelectedCompany(company);
      }
      setViewMode('split');
      setIsAddingCompany(false);
      setIsEditingCompany(false);
    } catch (error) {
      console.error('Error in handleCompanySelect:', error);
      setSelectedCompany(company);
      setViewMode('split');
      toast.error('Could not load full company details.');
    }
  };

  const handleCompanyMultiSelect = (companyId) => {
    setSelectedCompanies(prev => {
      const newSelected = prev?.includes(companyId)
        ? prev?.filter(id => id !== companyId)
        : [...(prev || []), companyId];
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedCompanies?.length === filteredCompanies?.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies?.map(company => company?.id));
    }
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsAddingCompany(true);
    setIsEditingCompany(false);
    setViewMode('split');
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setIsEditingCompany(true);
    setIsAddingCompany(false);
    setViewMode('split');
  };

  const handleSaveCompany = async (companyData) => {
    try {
      if (isEditingCompany && selectedCompany?.id) {
        const updated = await companiesService.updateCompany(selectedCompany.id, companyData);
        toast.success('Company updated successfully!');
        setSelectedCompany(updated);
        setIsEditingCompany(false);
      } else {
        const created = await companiesService.createCompany(companyData);
        toast.success('Company created successfully!');
        setSelectedCompany(created);
        setIsAddingCompany(false);
      }

      loadCompanies();
      loadStats();
    } catch (err) {
      console.error('Error saving company:', err);
      toast.error(err?.message || 'Failed to save company. Please try again.');
      throw err;
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      await companiesService.deleteCompany(companyId);
      toast.success('Company deleted successfully!');

      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
        setViewMode('grid');
        navigate('/company-management');
      }

      loadCompanies();
      loadStats();
    } catch (err) {
      console.error('Error deleting company:', err);
      toast.error('Failed to delete company. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCompanies.length === 0) {
      toast.error('Please select companies to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCompanies.length} companies? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(selectedCompanies.map(id => companiesService.deleteCompany(id)));
      toast.success(`${selectedCompanies.length} companies deleted successfully!`);
      setSelectedCompanies([]);
      setSelectedCompany(null);
      setViewMode('grid');
      loadCompanies();
      loadStats();
    } catch (err) {
      console.error('Error bulk deleting companies:', err);
      toast.error('Failed to delete some companies. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setIsAddingCompany(false);
    setIsEditingCompany(false);
    if (!selectedCompany) {
      setViewMode('grid');
      navigate('/company-management');
    }
  };

  const handleImportSuccess = () => {
    loadCompanies();
    loadStats();
    setIsImportModalOpen(false);
    toast.success('Companies imported successfully!');
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      industry: [],
      size: [],
      location: [],
      revenueRange: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(f =>
    f && (Array.isArray(f) ? f.length > 0 : true)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-16">
        <Breadcrumb />

        <div className="px-6 py-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Company Management</h1>
                <p className="text-text-secondary mt-1">
                  Manage your company relationships and information
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* View Toggle */}
                <div className="inline-flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => {
                      setViewMode('grid');
                      setSelectedCompany(null);
                      setIsAddingCompany(false);
                      setIsEditingCompany(false);
                      navigate('/company-management');
                    }}
                    className={`px-3 py-2 rounded-l-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                    title="Grid View"
                  >
                    <Icon name="Grid" size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-2 rounded-r-lg border-l border-border transition-colors ${
                      viewMode === 'split'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                    title="Split View"
                  >
                    <Icon name="List" size={18} />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    hasActiveFilters || showFilters
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <Icon name="Filter" size={18} />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {filters.industry.length + filters.size.length + filters.location.length}
                    </span>
                  )}
                </button>

                {/* Import */}
                {hasPermission('companies.import_export') && (
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    <Icon name="Upload" size={18} />
                    <span>Import</span>
                  </button>
                )}

                {/* Export */}
                {hasPermission('companies.import_export') && (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    <Icon name="Download" size={18} />
                    <span>Export</span>
                  </button>
                )}

                {/* Add Company */}
                {hasPermission('companies.create') && (
                  <button
                    onClick={handleAddCompany}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Icon name="Plus" size={18} />
                    <span>Add Company</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-6 border-b border-border">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                All Companies
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'my'
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                My Companies
              </button>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <CompanyStats stats={stats} className="mb-6" />
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                placeholder="Search companies by name, industry, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  <Icon name="X" size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Bulk Actions */}
          {selectedCompanies.length > 0 && (
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
              <span className="text-text-primary font-medium">
                {selectedCompanies.length} companies selected
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedCompanies([])}
                  className="px-3 py-1.5 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Clear Selection
                </button>
                {(hasPermission('companies.delete_all') || hasPermission('companies.delete_own')) && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-error text-white rounded-lg hover:bg-error-600 transition-colors"
                  >
                    Delete Selected
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <CompanyGrid
              companies={filteredCompanies}
              onCompanySelect={handleCompanySelect}
              onDeleteCompany={handleDeleteCompany}
              onEditCompany={handleEditCompany}
              selectedCompanies={selectedCompanies}
              onMultiSelect={handleCompanyMultiSelect}
              onSelectAll={handleSelectAll}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel - Company List */}
              <div className="lg:col-span-4 space-y-4">
                <CompanyGrid
                  companies={filteredCompanies}
                  onCompanySelect={handleCompanySelect}
                  onDeleteCompany={handleDeleteCompany}
                  onEditCompany={handleEditCompany}
                  selectedCompanies={selectedCompanies}
                  onMultiSelect={handleCompanyMultiSelect}
                  compact={true}
                />
              </div>

              {/* Right Panel - Detail/Form */}
              <div className="lg:col-span-8">
                <div className="bg-surface rounded-lg border border-border shadow-sm">
                  {isAddingCompany || isEditingCompany ? (
                    <CompanyForm
                      company={isEditingCompany ? selectedCompany : null}
                      onSubmit={handleSaveCompany}
                      onCancel={handleCancelForm}
                    />
                  ) : selectedCompany ? (
                    <CompanyDetail
                      company={selectedCompany}
                      onEdit={() => handleEditCompany(selectedCompany)}
                      onDelete={() => handleDeleteCompany(selectedCompany.id)}
                      onClose={() => {
                        setSelectedCompany(null);
                        setViewMode('grid');
                        navigate('/company-management');
                      }}
                    />
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Building2" size={32} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        Select a Company
                      </h3>
                      <p className="text-text-secondary">
                        Choose a company from the list to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isImportModalOpen && (
        <ImportCompaniesModal
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {isExportModalOpen && (
        <ExportCompaniesModal
          companies={filteredCompanies}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyManagement;
