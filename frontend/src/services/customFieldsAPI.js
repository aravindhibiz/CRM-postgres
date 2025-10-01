import { apiClient } from '../lib/apiClient';

export const customFieldsAPI = {
  // Custom Field Management
  getAllFields: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.entity_type) queryParams.append('entity_type', params.entity_type);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
    if (params.placement) queryParams.append('placement', params.placement);
    
    const response = await apiClient.get(`/api/v1/custom-fields/?${queryParams}`);
    return response.data;
  },

  getField: async (fieldId) => {
    const response = await apiClient.get(`/api/v1/custom-fields/${fieldId}`);
    return response.data;
  },

  createField: async (fieldData) => {
    const response = await apiClient.post('/api/v1/custom-fields/', fieldData);
    return response.data;
  },

  updateField: async (fieldId, fieldData) => {
    const response = await apiClient.put(`/api/v1/custom-fields/${fieldId}`, fieldData);
    return response.data;
  },

  deleteField: async (fieldId) => {
    const response = await apiClient.delete(`/api/v1/custom-fields/${fieldId}`);
    return response.data;
  },

  // Custom Field Values
  getEntityCustomFields: async (entityType, entityId) => {
    const response = await apiClient.get(`/api/v1/custom-fields/values/${entityType}/${entityId}`);
    return response.data;
  },

  createFieldValue: async (valueData) => {
    const response = await apiClient.post('/api/v1/custom-fields/values/', valueData);
    return response.data;
  },

  bulkUpdateFieldValues: async (bulkData) => {
    const response = await apiClient.put('/api/v1/custom-fields/values/bulk', bulkData);
    return response.data;
  },

  deleteEntityFieldValues: async (entityType, entityId) => {
    const response = await apiClient.delete(`/api/v1/custom-fields/values/${entityType}/${entityId}`);
    return response.data;
  },

  // Utility functions
  getFieldTypes: async () => {
    const response = await apiClient.get('/api/v1/custom-fields/types/field-types');
    return response.data;
  },

  getEntityTypes: async () => {
    const response = await apiClient.get('/api/v1/custom-fields/types/entity-types');
    return response.data;
  }
};

// Helper functions for working with custom fields
export const customFieldHelpers = {
  // Format field value for display
  formatFieldValue: (fieldType, value, fieldConfig = {}) => {
    if (!value) return null;

    switch (fieldType) {
      case 'currency':
        const prefix = fieldConfig.prefix || '$';
        const num = parseFloat(value);
        return `${prefix}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      case 'percentage':
        return `${parseFloat(value)}%`;
      
      case 'number':
        return parseFloat(value).toLocaleString();
      
      case 'boolean':
        return value === 'true' || value === true ? 'Yes' : 'No';
      
      case 'multi_select':
        if (typeof value === 'string') {
          return value.split(',').filter(v => v).join(', ');
        }
        return Array.isArray(value) ? value.join(', ') : value;
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      case 'datetime':
        return new Date(value).toLocaleString();
      
      default:
        return value;
    }
  },

  // Validate field value
  validateFieldValue: (field, value) => {
    const { field_type, is_required, field_config = {} } = field;
    const errors = [];

    // Check required
    if (is_required && (!value || value.toString().trim() === '')) {
      errors.push(`${field.name} is required`);
      return errors;
    }

    // Skip validation if empty and not required
    if (!value || value.toString().trim() === '') {
      return errors;
    }

    // Type-specific validation
    switch (field_type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field.name} must be a valid email address`);
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push(`${field.name} must be a valid URL`);
        }
        break;

      case 'number':
      case 'currency':
      case 'percentage':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push(`${field.name} must be a valid number`);
        } else {
          if (field_config.min_value !== undefined && numValue < field_config.min_value) {
            errors.push(`${field.name} must be at least ${field_config.min_value}`);
          }
          if (field_config.max_value !== undefined && numValue > field_config.max_value) {
            errors.push(`${field.name} must be no more than ${field_config.max_value}`);
          }
        }
        break;

      case 'text':
      case 'textarea':
        if (field_config.min_length && value.length < field_config.min_length) {
          errors.push(`${field.name} must be at least ${field_config.min_length} characters`);
        }
        if (field_config.max_length && value.length > field_config.max_length) {
          errors.push(`${field.name} must be no more than ${field_config.max_length} characters`);
        }
        if (field_config.pattern) {
          const regex = new RegExp(field_config.pattern);
          if (!regex.test(value)) {
            errors.push(`${field.name} format is invalid`);
          }
        }
        break;

      case 'select':
        const selectOptions = field_config.options?.map(opt => opt.value) || [];
        if (!selectOptions.includes(value)) {
          errors.push(`${field.name} must be one of the available options`);
        }
        break;

      case 'multi_select':
        const multiSelectOptions = field_config.options?.map(opt => opt.value) || [];
        const selectedValues = typeof value === 'string' ? value.split(',') : (Array.isArray(value) ? value : [value]);
        const invalidValues = selectedValues.filter(v => v && !multiSelectOptions.includes(v));
        if (invalidValues.length > 0) {
          errors.push(`${field.name} contains invalid options: ${invalidValues.join(', ')}`);
        }
        break;
    }

    return errors;
  },

  // Validate all fields
  validateAllFields: (fields, values) => {
    const errors = {};
    fields.forEach(field => {
      const fieldErrors = customFieldHelpers.validateFieldValue(field, values[field.field_key]);
      if (fieldErrors.length > 0) {
        errors[field.field_key] = fieldErrors[0]; // Show first error only
      }
    });
    return errors;
  },

  // Convert form values to API format
  prepareFieldValuesForAPI: (fields, values) => {
    const apiValues = {};
    fields.forEach(field => {
      const value = values[field.field_key];
      if (value !== undefined && value !== null && value !== '') {
        apiValues[field.field_key] = value;
      }
    });
    return apiValues;
  },

  // Group fields by entity type
  groupFieldsByEntity: (fields) => {
    return fields.reduce((groups, field) => {
      if (!groups[field.entity_type]) {
        groups[field.entity_type] = [];
      }
      groups[field.entity_type].push(field);
      return groups;
    }, {});
  },

  // Get fields for specific placement
  getFieldsForPlacement: (fields, placement) => {
    return fields.filter(field => 
      field.placement === placement || field.placement === 'both'
    );
  }
};

export default customFieldsAPI;