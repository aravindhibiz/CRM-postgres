import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { contactsService } from '../../../services/contactsService';
import { dealsService } from '../../../services/dealsService';
import { useAuth } from '../../../contexts/AuthContext';

const CompanyDetail = ({ company, onEdit, onDelete, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companyContacts, setCompanyContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [companyDeals, setCompanyDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const { hasPermission } = useAuth();

  if (!company) return null;

  // Fetch contacts for this company
  useEffect(() => {
    const fetchCompanyContacts = async () => {
      if (!company?.id) return;

      try {
        setLoadingContacts(true);
        const allContacts = await contactsService.getUserContacts();
        const filteredContacts = allContacts.filter(contact =>
          contact.company_id === company.id
        );
        setCompanyContacts(filteredContacts);
      } catch (error) {
        console.error('Error fetching company contacts:', error);
        setCompanyContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchCompanyContacts();
  }, [company?.id]);

  // Fetch deals for this company
  useEffect(() => {
    const fetchCompanyDeals = async () => {
      if (!company?.id) return;

      try {
        setLoadingDeals(true);
        const allDeals = await dealsService.getUserDeals();
        const filteredDeals = allDeals.filter(deal =>
          deal.company_id === company.id
        );
        setCompanyDeals(filteredDeals);
      } catch (error) {
        console.error('Error fetching company deals:', error);
        setCompanyDeals([]);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchCompanyDeals();
  }, [company?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const calculateDealMetrics = () => {
    const totalValue = companyDeals.reduce((sum, deal) => {
      // Ensure deal.value is treated as a number, handle string values from backend
      const dealValue = typeof deal.value === 'string' ? parseFloat(deal.value) : (deal.value || 0);
      return sum + (isNaN(dealValue) ? 0 : dealValue);
    }, 0);
    // Use correct stage values that match the backend: 'closed_won', 'closed_lost'
    const wonDeals = companyDeals.filter(deal => 
      deal.stage && deal.stage.toLowerCase() === 'closed_won'
    ).length;
    const lostDeals = companyDeals.filter(deal => 
      deal.stage && deal.stage.toLowerCase() === 'closed_lost'
    ).length;
    const activeDeals = companyDeals.filter(deal => 
      !deal.stage || !['closed_won', 'closed_lost'].includes(deal.stage.toLowerCase())
    ).length;
    
    // Calculate win rate correctly: Won Deals / (Won + Lost) * 100
    // Only include closed deals (won + lost), exclude active deals
    const closedDeals = wonDeals + lostDeals;
    const winRate = closedDeals > 0 ? ((wonDeals / closedDeals) * 100).toFixed(1) : 0;

    return {
      totalValue,
      wonDeals,
      lostDeals,
      activeDeals,
      winRate
    };
  };

  const metrics = calculateDealMetrics();

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo/Icon */}
            {company?.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name}
                className="w-20 h-20 rounded-lg object-cover border-4 border-surface shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-surface border-4 border-surface shadow-md flex items-center justify-center">
                <Icon name={getIndustryIcon(company?.industry)} size={32} className="text-primary" />
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {company?.name || 'Unnamed Company'}
              </h2>

              {company?.industry && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface border border-border">
                  {company.industry}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {(hasPermission('companies.edit_all') || hasPermission('companies.edit_own')) && (
              <button
                onClick={onEdit}
                className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit company"
              >
                <Icon name="Edit2" size={20} />
              </button>
            )}
            {(hasPermission('companies.delete_all') || hasPermission('companies.delete_own')) && (
              <button
                onClick={onDelete}
                className="p-2 text-text-secondary hover:text-error hover:bg-error-50 rounded-lg transition-colors"
                title="Delete company"
              >
                <Icon name="Trash2" size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              title="Close"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="text-xs text-text-secondary mb-1">Contacts</div>
            <div className="text-xl font-bold text-text-primary">{companyContacts.length}</div>
          </div>
          <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="text-xs text-text-secondary mb-1">Deals</div>
            <div className="text-xl font-bold text-text-primary">{companyDeals.length}</div>
          </div>
          <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="text-xs text-text-secondary mb-1">Deal Value</div>
            <div className="text-xl font-bold text-success">${metrics.totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-surface rounded-lg p-3 border border-border">
            <div className="text-xs text-text-secondary mb-1">Win Rate</div>
            <div className="text-xl font-bold text-text-primary">{metrics.winRate}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-border bg-surface">
        <div className="px-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Contacts ({companyContacts.length})
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'deals'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Deals ({companyDeals.length})
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-3 px-1 border-b-2 transition-colors ${
                activeTab === 'insights'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Insights
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <Icon name="Building2" size={20} className="mr-2" />
                Company Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {company?.size && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Company Size</div>
                    <div className="text-text-primary">{company.size}</div>
                  </div>
                )}
                {company?.revenue && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Annual Revenue</div>
                    <div className="text-text-primary">${company.revenue.toLocaleString()}</div>
                  </div>
                )}
                {company?.website && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Website</div>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center space-x-1"
                    >
                      <Icon name="Globe" size={14} />
                      <span>{company.website.replace(/^https?:\/\//i, '')}</span>
                    </a>
                  </div>
                )}
                {company?.created_at && (
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Added</div>
                    <div className="text-text-primary">{formatDate(company.created_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <Icon name="Phone" size={20} className="mr-2" />
                Contact Information
              </h3>

              <div className="space-y-3">
                {company?.phone && (
                  <div className="flex items-center space-x-3">
                    <Icon name="Phone" size={16} className="text-text-tertiary" />
                    <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                      {company.phone}
                    </a>
                  </div>
                )}
                {company?.email && (
                  <div className="flex items-center space-x-3">
                    <Icon name="Mail" size={16} className="text-text-tertiary" />
                    <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                      {company.email}
                    </a>
                  </div>
                )}
                {(company?.address || company?.city || company?.state || company?.country) && (
                  <div className="flex items-start space-x-3">
                    <Icon name="MapPin" size={16} className="text-text-tertiary mt-0.5" />
                    <div className="text-text-primary">
                      {company?.address && <div>{company.address}</div>}
                      {(company?.city || company?.state || company?.zip_code) && (
                        <div>
                          {[company?.city, company?.state, company?.zip_code].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {company?.country && <div>{company.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {company?.description && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="FileText" size={20} className="mr-2" />
                  Description
                </h3>
                <p className="text-text-secondary whitespace-pre-wrap">{company.description}</p>
              </div>
            )}

            {/* Custom Fields */}
            {company?.custom_fields && Object.keys(company.custom_fields).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="Settings" size={20} className="mr-2" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(company.custom_fields).map(([key, field]) => (
                    <div key={key}>
                      <div className="text-sm text-text-secondary mb-1">{field.name || key}</div>
                      <div className="text-text-primary">
                        {field.value !== null && field.value !== undefined ? String(field.value) : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Associated Contacts</h3>
              {hasPermission('contacts.create') && (
                <Link
                  to="/contact-management"
                  className="text-primary hover:underline text-sm flex items-center space-x-1"
                >
                  <Icon name="Plus" size={14} />
                  <span>Add Contact</span>
                </Link>
              )}
            </div>

            {loadingContacts ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : companyContacts.length > 0 ? (
              <div className="space-y-3">
                {companyContacts.map(contact => (
                  <Link
                    key={contact.id}
                    to={`/contact-management?contactId=${contact.id}`}
                    className="block p-4 bg-surface border border-border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={contact?.avatar_url || '/assets/images/no_image.png'}
                          alt={contact.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-text-primary">{contact.full_name}</div>
                          <div className="text-sm text-text-secondary">{contact.position || 'No position'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        {contact.email && (
                          <div className="flex items-center space-x-1">
                            <Icon name="Mail" size={14} />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center space-x-1">
                            <Icon name="Phone" size={14} />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Users" size={32} className="text-text-tertiary mx-auto mb-2" />
                <p className="text-text-secondary">No contacts associated with this company</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deals' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Associated Deals</h3>
              {hasPermission('deals.create') && (
                <Link
                  to="/deal-management/new"
                  className="text-primary hover:underline text-sm flex items-center space-x-1"
                >
                  <Icon name="Plus" size={14} />
                  <span>Add Deal</span>
                </Link>
              )}
            </div>

            {loadingDeals ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : companyDeals.length > 0 ? (
              <div className="space-y-3">
                {companyDeals.map(deal => (
                  <Link
                    key={deal.id}
                    to={`/deal-management/${deal.id}`}
                    className="block p-4 bg-surface border border-border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-text-primary">{deal.name}</div>
                      <div className="text-success font-semibold">
                        ${deal.value?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span className="capitalize">{deal.stage?.replace('_', ' ')}</span>
                      <span>{formatDate(deal.expected_close_date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Target" size={32} className="text-text-tertiary mx-auto mb-2" />
                <p className="text-text-secondary">No deals associated with this company</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Company Insights</h3>

            {/* Deal Performance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <div className="text-sm text-success-700 mb-1">Won Deals</div>
                <div className="text-2xl font-bold text-success">{metrics.wonDeals}</div>
              </div>
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <div className="text-sm text-error-700 mb-1">Lost Deals</div>
                <div className="text-2xl font-bold text-error">{metrics.lostDeals}</div>
              </div>
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="text-sm text-primary-700 mb-1">Active Deals</div>
                <div className="text-2xl font-bold text-primary">{metrics.activeDeals}</div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm text-orange-700 mb-1">Total Deal Value</div>
                <div className="text-2xl font-bold text-orange-600">
                  ${metrics.totalValue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Engagement Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Contacts:</span>
                  <span className="font-medium text-text-primary">{companyContacts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Deals:</span>
                  <span className="font-medium text-text-primary">{companyDeals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Win Rate:</span>
                  <span className="font-medium text-text-primary">{metrics.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Average Deal Value:</span>
                  <span className="font-medium text-text-primary">
                    ${companyDeals.length > 0 ? (metrics.totalValue / companyDeals.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
