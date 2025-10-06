import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Papa from 'papaparse';

const ImportContactsModal = ({ onImport, onClose }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [mappings, setMappings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: ''
  });
  const [preview, setPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [parseError, setParseError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setIsLoading(true);

    // Parse CSV file
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors && results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            setParseError('Error parsing file. Please check the format.');
            setIsLoading(false);
            return;
          }

          if (!results.data || results.data.length === 0) {
            setParseError('The file is empty or has no valid data.');
            setIsLoading(false);
            return;
          }

          // Get headers from the first row keys
          const headers = Object.keys(results.data[0] || {});
          setFileHeaders(headers);

          // Store preview data
          setPreview(results.data);

          // Auto-map columns based on common header names
          const autoMappings = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            position: ''
          };

          // Try to auto-detect column mappings
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase().trim();

            if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
              autoMappings.firstName = header;
            } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
              autoMappings.lastName = header;
            } else if (lowerHeader.includes('email')) {
              autoMappings.email = header;
            } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) {
              autoMappings.phone = header;
            } else if (lowerHeader.includes('company') || lowerHeader.includes('organization')) {
              autoMappings.company = header;
            } else if (lowerHeader.includes('position') || lowerHeader.includes('title') || lowerHeader.includes('job')) {
              autoMappings.position = header;
            }
          });

          setMappings(autoMappings);
          setStep(2);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing file:', error);
          setParseError('Failed to process the file. Please try again.');
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        setParseError('Failed to parse the file. Please ensure it\'s a valid CSV file.');
        setIsLoading(false);
      }
    });
  };

  const handleMappingChange = (field, value) => {
    setMappings({
      ...mappings,
      [field]: value
    });
  };

  const handleImport = async () => {
    setIsLoading(true);
    setParseError(null);

    try {
      // Transform the data to match the backend schema
      const importedContacts = preview
        .filter(item => {
          // Ensure required fields are present
          const firstName = item?.[mappings?.firstName];
          const lastName = item?.[mappings?.lastName];
          return firstName && lastName && firstName.trim() && lastName.trim();
        })
        .map(item => {
          const contact = {
            first_name: (item?.[mappings?.firstName] || '').trim(),
            last_name: (item?.[mappings?.lastName] || '').trim(),
            status: 'active'
          };
          
          // Only include optional fields if they have values
          const email = (item?.[mappings?.email] || '').trim();
          if (email) contact.email = email;
          
          const phone = (item?.[mappings?.phone] || '').trim();
          if (phone) contact.phone = phone;
          
          const companyName = (item?.[mappings?.company] || '').trim();
          if (companyName) contact.company_name = companyName;
          
          const position = (item?.[mappings?.position] || '').trim();
          if (position) contact.position = position;
          
          return contact;
        });

      console.log('Importing contacts:', importedContacts);

      if (importedContacts.length === 0) {
        setParseError('No valid contacts found. Please ensure firstName and lastName are provided for all contacts.');
        setIsLoading(false);
        return;
      }

      await onImport(importedContacts);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error preparing import data:', error);
      setParseError('Failed to prepare import data. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1100 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text-primary">Import Contacts</h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          <div className="px-6 py-5">
            {/* Step 1: File Upload */}
            {step === 1 && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Upload" size={24} className="text-primary" />
                  </div>
                  <h4 className="text-lg font-medium text-text-primary mb-2">Upload Contact File</h4>
                  <p className="text-text-secondary mb-4">
                    Upload a CSV file with your contacts data.
                  </p>
                </div>

                {/* Error Message */}
                {parseError && (
                  <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error text-sm">
                    {parseError}
                  </div>
                )}

                {/* Loading Message */}
                {isLoading && (
                  <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg text-primary text-sm flex items-center justify-center">
                    <Icon name="Loader" size={16} className="animate-spin mr-2" />
                    Parsing file...
                  </div>
                )}
                
                <div className="border-2 border-dashed border-border rounded-lg p-8 mb-6">
                  <input
                    type="file"
                    id="contactFile"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="contactFile"
                    className={`cursor-pointer flex flex-col items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon name="FileText" size={36} className="text-text-tertiary mb-3" />
                    <span className="text-text-primary font-medium mb-1">
                      Drag and drop your file here or click to browse
                    </span>
                    <span className="text-sm text-text-tertiary">
                      Supports CSV files
                    </span>
                    {file && !isLoading && (
                      <span className="text-sm text-primary mt-2">
                        Selected: {file.name}
                      </span>
                    )}
                  </label>
                </div>
                
                <div className="text-sm text-text-secondary">
                  <p className="mb-2">Your file should include the following columns:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>First Name</li>
                    <li>Last Name</li>
                    <li>Email Address</li>
                    <li>Phone Number (optional)</li>
                    <li>Company Name</li>
                    <li>Position/Title (optional)</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Step 2: Map Fields */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-text-primary mb-2">Map Fields</h4>
                  <p className="text-text-secondary">
                    Match your file columns to the appropriate contact fields.
                  </p>
                </div>

                {/* Error Message */}
                {parseError && (
                  <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error text-sm">
                    {parseError}
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        First Name* (Required)
                      </label>
                      <select
                        value={mappings?.firstName}
                        onChange={(e) => handleMappingChange('firstName', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        {fileHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Last Name* (Required)
                      </label>
                      <select
                        value={mappings?.lastName}
                        onChange={(e) => handleMappingChange('lastName', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        {fileHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Email (Optional)
                      </label>
                      <select
                        value={mappings?.email}
                        onChange={(e) => handleMappingChange('email', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        {fileHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Phone (Optional)
                      </label>
                      <select
                        value={mappings?.phone}
                        onChange={(e) => handleMappingChange('phone', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        {fileHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Company (Optional)
                      </label>
                      <select
                        value={mappings?.company}
                        onChange={(e) => handleMappingChange('company', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        {fileHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Position (Optional)
                      </label>
                      <select
                        value={mappings?.position}
                        onChange={(e) => handleMappingChange('position', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        {fileHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg overflow-hidden mb-6">
                  <div className="px-4 py-3 bg-surface-hover text-sm font-medium text-text-primary">
                    Preview ({preview?.length} records)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-surface-hover text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            First Name
                          </th>
                          <th className="px-4 py-3 bg-surface-hover text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Last Name
                          </th>
                          <th className="px-4 py-3 bg-surface-hover text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 bg-surface-hover text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Company
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-border">
                        {preview?.slice(0, 3)?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                              {item?.[mappings?.firstName] || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                              {item?.[mappings?.lastName] || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                              {item?.[mappings?.email] || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary">
                              {item?.[mappings?.company] || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-border flex justify-between">
            {step === 1 ? (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back
              </button>
            )}
            
            {step === 1 ? (
              <button
                disabled={!file}
                className={`btn-primary ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleImport}
                disabled={isLoading || !mappings?.firstName || !mappings?.lastName}
                className={`btn-primary inline-flex items-center ${
                  isLoading || !mappings?.firstName || !mappings?.lastName
                    ? 'opacity-50 cursor-not-allowed' :''
                }`}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader" size={16} className="animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import Contacts
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportContactsModal;