import React, { useState } from 'react';
import Icon from 'components/AppIcon';

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

  const handleFileChange = (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Mock CSV parsing
      setTimeout(() => {
        // This would normally parse the CSV file
        const mockPreview = [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            company: 'Example Corp',
            position: 'Sales Manager'
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            company: 'Sample Inc',
            position: 'Marketing Director'
          },
          {
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.johnson@example.com',
            phone: '+1 (555) 456-7890',
            company: 'Test LLC',
            position: 'CEO'
          }
        ];
        
        setPreview(mockPreview);
        
        // Auto-map columns based on headers
        setMappings({
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
          phone: 'phone',
          company: 'company',
          position: 'position'
        });
        
        setStep(2);
      }, 500);
    }
  };

  const handleMappingChange = (field, value) => {
    setMappings({
      ...mappings,
      [field]: value
    });
  };

  const handleImport = () => {
    setIsLoading(true);
    
    // Simulate import process
    setTimeout(() => {
      // In a real app, this would process the file with the mappings
      const importedContacts = preview?.map((item, index) => ({
        id: Date.now() + index,
        firstName: item?.[mappings?.firstName] || '',
        lastName: item?.[mappings?.lastName] || '',
        email: item?.[mappings?.email] || '',
        phone: item?.[mappings?.phone] || '',
        company: item?.[mappings?.company] || '',
        position: item?.[mappings?.position] || '',
        avatar: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
        lastContactDate: new Date()?.toISOString(),
        status: 'active',
        tags: [],
        deals: [],
        notes: '',
        socialProfiles: {},
        activities: [],
        customFields: {
          preferredContactMethod: '',
          decisionTimeframe: '',
          budgetRange: ''
        }
      }));
      
      onImport(importedContacts);
      setIsLoading(false);
    }, 1000);
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
                    Upload a CSV or Excel file with your contacts data.
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-8 mb-6">
                  <input
                    type="file"
                    id="contactFile"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="contactFile"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Icon name="FileText" size={36} className="text-text-tertiary mb-3" />
                    <span className="text-text-primary font-medium mb-1">
                      Drag and drop your file here or click to browse
                    </span>
                    <span className="text-sm text-text-tertiary">
                      Supports CSV, Excel (.xlsx, .xls)
                    </span>
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
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        First Name*
                      </label>
                      <select
                        value={mappings?.firstName}
                        onChange={(e) => handleMappingChange('firstName', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        <option value="firstName">firstName</option>
                        <option value="first_name">first_name</option>
                        <option value="FirstName">FirstName</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Last Name*
                      </label>
                      <select
                        value={mappings?.lastName}
                        onChange={(e) => handleMappingChange('lastName', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        <option value="lastName">lastName</option>
                        <option value="last_name">last_name</option>
                        <option value="LastName">LastName</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Email*
                      </label>
                      <select
                        value={mappings?.email}
                        onChange={(e) => handleMappingChange('email', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        <option value="email">email</option>
                        <option value="email_address">email_address</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Phone
                      </label>
                      <select
                        value={mappings?.phone}
                        onChange={(e) => handleMappingChange('phone', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        <option value="phone">phone</option>
                        <option value="phone_number">phone_number</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Company*
                      </label>
                      <select
                        value={mappings?.company}
                        onChange={(e) => handleMappingChange('company', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        <option value="company">company</option>
                        <option value="company_name">company_name</option>
                        <option value="Company">Company</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Position
                      </label>
                      <select
                        value={mappings?.position}
                        onChange={(e) => handleMappingChange('position', e?.target?.value)}
                        className="input-field"
                      >
                        <option value="">Select column</option>
                        <option value="position">position</option>
                        <option value="title">title</option>
                        <option value="job_title">job_title</option>
                        <option value="Position">Position</option>
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
                disabled={isLoading || !mappings?.firstName || !mappings?.lastName || !mappings?.email || !mappings?.company}
                className={`btn-primary inline-flex items-center ${
                  isLoading || !mappings?.firstName || !mappings?.lastName || !mappings?.email || !mappings?.company
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