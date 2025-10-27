import React, { useState } from 'react';
import Papa from 'papaparse';
import Icon from 'components/AppIcon';

const ExportCompaniesModal = ({ companies, onClose }) => {
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState([
    'name',
    'industry',
    'size',
    'website',
    'phone',
    'email',
    'city',
    'state',
    'country'
  ]);
  const [exporting, setExporting] = useState(false);

  const availableFields = [
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'size', label: 'Company Size' },
    { key: 'website', label: 'Website' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Street Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip_code', label: 'Zip Code' },
    { key: 'country', label: 'Country' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created Date' },
    { key: 'updated_at', label: 'Updated Date' }
  ];

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(availableFields.map(f => f.key));
    }
  };

  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '';
    if (key === 'created_at' || key === 'updated_at') {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }

    setExporting(true);

    try {
      // Prepare data for export
      const exportData = companies.map(company => {
        const row = {};
        selectedFields.forEach(field => {
          const fieldConfig = availableFields.find(f => f.key === field);
          row[fieldConfig?.label || field] = formatValue(company[field], field);
        });
        return row;
      });

      if (format === 'csv') {
        // Export as CSV
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        // Export as JSON
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `companies_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export companies. Please try again.');
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary flex items-center">
            <Icon name="Download" size={24} className="mr-2" />
            Export Companies
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
            disabled={exporting}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Export Info */}
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-700">
              <Icon name="Info" size={16} className="inline mr-2" />
              Exporting <span className="font-semibold">{companies.length}</span> companies
            </p>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  format === 'csv'
                    ? 'border-primary bg-primary-50'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="FileText" size={20} className={format === 'csv' ? 'text-primary' : 'text-text-secondary'} />
                  <span className={`font-medium ${format === 'csv' ? 'text-primary' : 'text-text-secondary'}`}>
                    CSV
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-1">Spreadsheet format</p>
              </button>

              <button
                onClick={() => setFormat('json')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  format === 'json'
                    ? 'border-primary bg-primary-50'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Code" size={20} className={format === 'json' ? 'text-primary' : 'text-text-secondary'} />
                  <span className={`font-medium ${format === 'json' ? 'text-primary' : 'text-text-secondary'}`}>
                    JSON
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-1">Data format</p>
              </button>
            </div>
          </div>

          {/* Field Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-text-primary">
                Select Fields to Export
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:underline"
              >
                {selectedFields.length === availableFields.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 border border-border rounded-lg">
              {availableFields.map(field => (
                <label
                  key={field.key}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-surface-hover p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => handleFieldToggle(field.key)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">{field.label}</span>
                </label>
              ))}
            </div>

            <p className="text-xs text-text-tertiary mt-2">
              {selectedFields.length} of {availableFields.length} fields selected
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedFields.length === 0 || exporting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {exporting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <Icon name="Download" size={18} />
            <span>{exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportCompaniesModal;
