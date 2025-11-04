import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { campaignsService } from '../../../services/campaignsService';
import { configService } from '../../../services/configService';

const ConversionsTab = ({ campaignId }) => {
  const [conversions, setConversions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (campaignId) {
      loadConversions();
    }
  }, [campaignId]);

  const loadConversions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campaignsService.getCampaignConversions(campaignId);
      setConversions(data || []);
    } catch (err) {
      console.error('Error loading conversions:', err);
      setError('Failed to load conversions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  const getTotalRevenue = () => {
    return conversions.reduce((sum, conv) => sum + (conv.deal_value || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading conversions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <p className="text-error mb-4">{error}</p>
        <button onClick={loadConversions} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-700 mb-1">Total Conversions</div>
          <div className="text-2xl font-semibold text-green-900">
            {conversions.length}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-700 mb-1">Total Revenue</div>
          <div className="text-2xl font-semibold text-blue-900">
            {formatCurrency(getTotalRevenue())}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-700 mb-1">Avg Deal Size</div>
          <div className="text-2xl font-semibold text-purple-900">
            {conversions.length > 0 ? formatCurrency(getTotalRevenue() / conversions.length) : formatCurrency(0)}
          </div>
        </div>
      </div>

      {/* Conversions List */}
      {conversions.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Icon name="DollarSign" size={48} className="text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No conversions yet</h3>
          <p className="text-text-secondary">Conversions from this campaign will appear here</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h4 className="text-lg font-semibold text-text-primary">Campaign Conversions</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Converted At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {conversions.map((conversion, index) => (
                  <tr key={index} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">
                        {conversion.deal_name || 'Untitled Deal'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {conversion.contact_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {conversion.company_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {formatCurrency(conversion.deal_value || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {conversion.deal_stage || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {conversion.converted_at
                        ? new Date(conversion.converted_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionsTab;
