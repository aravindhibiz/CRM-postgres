import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';
import exportService from '../services/exportService';

const ExportMenu = ({ 
  analyticsData, 
  filters, 
  chartRefs = {},
  isOpen, 
  onClose,
  className = ""
}) => {
  const [exportStatus, setExportStatus] = useState({
    type: null,
    loading: false,
    success: false,
    error: null
  });

  const [emailSettings, setEmailSettings] = useState({
    recipient: '',
    schedule: 'weekly',
    format: 'pdf'
  });

  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleExport = async (type) => {
    setExportStatus({ type, loading: true, success: false, error: null });
    
    try {
      // Ensure filters is defined with default values
      const safeFilters = filters || { dateRange: 'all', ownerId: 'all' };
      
      let result;
      
      switch (type) {
        case 'csv':
          result = await exportService.exportAnalyticsCSV(analyticsData, safeFilters);
          break;
        case 'excel':
          result = await exportService.exportAnalyticsExcel(analyticsData, safeFilters);
          break;
        case 'pdf':
          result = await exportService.exportAnalyticsPDF(analyticsData, safeFilters, chartRefs);
          break;
        case 'json':
          result = await exportService.exportAnalyticsJSON(analyticsData, safeFilters);
          break;
        default:
          throw new Error('Unknown export type');
      }

      setExportStatus({ 
        type, 
        loading: false, 
        success: true, 
        error: null 
      });

      // Show success message briefly
      setTimeout(() => {
        setExportStatus({ type: null, loading: false, success: false, error: null });
      }, 3000);

    } catch (error) {
      setExportStatus({ 
        type, 
        loading: false, 
        success: false, 
        error: error.message 
      });

      // Clear error after 5 seconds
      setTimeout(() => {
        setExportStatus({ type: null, loading: false, success: false, error: null });
      }, 5000);
    }
  };

  const handleEmailReport = async () => {
    if (!emailSettings.recipient) {
      setExportStatus({ 
        type: 'email', 
        loading: false, 
        success: false, 
        error: 'Please enter a recipient email address' 
      });
      return;
    }

    setExportStatus({ type: 'email', loading: true, success: false, error: null });
    
    try {
      const result = await exportService.scheduleEmailReport(analyticsData, filters, emailSettings);
      
      setExportStatus({ 
        type: 'email', 
        loading: false, 
        success: true, 
        error: null 
      });

      setShowEmailModal(false);
      setEmailSettings({ recipient: '', schedule: 'weekly', format: 'pdf' });

      setTimeout(() => {
        setExportStatus({ type: null, loading: false, success: false, error: null });
      }, 3000);

    } catch (error) {
      setExportStatus({ 
        type: 'email', 
        loading: false, 
        success: false, 
        error: error.message 
      });
    }
  };

  const exportOptions = [
    {
      id: 'excel',
      label: 'Export as Excel',
      icon: 'FileSpreadsheet',
      description: 'Comprehensive data in multiple sheets',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'pdf',
      label: 'Export as PDF',
      icon: 'FileText',
      description: 'Professional report with charts',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      id: 'csv',
      label: 'Export as CSV',
      icon: 'Download',
      description: 'Raw data for analysis',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 'json',
      label: 'Export as JSON',
      icon: 'Code',
      description: 'Structured data for developers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Export Menu */}
      <div className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Choose your preferred export format
          </p>
        </div>

        <div className="p-4 space-y-2">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleExport(option.id)}
              disabled={exportStatus.loading && exportStatus.type === option.id}
              className={`w-full flex items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 ${
                exportStatus.loading && exportStatus.type === option.id
                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                  : `${option.bgColor} ${option.hoverColor} hover:border-gray-200`
              }`}
            >
              <div className={`p-2 rounded-lg ${option.bgColor} mr-3`}>
                {exportStatus.loading && exportStatus.type === option.id ? (
                  <Icon name="Loader2" size={20} className="animate-spin text-gray-600" />
                ) : (
                  <Icon name={option.icon} size={20} className={option.color} />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
              {exportStatus.success && exportStatus.type === option.id && (
                <Icon name="Check" size={16} className="text-green-600" />
              )}
            </button>
          ))}

          {/* Email Report Button */}
          <button
            onClick={() => setShowEmailModal(true)}
            disabled={exportStatus.loading && exportStatus.type === 'email'}
            className="w-full flex items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 bg-indigo-50 hover:bg-indigo-100 hover:border-gray-200"
          >
            <div className="p-2 rounded-lg bg-indigo-50 mr-3">
              {exportStatus.loading && exportStatus.type === 'email' ? (
                <Icon name="Loader2" size={20} className="animate-spin text-gray-600" />
              ) : (
                <Icon name="Mail" size={20} className="text-indigo-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">Schedule Email Report</div>
              <div className="text-sm text-gray-600">Set up automated delivery</div>
            </div>
            {exportStatus.success && exportStatus.type === 'email' && (
              <Icon name="Check" size={16} className="text-green-600" />
            )}
          </button>
        </div>

        {/* Status Messages */}
        {exportStatus.error && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-red-600">
              <Icon name="AlertCircle" size={16} className="mr-2" />
              <span className="text-sm">{exportStatus.error}</span>
            </div>
          </div>
        )}

        {exportStatus.success && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-green-600">
              <Icon name="CheckCircle" size={16} className="mr-2" />
              <span className="text-sm">Export completed successfully!</span>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500">
            <p className="flex items-center">
              <Icon name="Info" size={12} className="mr-1" />
              Reports include current filter settings
            </p>
            <p className="mt-1">
              Data range: {filters.dateRange || 'All Time'} • 
              Rep: {filters.repName || 'All Representatives'}
            </p>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowEmailModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Email Report</h3>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={emailSettings.recipient}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule
                    </label>
                    <select
                      value={emailSettings.schedule}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format
                    </label>
                    <select
                      value={emailSettings.format}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, format: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pdf">PDF Report</option>
                      <option value="excel">Excel Spreadsheet</option>
                      <option value="both">Both PDF & Excel</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmailReport}
                    disabled={exportStatus.loading && exportStatus.type === 'email'}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {exportStatus.loading && exportStatus.type === 'email' ? (
                      <span className="flex items-center justify-center">
                        <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                        Setting up...
                      </span>
                    ) : (
                      'Schedule Report'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ExportMenu;