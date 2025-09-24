// src/pages/settings-administration/components/CustomFields.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CustomFields = () => {
  const [fields, setFields] = useState([
    {
      id: 1,
      name: 'Lead Source',
      type: 'select',
      entity: 'contact',
      required: true,
      options: ['Website', 'Social Media', 'Referral', 'Cold Call'],
      placement: 'contact_form',
      createdAt: '2024-01-10'
    },
    {
      id: 2,
      name: 'Annual Revenue',
      type: 'number',
      entity: 'contact',
      required: false,
      validation: { min: 0, max: 999999999 },
      placement: 'contact_detail',
      createdAt: '2024-01-08'
    },
    {
      id: 3,
      name: 'Deal Priority',
      type: 'select',
      entity: 'deal',
      required: true,
      options: ['Low', 'Medium', 'High', 'Critical'],
      placement: 'deal_form',
      createdAt: '2024-01-05'
    }
  ]);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'text',
    entity: 'contact',
    required: false,
    options: [''],
    validation: {},
    placement: 'contact_form'
  });

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: 'Type' },
    { value: 'textarea', label: 'Long Text', icon: 'AlignLeft' },
    { value: 'number', label: 'Number', icon: 'Hash' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'phone', label: 'Phone', icon: 'Phone' },
    { value: 'url', label: 'URL', icon: 'Link' },
    { value: 'date', label: 'Date', icon: 'Calendar' },
    { value: 'select', label: 'Dropdown', icon: 'ChevronDown' },
    { value: 'checkbox', label: 'Checkbox', icon: 'Check' },
    { value: 'radio', label: 'Radio Button', icon: 'Circle' }
  ];

  const entities = [
    { value: 'contact', label: 'Contact' },
    { value: 'deal', label: 'Deal' },
    { value: 'activity', label: 'Activity' }
  ];

  const placements = {
    contact: [
      { value: 'contact_form', label: 'Contact Form' },
      { value: 'contact_detail', label: 'Contact Detail View' },
      { value: 'contact_list', label: 'Contact List' }
    ],
    deal: [
      { value: 'deal_form', label: 'Deal Form' },
      { value: 'deal_detail', label: 'Deal Detail View' },
      { value: 'pipeline_card', label: 'Pipeline Card' }
    ],
    activity: [
      { value: 'activity_form', label: 'Activity Form' },
      { value: 'activity_detail', label: 'Activity Detail View' }
    ]
  };

  const handleCreateField = () => {
    setEditingField(null);
    setFieldForm({
      name: '',
      type: 'text',
      entity: 'contact',
      required: false,
      options: [''],
      validation: {},
      placement: 'contact_form'
    });
    setShowFieldModal(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldForm({
      name: field?.name,
      type: field?.type,
      entity: field?.entity,
      required: field?.required,
      options: field?.options || [''],
      validation: field?.validation || {},
      placement: field?.placement
    });
    setShowFieldModal(true);
  };

  const handleDeleteField = (fieldId) => {
    setFields(prev => prev?.filter(field => field?.id !== fieldId));
  };

  const handleSaveField = (e) => {
    e?.preventDefault();
    
    if (editingField) {
      setFields(prev =>
        prev?.map(field =>
          field?.id === editingField?.id
            ? { ...field, ...fieldForm }
            : field
        )
      );
    } else {
      const newField = {
        id: Date.now(),
        ...fieldForm,
        createdAt: new Date()?.toISOString()?.split('T')?.[0]
      };
      setFields(prev => [...prev, newField]);
    }
    
    setShowFieldModal(false);
    setEditingField(null);
  };

  const addOption = () => {
    setFieldForm(prev => ({
      ...prev,
      options: [...prev?.options, '']
    }));
  };

  const updateOption = (index, value) => {
    setFieldForm(prev => ({
      ...prev,
      options: prev?.options?.map((option, i) => i === index ? value : option)
    }));
  };

  const removeOption = (index) => {
    setFieldForm(prev => ({
      ...prev,
      options: prev?.options?.filter((_, i) => i !== index)
    }));
  };

  const getTypeIcon = (type) => {
    const fieldType = fieldTypes?.find(ft => ft?.value === type);
    return fieldType?.icon || 'Type';
  };

  const getEntityBadge = (entity) => {
    const colors = {
      contact: 'bg-primary-50 text-primary border-primary-100',
      deal: 'bg-success-50 text-success border-success-100',
      activity: 'bg-accent-50 text-accent border-accent-100'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${colors?.[entity] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        {entity?.charAt(0)?.toUpperCase() + entity?.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Custom Fields</h2>
          <p className="text-text-secondary mt-1">Create and manage custom fields for your data</p>
        </div>
        <button
          onClick={handleCreateField}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Create Field</span>
        </button>
      </div>
      {/* Fields List */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Field Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Entity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Required</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Placement</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields?.map((field) => (
                <tr key={field?.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Icon name={getTypeIcon(field?.type)} size={16} className="text-text-tertiary" />
                      <span className="font-medium text-text-primary">{field?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary capitalize">{field?.type}</td>
                  <td className="py-3 px-4">{getEntityBadge(field?.entity)}</td>
                  <td className="py-3 px-4">
                    {field?.required ? (
                      <Icon name="Check" size={16} className="text-success" />
                    ) : (
                      <Icon name="X" size={16} className="text-text-tertiary" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {placements?.[field?.entity]?.find(p => p?.value === field?.placement)?.label || field?.placement}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{field?.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditField(field)}
                        className="p-1 text-text-secondary hover:text-primary transition-colors duration-150"
                      >
                        <Icon name="Edit3" size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field?.id)}
                        className="p-1 text-text-secondary hover:text-error transition-colors duration-150"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create/Edit Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowFieldModal(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full relative z-1300 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {editingField ? 'Edit Field' : 'Create New Field'}
                  </h3>
                  <button
                    onClick={() => setShowFieldModal(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveField} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Field Name</label>
                      <input
                        type="text"
                        value={fieldForm?.name}
                        onChange={(e) => setFieldForm(prev => ({ ...prev, name: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="Enter field name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Field Type</label>
                      <select
                        value={fieldForm?.type}
                        onChange={(e) => setFieldForm(prev => ({ ...prev, type: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      >
                        {fieldTypes?.map(type => (
                          <option key={type?.value} value={type?.value}>{type?.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Apply To</label>
                      <select
                        value={fieldForm?.entity}
                        onChange={(e) => setFieldForm(prev => ({ 
                          ...prev, 
                          entity: e?.target?.value, 
                          placement: placements?.[e?.target?.value]?.[0]?.value || ''
                        }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      >
                        {entities?.map(entity => (
                          <option key={entity?.value} value={entity?.value}>{entity?.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Placement</label>
                      <select
                        value={fieldForm?.placement}
                        onChange={(e) => setFieldForm(prev => ({ ...prev, placement: e?.target?.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                      >
                        {placements?.[fieldForm?.entity]?.map(placement => (
                          <option key={placement?.value} value={placement?.value}>{placement?.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={fieldForm?.required}
                        onChange={(e) => setFieldForm(prev => ({ ...prev, required: e?.target?.checked }))}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">Required field</span>
                    </label>
                  </div>
                  
                  {(fieldForm?.type === 'select' || fieldForm?.type === 'radio') && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Options</label>
                      <div className="space-y-2">
                        {fieldForm?.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(index, e?.target?.value)}
                              className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                              placeholder={`Option ${index + 1}`}
                            />
                            {fieldForm?.options?.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-2 text-error hover:bg-error-50 rounded transition-colors duration-150"
                              >
                                <Icon name="X" size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-sm text-primary hover:text-primary-600 flex items-center space-x-1"
                        >
                          <Icon name="Plus" size={14} />
                          <span>Add Option</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowFieldModal(false)}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                    >
                      {editingField ? 'Update Field' : 'Create Field'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Usage Guidelines */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-text-primary text-sm">Custom Field Guidelines</h4>
            <p className="text-text-secondary text-sm mt-1">
              Custom fields appear in forms and detail views based on their placement configuration. 
              Required fields must be filled before saving. Field changes may require cache refresh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomFields;