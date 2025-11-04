import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Icon from 'components/AppIcon';
import { campaignsService } from '../../../services/campaignsService';
import { useAuth } from '../../../contexts/AuthContext';
import AddAudienceModal from './AddAudienceModal';

const AudienceTab = ({ campaignId }) => {
  const { hasAnyPermission } = useAuth();
  const [audience, setAudience] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const engagementStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'opened', label: 'Opened', color: 'bg-purple-100 text-purple-800' },
    { value: 'clicked', label: 'Clicked', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'responded', label: 'Responded', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'bounced', label: 'Bounced', color: 'bg-red-100 text-red-800' },
    { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    if (campaignId) {
      loadAudience();
    }
  }, [campaignId]);

  const loadAudience = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campaignsService.getCampaignAudience(campaignId);
      setAudience(data || []);
    } catch (err) {
      console.error('Error loading audience:', err);
      setError('Failed to load audience. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return engagementStatuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    return engagementStatuses.find(s => s.value === status)?.label || status;
  };

  // Filter audience by status
  const filteredAudience = audience.filter(member => {
    return statusFilter === 'all' || member.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading audience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <p className="text-error mb-4">{error}</p>
        <button onClick={loadAudience} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Campaign Audience</h3>
          <p className="text-sm text-text-secondary">
            {filteredAudience.length} member{filteredAudience.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && ` (${audience.length} total)`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Icon name="UserPlus" size={16} />
          <span>Add Audience</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({audience.length})
        </button>
        {engagementStatuses.map(status => {
          const count = audience.filter(m => m.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === status.value
                  ? 'bg-primary text-white'
                  : `${status.color} hover:opacity-80`
              }`}
            >
              {status.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Audience List */}
      {filteredAudience.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-border">
          <Icon name="Users" size={48} className="text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {statusFilter === 'all' ? 'No audience members yet' : 'No members with this status'}
          </h3>
          <p className="text-text-secondary">
            {statusFilter === 'all'
              ? 'Add contacts or prospects to this campaign'
              : 'Try selecting a different status'}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Opened At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Clicked At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredAudience.map((member, index) => (
                  <tr key={index} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">
                        {member.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.recipient_type === 'contact' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {member.recipient_type === 'contact' ? 'Contact' : 'Prospect'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {member.email || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                        {getStatusLabel(member.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {member.sent_at ? new Date(member.sent_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {member.opened_at ? new Date(member.opened_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {member.clicked_at ? new Date(member.clicked_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Audience Modal */}
      {showAddModal && (
        <AddAudienceModal
          campaignId={campaignId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadAudience();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AudienceTab;
