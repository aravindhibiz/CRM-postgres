import apiClient from '../lib/apiClient';

export const storageService = {
  // Get storage configuration
  async getStorageConfig() {
    try {
      const { data, error } = await apiClient.get('/api/v1/storage/config');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching storage config:', err);
      throw err;
    }
  },

  // Check storage health
  async checkStorageHealth() {
    try {
      const { data, error } = await apiClient.get('/api/v1/storage/health');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking storage health:', err);
      throw err;
    }
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  // Check if file extension is allowed
  isAllowedFileType(filename, allowedExtensions = []) {
    if (!allowedExtensions || allowedExtensions.length === 0) return true;
    
    const extension = '.' + filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
  },

  // Validate file before upload
  validateFile(file, config = {}) {
    const errors = [];
    
    // Check file size
    if (config.max_file_size && file.size > config.max_file_size) {
      const maxSizeMB = Math.round(config.max_file_size / (1024 * 1024));
      errors.push(`File size exceeds ${maxSizeMB}MB limit`);
    }
    
    // Check file type
    if (config.allowed_extensions && !this.isAllowedFileType(file.name, config.allowed_extensions)) {
      errors.push('File type not allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};