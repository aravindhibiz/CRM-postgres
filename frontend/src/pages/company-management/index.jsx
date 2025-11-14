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
      setLoading(true);

      let companiesData = [];
      if (searchQuery) {
        companiesData = await companiesService.searchCompanies(searchQuery);
      } else if (Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) {
        companiesData = await companiesService.filterCompanies(filters);
      } else {
        companiesData = await companiesService.getAllCompanies();
      }

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
      const statsData = await companiesService.getCompanyStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading company statistics:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadCompanies();
      loadStats();
    } else {
    }
  }, [user, searchQuery, filters, companyId]);

  // Filter companies based on active tab
  const filteredCompanies = companies?.filter(company => {
    // Only show all companies since we removed "My Companies" tab
    return true;
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

      <main className="pt-14 xs:pt-16 sm:pt-16">
        <div className="px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-6">
          <div className="hidden sm:block">
            <Breadcrumb />
          </div>

          {/* Header Section */}
          <div className="mb-4 xs:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 xs:gap-4 mb-3 xs:mb-4">
              <div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-text-primary">Company Management</h1>
                <p className="text-text-secondary mt-1 text-xs xs:text-sm hidden xs:block">
                  Manage your company relationships and information
                </p>
              </div>

              <div className="flex items-center gap-2 xs:gap-3 flex-wrap">
                {/* View Toggle */}
                <div className="inline-flex items-center border border-border rounded-lg flex-shrink-0">
                  <button
                    onClick={() => {
                      setViewMode('grid');
                      setSelectedCompany(null);
                      setIsAddingCompany(false);
                      setIsEditingCompany(false);
                      navigate('/company-management');
                    }}
                    className={`px-2.5 xs:px-3 py-2 min-h-touch rounded-l-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                    title="Grid View"
                  >
                    <Icon name="Grid" size={16} className="xs:w-[18px] xs:h-[18px]" />
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 xs:px-3 py-2 min-h-touch rounded-r-lg border-l border-border transition-colors ${
                      viewMode === 'split'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                    title="Split View"
                  >
                    <Icon name="List" size={16} className="xs:w-[18px] xs:h-[18px]" />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch rounded-lg border transition-colors text-xs xs:text-sm flex-shrink-0 ${
                    hasActiveFilters || showFilters
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <Icon name="Filter" size={16} className="xs:w-[18px] xs:h-[18px] flex-shrink-0" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {filters.industry.length + filters.size.length + filters.location.length}
                    </span>
                  )}
                </button>

                {/* Import */}
                {hasPermission('companies.import_export') && (
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors text-xs xs:text-sm flex-shrink-0"
                  >
                    <Icon name="Upload" size={16} className="xs:w-[18px] xs:h-[18px] flex-shrink-0" />
                    <span className="hidden sm:inline">Import</span>
                  </button>
                )}

                {/* Export */}
                {hasPermission('companies.import_export') && (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch rounded-lg border border-border text-text-secondary hover:bg-surface-hover transition-colors text-xs xs:text-sm flex-shrink-0"
                  >
                    <Icon name="Download" size={16} className="xs:w-[18px] xs:h-[18px] flex-shrink-0" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}

                {/* Add Company */}
                {hasPermission('companies.create') && (
                  <button
                    onClick={handleAddCompany}
                    className="inline-flex items-center space-x-1.5 xs:space-x-2 px-3 xs:px-4 py-2 min-h-touch bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-xs xs:text-sm flex-shrink-0"
                  >
                    <Icon name="Plus" size={16} className="xs:w-[18px] xs:h-[18px] flex-shrink-0" />
                    <span className="hidden xs:inline">Add Company</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <CompanyStats stats={stats} className="mb-4 xs:mb-6" />
          )}

          {/* Search Bar */}
          <div className="mb-4 xs:mb-6">
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-2.5 xs:left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary flex-shrink-0"
              />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 xs:pl-10 pr-8 xs:pr-10 py-2 xs:py-2.5 sm:py-3 min-h-touch bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm xs:text-base"
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
            <div className="mb-3 xs:mb-4 p-3 xs:p-4 bg-primary-50 border border-primary-200 rounded-lg flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
              <span className="text-text-primary font-medium text-sm xs:text-base">
                {selectedCompanies.length} companies selected
              </span>
              <div className="flex items-center space-x-2 xs:space-x-3 w-full xs:w-auto">
                <button
                  onClick={() => setSelectedCompanies([])}
                  className="px-2.5 xs:px-3 py-1.5 min-h-touch text-text-secondary hover:text-text-primary transition-colors text-xs xs:text-sm flex-1 xs:flex-none"
                >
                  Clear Selection
                </button>
                {(hasPermission('companies.delete_all') || hasPermission('companies.delete_own')) && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 xs:px-3 py-1.5 min-h-touch bg-error text-white rounded-lg hover:bg-error-600 transition-colors text-xs xs:text-sm flex-1 xs:flex-none"
                  >
                    Delete Selected
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center py-8 xs:py-12">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xs:gap-6">
              {/* Left Panel - Company List */}
              <div className="lg:col-span-4 space-y-3 xs:space-y-4">
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
                    <div className="p-8 xs:p-12 text-center">
                      <div className="w-12 h-12 xs:w-16 xs:h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                        <Icon name="Building2" size={24} className="xs:w-8 xs:h-8 text-primary" />
                      </div>
                      <h3 className="text-lg xs:text-xl font-semibold text-text-primary mb-2">
                        Select a Company
                      </h3>
                      <p className="text-text-secondary text-sm xs:text-base">
                        Choose a company from the list to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
