import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { useAuth } from '../../../contexts/AuthContext';

const CompanyGrid = ({
  companies,
  onCompanySelect,
  onDeleteCompany,
  onEditCompany,
  selectedCompanies = [],
  onMultiSelect,
  onSelectAll,
  compact = false
}) => {
  const { hasPermission } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getIndustryIcon = (industry) => {
    const industryMap = {
      'technology': 'Laptop',
      'healthcare': 'Heart',
      'finance': 'DollarSign',
      'retail': 'ShoppingCart',
      'manufacturing': 'Settings',
      'education': 'GraduationCap',
      'real estate': 'Home',
      'consulting': 'Briefcase',
      'media': 'Tv',
      'transportation': 'Truck',
    };
    return industryMap[industry?.toLowerCase()] || 'Building2';
  };

  const getSizeColor = (size) => {
    const sizeMap = {
      'small': 'bg-blue-100 text-blue-700',
      'medium': 'bg-green-100 text-green-700',
      'large': 'bg-purple-100 text-purple-700',
      'enterprise': 'bg-orange-100 text-orange-700',
    };
    return sizeMap[size?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (companies?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Building2" size={24} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">No Companies Found</h3>
        <p className="text-text-secondary">Try adjusting your search or filters, or add a new company.</p>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
      {companies?.map(company => (
        <div
          key={company?.id}
          className={`bg-surface rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden ${
            compact ? 'flex items-center p-4' : ''
          }`}
          onClick={() => onCompanySelect?.(company)}
        >
          {/* Compact View */}
          {compact ? (
            <>
              {/* Checkbox */}
              {onMultiSelect && (
                <div
                  className="mr-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedCompanies?.includes(company?.id)}
                    onChange={() => onMultiSelect(company?.id)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                </div>
              )}

              {/* Industry Icon */}
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Icon name={getIndustryIcon(company?.industry)} size={20} className="text-primary" />
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-text-primary truncate">{company?.name}</h4>
                <p className="text-sm text-text-secondary truncate">
                  {company?.industry || 'No industry'} • {company?.size || 'Unknown size'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {(hasPermission('companies.edit_all') || hasPermission('companies.edit_own')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCompany?.(company);
                    }}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-primary-50 transition-colors"
                    title="Edit company"
                  >
                    <Icon name="Edit2" size={16} />
                  </button>
                )}
                {(hasPermission('companies.delete_all') || hasPermission('companies.delete_own')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this company?')) {
                        onDeleteCompany?.(company?.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-error-50 transition-colors"
                    title="Delete company"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Grid Card View */
            <>
              {/* Card Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-750">
                {/* Actions */}
                <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(hasPermission('companies.edit_all') ||  hasPermission('companies.edit_own')) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCompany?.(company);
                      }}
                      className="p-1.5 rounded-lg bg-surface/80 backdrop-blur-sm text-text-tertiary hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-all"
                      title="Edit company"
                    >
                      <Icon name="Edit2" size={16} />
                    </button>
                  )}
                  {(hasPermission('companies.delete_all') || hasPermission('companies.delete_own')) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this company?')) {
                          onDeleteCompany?.(company?.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-surface/80 backdrop-blur-sm text-text-tertiary hover:text-error hover:bg-error-50 dark:hover:bg-error-900/50 transition-all"
                      title="Delete company"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  )}
                </div>

                {/* Checkbox */}
                {onMultiSelect && (
                  <div
                    className="absolute top-3 left-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompanies?.includes(company?.id)}
                      onChange={() => onMultiSelect(company?.id)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </div>
                )}

                {/* Company Logo/Icon */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    {company?.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-surface shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-surface border-4 border-surface shadow-md flex items-center justify-center">
                        <Icon name={getIndustryIcon(company?.industry)} size={32} className="text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Name */}
                <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white truncate px-8">
                  {company?.name || 'Unnamed Company'}
                </h3>

                {/* Industry Badge */}
                {company?.industry && (
                  <div className="flex justify-center mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-border">
                      {company.industry}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Company Size */}
                {company?.size && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Size:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSizeColor(company.size)}`}>
                      {company.size}
                    </span>
                  </div>
                )}

                {/* Location */}
                {(company?.city || company?.state || company?.country) && (
                  <div className="flex items-start space-x-2">
                    <Icon name="MapPin" size={14} className="text-text-tertiary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary truncate">
                      {[company?.city, company?.state, company?.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Website */}
                {company?.website && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Globe" size={14} className="text-text-tertiary flex-shrink-0" />
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {company.website.replace(/^https?:\/\//i, '')}
                    </a>
                  </div>
                )}

                {/* Phone */}
                {company?.phone && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={14} className="text-text-tertiary flex-shrink-0" />
                    <span className="text-sm text-text-secondary truncate">{company.phone}</span>
                  </div>
                )}

                {/* Email */}
                {company?.email && (
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={14} className="text-text-tertiary flex-shrink-0" />
                    <span className="text-sm text-text-secondary truncate">{company.email}</span>
                  </div>
                )}

                {/* Revenue */}
                {company?.revenue && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-text-secondary">Revenue:</span>
                    <span className="text-sm font-semibold text-success">
                      ${company.revenue.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={12} className="text-text-tertiary" />
                    <span className="text-text-secondary">
                      {company?.contacts?.length || 0} contacts
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Target" size={12} className="text-text-tertiary" />
                    <span className="text-text-secondary">
                      {company?.deals?.length || 0} deals
                    </span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center justify-center pt-2 border-t border-border">
                  <span className="text-xs text-text-tertiary">
                    Created {formatDate(company?.created_at)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompanyGrid;
