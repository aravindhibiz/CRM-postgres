import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const FilterPanel = ({ filters, onApplyFilters, onClearFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Consulting',
    'Media',
    'Transportation',
    'Energy',
    'Hospitality',
    'Telecommunications',
    'Agriculture',
    'Construction',
    'Legal',
    'Other'
  ];

  const sizeOptions = [
    'Small (1-50)',
    'Medium (51-250)',
    'Large (251-1000)',
    'Enterprise (1000+)'
  ];

  const handleIndustryToggle = (industry) => {
    setLocalFilters(prev => ({
      ...prev,
      industry: prev.industry.includes(industry)
        ? prev.industry.filter(i => i !== industry)
        : [...prev.industry, industry]
    }));
  };

  const handleSizeToggle = (size) => {
    setLocalFilters(prev => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  const handleLocationChange = (value) => {
    if (value && !localFilters.location.includes(value)) {
      setLocalFilters(prev => ({
        ...prev,
        location: [...prev.location, value]
      }));
    }
  };

  const handleRemoveLocation = (location) => {
    setLocalFilters(prev => ({
      ...prev,
      location: prev.location.filter(l => l !== location)
    }));
  };

  const handleRevenueChange = (type, value) => {
    setLocalFilters(prev => ({
      ...prev,
      revenueRange: {
        ...prev.revenueRange,
        [type]: value ? parseInt(value) : null
      }
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      industry: [],
      size: [],
      location: [],
      revenueRange: null
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters =
    localFilters.industry.length > 0 ||
    localFilters.size.length > 0 ||
    localFilters.location.length > 0 ||
    (localFilters.revenueRange && (localFilters.revenueRange.min || localFilters.revenueRange.max));

  return (
    <div className="mb-6 p-6 bg-surface border border-border rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <Icon name="Filter" size={20} className="mr-2" />
          Filter Companies
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Industry Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Industry</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {industryOptions.map(industry => (
              <label
                key={industry}
                className="flex items-center space-x-2 cursor-pointer hover:bg-surface-hover p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={localFilters.industry.includes(industry)}
                  onChange={() => handleIndustryToggle(industry)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">{industry}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company Size Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Company Size</h4>
          <div className="space-y-2">
            {sizeOptions.map(size => (
              <label
                key={size}
                className="flex items-center space-x-2 cursor-pointer hover:bg-surface-hover p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={localFilters.size.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Location</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter city or state"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLocationChange(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {localFilters.location.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localFilters.location.map(location => (
                  <span
                    key={location}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-50 text-primary text-xs rounded-full"
                  >
                    <span>{location}</span>
                    <button
                      onClick={() => handleRemoveLocation(location)}
                      className="hover:text-primary-700"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revenue Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">Revenue Range ($)</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Minimum</label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.revenueRange?.min || ''}
                onChange={(e) => handleRevenueChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Maximum</label>
              <input
                type="number"
                placeholder="No limit"
                value={localFilters.revenueRange?.max || ''}
                onChange={(e) => handleRevenueChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <button
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className="text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear All Filters
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
