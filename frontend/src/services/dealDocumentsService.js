import apiClient from '../lib/apiClient';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const dealDocumentsService = {
  // Get all documents for a specific deal
  async getDealDocuments(dealId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/deals/${dealId}/documents`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching deal documents:', err);
      throw err;
    }
  },

  // Upload a new document for a deal
  async uploadDealDocument(dealId, file, fileName = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use fetch to handle FormData properly
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1/deals/${dealId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it automatically with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error uploading deal document:', err);
      throw err;
    }
  },

  // Delete a deal document
  async deleteDealDocument(documentId) {
    try {
      const { data, error } = await apiClient.delete(`/api/v1/documents/${documentId}`);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting deal document:', err);
      throw err;
    }
  },

  // Get download URL for a document
  async getDocumentDownloadUrl(documentId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/documents/${documentId}/download`);

      if (error) throw error;
      return data?.download_url || null;
    } catch (err) {
      console.error('Error getting document download URL:', err);
      throw err;
    }
  },

  // Subscribe to deal documents changes (placeholder)
  subscribeToDealDocuments(dealId, callback) {
    // Since we don't have real-time updates, return a stub
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  },

  // Alias methods for compatibility
  async uploadDocument(file, dealId, documentType = 'other') {
    return this.uploadDealDocument(dealId, file, `${documentType}_${file.name}`);
  },

  async deleteDocument(documentId, filePath = null) {
    return this.deleteDealDocument(documentId);
  },

  // Subscribe to document changes (alias for compatibility)
  subscribeToDocumentChanges(dealId, callback) {
    return this.subscribeToDealDocuments(dealId, callback);
  },

  // Unsubscribe from document changes (alias for compatibility)
  unsubscribeFromDocumentChanges(subscription) {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
  },

  // Utility methods for file handling
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  },

  getFileIcon(filename) {
    const extension = this.getFileExtension(filename);
    const iconMap = {
      // Documents
      pdf: 'FileText',
      doc: 'FileText',
      docx: 'FileText',
      txt: 'FileText',
      
      // Spreadsheets
      xls: 'FileSpreadsheet',
      xlsx: 'FileSpreadsheet',
      csv: 'FileSpreadsheet',
      
      // Presentations
      ppt: 'Presentation',
      pptx: 'Presentation',
      
      // Images
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
      gif: 'Image',
      svg: 'Image',
      
      // Archives
      zip: 'FileArchive',
      rar: 'FileArchive',
      '7z': 'FileArchive',
      
      // Default
      default: 'File'
    };
    
    return iconMap[extension] || iconMap.default;
  },

  async getDocumentUrl(documentId) {
    // Return the download URL for a document
    return `/api/v1/deals/documents/${documentId}/download`;
  }
};

export default dealDocumentsService;