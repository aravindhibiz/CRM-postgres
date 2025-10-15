import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/AppIcon';

const ExportDealsModal = ({ deals, onClose, filters }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Prepare export data based on format
      const exportData = prepareExportData(deals);
      
      if (exportFormat === 'csv') {
        downloadCSV(exportData);
      } else if (exportFormat === 'json') {
        downloadJSON(exportData);
      }
      
      // Close modal after successful export
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  const prepareExportData = (deals) => {
    return deals.map(deal => ({
      name: deal.name || '',
      stage: deal.stage || '',
      value: deal.value || 0,
      probability: deal.probability || 0,
      expected_close_date: deal.expected_close_date || '',
      company: deal.company?.name || '',
      contact: deal.contact?.name || '',
      owner: deal.owner?.name || '',
      description: deal.description || '',
      source: deal.source || '',
      next_action: deal.next_action || '',
      created_at: deal.created_at || '',
      updated_at: deal.updated_at || ''
    }));
  };

  const downloadCSV = (data) => {
    const headers = [
      'Name',
      'Stage',
      'Value',
      'Probability (%)',
      'Expected Close Date',
      'Company',
      'Contact',
      'Owner',
      'Description',
      'Source',
      'Next Action',
      'Created At',
      'Updated At'
    ];

    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        escapeCSV(row.name),
        escapeCSV(row.stage),
        row.value,
        row.probability,
        escapeCSV(row.expected_close_date),
        escapeCSV(row.company),
        escapeCSV(row.contact),
        escapeCSV(row.owner),
        escapeCSV(row.description),
        escapeCSV(row.source),
        escapeCSV(row.next_action),
        escapeCSV(row.created_at),
        escapeCSV(row.updated_at)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `deals_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  return (
    <div className="fixed inset-0 z-1100 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text-primary">Export Deals</h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          <div className="px-6 py-5">
            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Exporting {deals?.length} {deals?.length === 1 ? 'deal' : 'deals'}
                {filters && Object.keys(filters).length > 0 && ' with applied filters'}
              </p>
              
              <div className="mb-6">
                <div className="block text-sm font-medium text-text-primary mb-2">
                  Export Format
                </div>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="h-4 w-4 text-primary border-border focus:ring-primary"
                    />
                    <span className="ml-2 text-text-secondary">CSV</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={() => setExportFormat('json')}
                      className="h-4 w-4 text-primary border-border focus:ring-primary"
                    />
                    <span className="ml-2 text-text-secondary">JSON</span>
                  </label>
                </div>
              </div>

              <div className="bg-surface-hover border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Export includes:</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Deal information (name, stage, value, probability)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Associated company and contact details</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Owner and timeline information</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span>Descriptions and next actions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-surface-hover border-t border-border flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Icon name="Loader" size={16} className="animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ExportDealsModal.propTypes = {
  deals: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object
};

export default ExportDealsModal;
