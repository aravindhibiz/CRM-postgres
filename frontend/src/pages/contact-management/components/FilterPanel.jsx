import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const FilterPanel = ({ filters, setFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState({ ...filters });
  
  // Mock data for filter options
  const companies = [
    "Acme Corporation", 
    "Globex Industries", 
    "Soylent Corp", 
    "Initech", 
    "Umbrella Corporation", 
    "Wayne Enterprises", 
    "Stark Industries", 
    "Cyberdyne Systems"
  ];
  
  const dealStages = [
    "discovery", 
    "proposal", 
    "negotiation", 
    "closed-won", 
    "closed-lost"
  ];
  
  const tags = [
    "enterprise", 
    "mid-market", 
    "small-business", 
    "tech", 
    "manufacturing", 
    "healthcare", 
    "finance", 
    "marketing", 
    "operations", 
    "security", 
    "decision-maker", 
    "influencer", 
    "procurement", 
    "fast-growth", 
    "innovation"
  ];

  const handleCompanyChange = (company) => {
    if (localFilters?.company?.includes(company)) {
      setLocalFilters({
        ...localFilters,
        company: localFilters?.company?.filter(c => c !== company)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        company: [...localFilters?.company, company]
      });
    }
  };

  const handleDealStageChange = (stage) => {
    if (localFilters?.dealStage?.includes(stage)) {
      setLocalFilters({
        ...localFilters,
        dealStage: localFilters?.dealStage?.filter(s => s !== stage)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        dealStage: [...localFilters?.dealStage, stage]
      });
    }
  };

  const handleTagChange = (tag) => {
    if (localFilters?.tags?.includes(tag)) {
      setLocalFilters({
        ...localFilters,
        tags: localFilters?.tags?.filter(t => t !== tag)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        tags: [...localFilters?.tags, tag]
      });
    }
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      company: [],
      dealStage: [],
      lastContactDate: null,
      tags: []
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onClose();
  };

  return (
    <div className="bg-surface rounded-lg border border-border shadow-md mb-6">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-medium text-text-primary">Filter Contacts</h3>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary"
        >
          <Icon name="X" size={18} />
        </button>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">Company</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {companies?.map(company => (
              <label key={company} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters?.company?.includes(company)}
                  onChange={() => handleCompanyChange(company)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-text-secondary">{company}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Deal Stage Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">Deal Stage</h4>
          <div className="space-y-2">
            {dealStages?.map(stage => (
              <label key={stage} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters?.dealStage?.includes(stage)}
                  onChange={() => handleDealStageChange(stage)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-text-secondary capitalize">
                  {stage?.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Tags Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">Tags</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tags?.map(tag => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters?.tags?.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-text-secondary">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border flex justify-end space-x-3">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="btn-primary text-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;