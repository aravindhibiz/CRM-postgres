import React from 'react';
import { Calendar, Phone, Mail, Link } from 'lucide-react';
import Select from './ui/Select';

const CustomFieldInput = ({ 
  field, 
  value, 
  onChange, 
  error,
  disabled = false 
}) => {
  // Add safety checks for field object
  if (!field || typeof field !== 'object') {
    console.error('CustomFieldInput: field prop is required and must be an object', field);
    return null;
  }

  const { 
    field_type = 'text', 
    name = 'Unnamed Field', 
    placeholder = '', 
    help_text = '', 
    is_required = false, 
    field_config = {},
    field_key = ''
  } = field;

  const handleChange = (newValue) => {
    if (field_key && onChange) {
      onChange(field_key, newValue);
    }
  };

  const renderField = () => {
    switch (field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            maxLength={field_config?.max_length}
            minLength={field_config?.min_length}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
            maxLength={field_config?.max_length}
            minLength={field_config?.min_length}
          />
        );

      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <div className="relative">
            {field_config?.prefix && (
              <span className="absolute left-3 top-2 text-gray-500">
                {field_config.prefix}
              </span>
            )}
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100' : ''} ${
                field_config?.prefix ? 'pl-8' : ''
              } ${field_config?.suffix ? 'pr-8' : ''}`}
              min={field_config?.min_value}
              max={field_config?.max_value}
              step={field_type === 'percentage' ? '0.01' : field_config?.decimal_places ? `0.${'0'.repeat(field_config.decimal_places - 1)}1` : '0.01'}
            />
            {field_config?.suffix && (
              <span className="absolute right-3 top-2 text-gray-500">
                {field_config.suffix}
              </span>
            )}
          </div>
        );

      case 'email':
        return (
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || 'email@example.com'}
              disabled={disabled}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100' : ''}`}
            />
          </div>
        );

      case 'phone':
        return (
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || '+1 (555) 123-4567'}
              disabled={disabled}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100' : ''}`}
            />
          </div>
        );

      case 'url':
        return (
          <div className="relative">
            <Link className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || 'https://example.com'}
              disabled={disabled}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100' : ''}`}
            />
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100' : ''}`}
              min={field_config?.min_date}
              max={field_config?.max_date}
            />
          </div>
        );

      case 'datetime':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="datetime-local"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${disabled ? 'bg-gray-100' : ''}`}
              min={field_config?.min_date}
              max={field_config?.max_date}
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === 'true' || value === true}
              onChange={(e) => handleChange(e.target.checked.toString())}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-900">
              {placeholder || 'Yes'}
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
          >
            <option value="">Select an option...</option>
            {field_config.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multi_select':
        const multiSelectOptions = field_config.options?.map(option => ({
          value: option.value,
          label: option.label
        })) || [];
        
        const multiSelectValue = value ? (value || '').split(',').filter(v => v) : [];
        
        return (
          <Select
            multiple={true}
            options={multiSelectOptions}
            value={multiSelectValue}
            onChange={(newValue) => {
              // Convert array back to comma-separated string
              handleChange(Array.isArray(newValue) ? newValue.join(',') : '');
            }}
            placeholder="Select options..."
            disabled={disabled}
            searchable={multiSelectOptions.length > 5}
            className={error ? 'border-red-500' : ''}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : ''}`}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {name}
        {is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderField()}
      
      {help_text && (
        <p className="mt-1 text-xs text-gray-500">{help_text}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// Component to render multiple custom fields
export const CustomFieldsGroup = ({ 
  fields, 
  values = {}, 
  onChange, 
  errors = {},
  disabled = false 
}) => {
  // Safety checks
  if (!Array.isArray(fields) || fields.length === 0) {
    return null;
  }

  if (!onChange) {
    console.error('CustomFieldsGroup: onChange prop is required');
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Custom Fields
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => {
          // Use fallback key if field.id is not available
          const fieldKey = field?.id || field?.field_key || `field-${index}`;
          
          return (
            <CustomFieldInput
              key={fieldKey}
              field={field}
              value={values[field?.field_key] || ''}
              onChange={onChange}
              error={errors[field?.field_key]}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CustomFieldInput;