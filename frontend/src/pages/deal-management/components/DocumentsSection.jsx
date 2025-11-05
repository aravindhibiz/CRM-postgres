import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import dealDocumentsService from '../../../services/dealDocumentsService';
import TextFilePreview from './TextFilePreview';
import CsvPreview from './CsvPreview';
import ExcelPreview from './ExcelPreview';
import WordPreview from './WordPreview';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DocumentsSection = ({
  documents = [],
  loading = false,
  dealId,
  onUploadDocument,
  onDeleteDocument,
  readOnly = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const documentTypes = [
    { value: 'proposal', label: 'Proposal', icon: 'FileText', color: 'text-blue-600' },
    { value: 'contract', label: 'Contract', icon: 'FileCheck', color: 'text-green-600' },
    { value: 'presentation', label: 'Presentation', icon: 'Presentation', color: 'text-purple-600' },
    { value: 'other', label: 'Other', icon: 'File', color: 'text-gray-600' }
  ];

  const getFileIcon = (filename) => {
    const extension = dealDocumentsService?.getFileExtension(filename);
    const iconName = dealDocumentsService?.getFileIcon(filename);
    return iconName;
  };

  const handleFileSelect = (files) => {
    if (!files || files?.length === 0) return;
    
    Array.from(files)?.forEach(file => {
      handleUpload(file);
    });
  };

  const handleUpload = async (file, documentType = 'other') => {
    if (!dealId || !file) return;

    // File validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file?.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      await onUploadDocument?.(file, documentType);
    } catch (err) {
      alert('Failed to upload document: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc?.name}"?`)) {
      return;
    }

    try {
      // Use fetch with authentication to delete the document
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1/deals/documents/${doc?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Delete failed');
      }

      // Call the parent component's delete handler to update the UI
      await onDeleteDocument?.(doc?.id);
    } catch (err) {
      alert('Failed to delete document: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDownload = async (doc) => {
    try {
      // Use fetch with authentication to download the file
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1/deals/documents/${doc?.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the blob and create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc?.name || 'download';
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download document: ' + (err?.message || 'Unknown error'));
    }
  };

  const handlePreview = async (doc) => {
    try {
      setPreviewDocument(doc);
      
      // Use fetch with authentication to get the file
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1/deals/documents/${doc?.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Preview failed');
      }

      // Get the blob and create a preview URL
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (err) {
      alert('Failed to preview document: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewDocument(null);
  };

  const isImageFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension);
  };

  const isPdfFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return extension === 'pdf';
  };

  const isTextFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['txt', 'log', 'md', 'json', 'xml', 'yml', 'yaml'].includes(extension);
  };

  const isCsvFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return extension === 'csv';
  };

  const isExcelFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['xlsx', 'xls'].includes(extension);
  };

  const isWordFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['docx', 'doc'].includes(extension);
  };

  const isPreviewSupported = (filename) => {
    return isImageFile(filename) || isPdfFile(filename) || isTextFile(filename) ||
           isCsvFile(filename) || isExcelFile(filename) || isWordFile(filename);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOver(false);
    
    const files = e?.dataTransfer?.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDragOver(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date?.getFullYear() !== new Date()?.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const numBytes = parseInt(bytes);
    if (isNaN(numBytes)) return bytes; // Return as-is if already formatted
    
    if (numBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Documents</h3>
          {dealId && !readOnly && (
            <button
              onClick={() => fileInputRef?.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 text-sm"
            >
              <Icon name="Upload" size={16} />
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Show message if no dealId (creating new deal) */}
      {!dealId ? (
        <div className="p-6">
          <div className="text-center py-8">
            <Icon name="FileText" size={32} className="text-text-tertiary mx-auto mb-2" />
            <p className="text-text-secondary">Save the deal first to upload documents</p>
            <p className="text-sm text-text-tertiary mt-1">Documents can be added after creating the deal</p>
          </div>
        </div>
      ) : (
        <>
          {/* Upload Area - Hide in read-only mode */}
          {!readOnly && (
            <div className="p-6 border-b border-border">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef?.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-150 ${
                  dragOver
                    ? 'border-primary bg-primary-50' :'border-border hover:border-border-hover hover:bg-background'
                }`}
              >
                <Icon
                  name="Upload"
                  size={24}
                  className={`mx-auto mb-2 ${dragOver ? 'text-primary' : 'text-text-tertiary'}`}
                />
                <p className="text-sm text-text-secondary">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Maximum file size: 10MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e?.target?.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,.log,.md,.json,.xml,.yml,.yaml,.zip,.rar"
              />
            </div>
          )}
          {/* Documents List */}
          <div className="p-6">
            {uploading && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-800">Uploading document...</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-text-secondary">Loading documents...</span>
              </div>
            ) : documents?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileText" size={32} className="text-text-tertiary mx-auto mb-2" />
                <p className="text-text-secondary">No documents uploaded</p>
                <p className="text-sm text-text-tertiary mt-1">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents?.map((doc) => {
                  const iconName = getFileIcon(doc?.name);
                  
                  return (
                    <div 
                      key={doc?.id} 
                      className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border hover:border-border-hover transition-colors duration-150"
                    >
                      {/* File Icon */}
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name={iconName} size={20} className="text-blue-600" />
                      </div>
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-text-primary truncate">
                            {doc?.name}
                          </h4>
                          {doc?.documentType && doc?.documentType !== 'other' && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {documentTypes?.find(t => t?.value === doc?.documentType)?.label || doc?.documentType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-text-tertiary">
                          <span>{formatFileSize(doc?.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(doc?.created_at)}</span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="p-2 text-text-tertiary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="Preview"
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-text-tertiary hover:text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                          title="Download"
                        >
                          <Icon name="Download" size={16} />
                        </button>
                        {!readOnly && (
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-2 text-text-tertiary hover:text-error hover:bg-error-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-surface rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Icon name={getFileIcon(previewDocument?.name)} size={24} className="text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{previewDocument?.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {formatFileSize(previewDocument?.file_size)} • {formatDate(previewDocument?.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(previewDocument)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                  title="Download"
                >
                  <Icon name="Download" size={20} />
                </button>
                <button
                  onClick={handleClosePreview}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors duration-150"
                  title="Close"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
              {isImageFile(previewDocument?.name) ? (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewUrl}
                    alt={previewDocument?.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : isPdfFile(previewDocument?.name) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] rounded-lg shadow-lg"
                  title={previewDocument?.name}
                />
              ) : isTextFile(previewDocument?.name) ? (
                <TextFilePreview fileUrl={previewUrl} fileName={previewDocument?.name} />
              ) : isCsvFile(previewDocument?.name) ? (
                <CsvPreview fileUrl={previewUrl} fileName={previewDocument?.name} />
              ) : isExcelFile(previewDocument?.name) ? (
                <ExcelPreview fileUrl={previewUrl} fileName={previewDocument?.name} />
              ) : isWordFile(previewDocument?.name) ? (
                <WordPreview fileUrl={previewUrl} fileName={previewDocument?.name} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Icon name="FileText" size={64} className="text-text-tertiary mb-4" />
                  <h4 className="text-xl font-semibold text-text-primary mb-2">Preview not available</h4>
                  <p className="text-text-secondary mb-4">
                    Preview is not available for this file type.
                  </p>
                  <button
                    onClick={() => handleDownload(previewDocument)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Icon name="Download" size={16} />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;