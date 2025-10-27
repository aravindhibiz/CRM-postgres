import React, { useState } from 'react';
import Papa from 'papaparse';
import Icon from 'components/AppIcon';
import { companiesService } from '../../../services/companiesService';

const ImportCompaniesModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Parse CSV for preview
    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreview(results.data);
      },
      error: (err) => {
        setError('Failed to parse file: ' + err.message);
      }
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setImporting(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const companies = results.data;
        setProgress({ current: 0, total: companies.length });

        try {
          const importedCompanies = [];

          for (let i = 0; i < companies.length; i++) {
            const companyData = companies[i];

            // Map CSV columns to company fields
            const company = {
              name: companyData.name || companyData.Name || companyData.company_name,
              industry: companyData.industry || companyData.Industry || null,
              size: companyData.size || companyData.Size || companyData.company_size || null,
              website: companyData.website || companyData.Website || null,
              phone: companyData.phone || companyData.Phone || null,
              email: companyData.email || companyData.Email || null,
              address: companyData.address || companyData.Address || null,
              city: companyData.city || companyData.City || null,
              state: companyData.state || companyData.State || null,
              zip_code: companyData.zip_code || companyData['Zip Code'] || null,
              country: companyData.country || companyData.Country || null,
              description: companyData.description || companyData.Description || null,
              revenue: companyData.revenue || companyData.Revenue ?
                parseInt(companyData.revenue || companyData.Revenue) : null
            };

            // Skip if no name
            if (!company.name) continue;

            try {
              const created = await companiesService.createCompany(company);
              importedCompanies.push(created);
              setProgress({ current: i + 1, total: companies.length });
            } catch (err) {
              console.error(`Failed to import company ${company.name}:`, err);
              // Continue with next company
            }
          }

          setImporting(false);
          onSuccess(importedCompanies);
        } catch (err) {
          console.error('Import error:', err);
          setError('Failed to import companies: ' + err.message);
          setImporting(false);
        }
      },
      error: (err) => {
        setError('Failed to parse file: ' + err.message);
        setImporting(false);
      }
    });
  };

  const downloadTemplate = () => {
    const template = `name,industry,size,website,phone,email,address,city,state,zip_code,country,revenue,description
Acme Corporation,Technology,Large (251-1000),www.acme.com,+1-555-123-4567,info@acme.com,123 Tech St,San Francisco,CA,94102,United States,5000000,Leading technology company
Example Inc,Healthcare,Medium (51-250),www.example.com,+1-555-987-6543,contact@example.com,456 Health Ave,Boston,MA,02101,United States,2000000,Healthcare provider`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary flex items-center">
            <Icon name="Upload" size={24} className="mr-2" />
            Import Companies
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
            disabled={importing}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h3 className="font-semibold text-primary mb-2 flex items-center">
              <Icon name="Info" size={18} className="mr-2" />
              Instructions
            </h3>
            <ul className="text-sm text-primary-700 space-y-1 ml-6 list-disc">
              <li>Upload a CSV file with company information</li>
              <li>Required field: name (company name)</li>
              <li>Optional fields: industry, size, website, phone, email, address, city, state, zip_code, country, revenue, description</li>
              <li>Download the template below for reference</li>
            </ul>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
            >
              <Icon name="Download" size={18} />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
                className="block w-full text-sm text-text-secondary
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-white
                  hover:file:bg-primary-600
                  file:cursor-pointer cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-text-secondary">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-error font-medium">Error</p>
                <p className="text-error-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !importing && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-primary mb-3">
                Preview (first 5 rows)
              </h3>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-surface-hover">
                    <tr>
                      {Object.keys(preview[0]).map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((row, index) => (
                      <tr key={index} className="hover:bg-surface-hover">
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 text-sm text-text-primary whitespace-nowrap"
                          >
                            {value || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">
                  Importing companies...
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {importing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{importing ? 'Importing...' : 'Import Companies'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCompaniesModal;
