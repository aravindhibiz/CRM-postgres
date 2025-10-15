import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings } from 'lucide-react';
import { customFieldsAPI } from '../services/customFieldsAPI';

const CustomFieldsManager = () => {
  const [customFields, setCustomFields] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entityFilter, setEntityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'multi_select', label: 'Multi Select' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'currency', label: 'Currency' },
    { value: 'percentage', label: 'Percentage' }
  ];

  const entityTypes = [
    { value: 'contact', label: 'Contact' },
    { value: 'company', label: 'Company' },
    { value: 'deal', label: 'Deal' },
    { value: 'activity', label: 'Activity' },
    { value: 'task', label: 'Task' }
  ];

  const placementTypes = [
    { value: 'form', label: 'Form Only' },
    { value: 'detail_view', label: 'Detail View Only' },
    { value: 'both', label: 'Both Form and Detail View' }
  ];

  // Fetch custom fields
  const fetchCustomFields = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customFieldsAPI.getAllFields();
      setCustomFields(data || []);
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
      setError('Failed to load custom fields. Please try again.');
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const CustomFieldForm = ({ field, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: field?.name || '',
      description: field?.description || '',
      field_type: field?.field_type || 'text',
      entity_type: field?.entity_type || 'contact',
      is_required: field?.is_required || false,
      placement: field?.placement || 'both',
      field_config: field?.field_config || {},
      help_text: field?.help_text || '',
      placeholder: field?.placeholder || ''
    });

    const [selectOptions, setSelectOptions] = useState(
      field?.field_config?.options || [{ value: '', label: '' }]
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      let finalConfig = { ...formData.field_config };
      
      // Handle select field options
      if (formData.field_type === 'select' || formData.field_type === 'multi_select') {
        finalConfig.options = selectOptions.filter(opt => opt.value && opt.label);
      }

      const fieldData = {
        ...formData,
        field_config: finalConfig
      };

      try {
        if (field) {
          await customFieldsAPI.updateField(field.id, fieldData);
        } else {
          await customFieldsAPI.createField(fieldData);
        }
        
        onSave();
        fetchCustomFields();
      } catch (error) {
        console.error('Failed to save custom field:', error);
      }
    };

    const addSelectOption = () => {
      setSelectOptions([...selectOptions, { value: '', label: '' }]);
    };

    const updateSelectOption = (index, field, value) => {
      const updated = selectOptions.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      );
      setSelectOptions(updated);
    };

    const removeSelectOption = (index) => {
      setSelectOptions(selectOptions.filter((_, i) => i !== index));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {field ? 'Edit Custom Field' : 'Create Custom Field'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type *
                </label>
                <select
                  value={formData.field_type}
                  onChange={(e) => setFormData({...formData, field_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type *
                </label>
                <select
                  value={formData.entity_type}
                  onChange={(e) => setFormData({...formData, entity_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!field} // Can't change entity type when editing
                >
                  {entityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placement
                </label>
                <select
                  value={formData.placement}
                  onChange={(e) => setFormData({...formData, placement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {placementTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Help Text
                </label>
                <input
                  type="text"
                  value={formData.help_text}
                  onChange={(e) => setFormData({...formData, help_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={formData.is_required}
                onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="required" className="text-sm font-medium text-gray-700">
                Required Field
              </label>
            </div>

            {(formData.field_type === 'select' || formData.field_type === 'multi_select') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                {selectOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) => updateSelectOption(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={option.label}
                      onChange={(e) => updateSelectOption(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectOption(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSelectOption}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Option
                </button>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save size={16} className="mr-2" />
                {field ? 'Update' : 'Create'} Field
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const deleteField = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this custom field? This action cannot be undone.')) {
      try {
        await customFieldsAPI.deleteField(fieldId);
        fetchCustomFields();
      } catch (error) {
        console.error('Failed to delete custom field:', error);
      }
    }
  };

  // Filter custom fields based on entity type
  const filteredFields = entityFilter === 'all' 
    ? customFields 
    : customFields.filter(field => field.entity_type === entityFilter);

  // Get count for each entity type
  const getEntityCount = (entityType) => {
    if (entityType === 'all') return customFields.length;
    return customFields.filter(field => field.entity_type === entityType).length;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredFields.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFields = filteredFields.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  const handleFilterChange = (filter) => {
    setEntityFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3" />
            Custom Fields
          </h1>
          <p className="text-gray-600 mt-1">Create and manage custom fields for your data</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Field
        </button>
      </div>

      {/* Entity Filter Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow p-2 flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            entityFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({getEntityCount('all')})
        </button>
        {entityTypes.map((entity) => (
          <button
            key={entity.value}
            onClick={() => handleFilterChange(entity.value)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              entityFilter === entity.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {entity.label} ({getEntityCount(entity.value)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Items per page selector and info */}
          <div className="bg-white rounded-lg shadow px-6 py-3 mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries per page</span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredFields.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredFields.length)} of {filteredFields.length} entries
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto" style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedFields && paginatedFields.length > 0 ? paginatedFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{field.name}</div>
                      {field.description && (
                        <div className="text-sm text-gray-500">{field.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {field.field_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {field.entity_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.is_required ? (
                      <span className="text-red-600">✓</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {field.placement.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(field.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingField(field)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteField(field.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    {loading ? 'Loading custom fields...' : 
                     error ? error : 
                     entityFilter !== 'all' 
                       ? `No custom fields found for ${entityTypes.find(e => e.value === entityFilter)?.label}. Create your first ${entityTypes.find(e => e.value === entityFilter)?.label} custom field to get started.`
                       : 'No custom fields found. Create your first custom field to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredFields.length > 0 && totalPages > 1 && (
            <div className="bg-white rounded-lg shadow px-6 py-4 mt-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-2">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CustomFieldForm
          onSave={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {editingField && (
        <CustomFieldForm
          field={editingField}
          onSave={() => setEditingField(null)}
          onCancel={() => setEditingField(null)}
        />
      )}
    </div>
  );
};

export default CustomFieldsManager;