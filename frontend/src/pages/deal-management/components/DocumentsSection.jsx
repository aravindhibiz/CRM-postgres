import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import dealDocumentsService from '../../../services/dealDocumentsService';

const DocumentsSection = ({ 
  documents = [], 
  loading = false, 
  dealId, 
  onUploadDocument, 
  onDeleteDocument 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
      await onDeleteDocument?.(doc?.id, doc?.fileUrl);
    } catch (err) {
      alert('Failed to delete document: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDownload = async (doc) => {
    try {
      const url = await dealDocumentsService?.getDocumentUrl(doc?.fileUrl);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc?.name;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
    } catch (err) {
      alert('Failed to download document: ' + (err?.message || 'Unknown error'));
    }
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
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date?.getFullYear() !== new Date()?.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Documents</h3>
          <button
            onClick={() => fileInputRef?.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 text-sm"
          >
            <Icon name="Upload" size={16} />
            <span>Upload</span>
          </button>
        </div>
      </div>
      {/* Upload Area */}
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
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
        />
      </div>
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
                      <span>{doc?.size}</span>
                      <span>•</span>
                      <span>{doc?.uploadedBy}</span>
                      <span>•</span>
                      <span>{formatDate(doc?.uploadedAt)}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-text-tertiary hover:text-primary hover:bg-primary-50 rounded-lg transition-colors duration-150"
                      title="Download"
                    >
                      <Icon name="Download" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 text-text-tertiary hover:text-error hover:bg-error-50 rounded-lg transition-colors duration-150"
                      title="Delete"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsSection;