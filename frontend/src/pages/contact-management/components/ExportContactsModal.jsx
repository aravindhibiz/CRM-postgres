import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ExportContactsModal = ({ contacts, onClose }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState({
    basicInfo: true,
    contactDetails: true,
    companyInfo: true,
    deals: true,
    activities: false,
    notes: false,
    customFields: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleFieldToggle = (field) => {
    setSelectedFields({
      ...selectedFields,
      [field]: !selectedFields?.[field]
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      console.log('Exporting contacts:', contacts);
      console.log('Export format:', exportFormat);
      console.log('Selected fields:', selectedFields);
      
      // In a real app, this would generate and download the file
      
      setIsExporting(false);
      onClose();
    }, 1000);
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
            <h3 className="text-lg font-semibold text-text-primary">Export Contacts</h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          <div className="px-6 py-5">
            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Exporting {contacts?.length} {contacts?.length === 1 ? 'contact' : 'contacts'}
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Export Format
                </label>
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
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={() => setExportFormat('excel')}
                      className="h-4 w-4 text-primary border-border focus:ring-primary"
                    />
                    <span className="ml-2 text-text-secondary">Excel</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="vcf"
                      checked={exportFormat === 'vcf'}
                      onChange={() => setExportFormat('vcf')}
                      className="h-4 w-4 text-primary border-border focus:ring-primary"
                    />
                    <span className="ml-2 text-text-secondary">vCard</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Fields to Export
                </label>
                <div className="space-y-2 border border-border rounded-lg p-4">
                  <label className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-text-primary">Basic Information (Name, Email)</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.basicInfo}
                      onChange={() => handleFieldToggle('basicInfo')}
                      disabled // Always required
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-text-secondary">Contact Details (Phone)</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.contactDetails}
                      onChange={() => handleFieldToggle('contactDetails')}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-text-secondary">Company Information</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.companyInfo}
                      onChange={() => handleFieldToggle('companyInfo')}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-text-secondary">Deals</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.deals}
                      onChange={() => handleFieldToggle('deals')}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-text-secondary">Activities</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.activities}
                      onChange={() => handleFieldToggle('activities')}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-text-secondary">Notes</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.notes}
                      onChange={() => handleFieldToggle('notes')}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between py-1">
                    <span className="text-text-secondary">Custom Fields</span>
                    <input
                      type="checkbox"
                      checked={selectedFields?.customFields}
                      onChange={() => handleFieldToggle('customFields')}
                      className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary inline-flex items-center"
            >
              {isExporting ? (
                <>
                  <Icon name="Loader" size={16} className="animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportContactsModal;