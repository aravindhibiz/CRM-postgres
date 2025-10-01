import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Pagination from '../../components/Pagination';
import { dealsService } from '../../services/dealsService';
import { configService } from '../../services/configService';

const DealsPage = () => {
  const { user } = useAuth();
  
  // State management
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    try {
      return configService.formatCurrency(value);
    } catch (error) {
      // Fallback to USD if config service fails
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
  };

  // Deal stages configuration
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
    ? deals 
    : deals.filter(deal => deal.stage === selectedStageFilter);

  // Pagination calculations
  const totalItems = filteredDeals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStageFilter]);

  // Handle pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Load deals
  useEffect(() => {
    const loadDeals = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const dealsData = await dealsService?.getUserDeals();
        setDeals(dealsData || []);
      } catch (err) {
        console.error('Error loading deals:', err);
        setError('Failed to load deals. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading deals...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Deals</h2>
              <p className="text-text-secondary">{error}</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Breadcrumb />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Deals</h1>
                <p className="text-text-secondary">Manage your sales opportunities</p>
              </div>
            </div>
          </div>

          {/* Deals List */}
          <div className="bg-surface rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">All Deals</h2>
                <div className="flex items-center space-x-4">
                  {/* Items per page selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-secondary">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="text-sm border border-border rounded-md px-2 py-1 bg-surface"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-text-secondary">
                    {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} 
                    {selectedStageFilter !== 'all' && ` (${deals.length} total)`}
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
                    All Stages ({deals.length})
                  </button>
                  {stages.map(stage => {
                    const stageCount = deals.filter(deal => deal.stage === stage.value).length;
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
            
            {filteredDeals.length === 0 ? (
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
              </div>
            ) : (
              <>
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
                      {paginatedDeals.map((deal) => (
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
                            {formatCurrency(deal.value || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            {deal.probability || 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {new Date(deal.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary hover:text-primary-600">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {filteredDeals.length > 0 && (
                  <div className="px-6 py-4 border-t border-border">
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
        </div>
      </main>
    </div>
  );
};

export default DealsPage;
