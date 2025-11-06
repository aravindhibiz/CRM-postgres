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
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [sendingToNew, setSendingToNew] = useState(false);
  const [resendingMemberId, setResendingMemberId] = useState(null);

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

  const handleRemoveMember = async (campaignContactId, memberName) => {
    if (!confirm(`Remove ${memberName} from this campaign?`)) {
      return;
    }

    setRemovingMemberId(campaignContactId);
    try {
      await campaignsService.removeAudienceMember(campaignId, campaignContactId);
      toast.success(`${memberName} removed from campaign`);
      loadAudience();
    } catch (err) {
      console.error('Error removing audience member:', err);
      toast.error(err.message || 'Failed to remove audience member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleSendToNewMembers = async () => {
    const pendingCount = audience.filter(m => m.status === 'pending').length;

    if (pendingCount === 0) {
      toast.error('No pending audience members to send to');
      return;
    }

    if (!confirm(`Send campaign to ${pendingCount} new audience member(s)?`)) {
      return;
    }

    setSendingToNew(true);
    try {
      const result = await campaignsService.sendToPendingAudience(campaignId);
      toast.success(result.message || `Sent to ${result.sent_count} member(s)`);
      loadAudience();
    } catch (err) {
      console.error('Error sending to new members:', err);
      toast.error(err.message || 'Failed to send to new members');
    } finally {
      setSendingToNew(false);
    }
  };

  const handleResendToMember = async (campaignContactId, memberName) => {
    if (!confirm(`Resend campaign to ${memberName}?`)) {
      return;
    }

    setResendingMemberId(campaignContactId);
    try {
      const result = await campaignsService.resendToMember(campaignId, campaignContactId);
      toast.success(result.message || `Campaign resent to ${memberName}`);
      loadAudience();
    } catch (err) {
      console.error('Error resending to member:', err);
      toast.error(err.message || 'Failed to resend campaign');
    } finally {
      setResendingMemberId(null);
    }
  };

  const handleSendToIndividual = async (campaignContactId, memberName) => {
    if (!confirm(`Send campaign to ${memberName}?`)) {
      return;
    }

    setResendingMemberId(campaignContactId);
    try {
      const result = await campaignsService.resendToMember(campaignId, campaignContactId);
      toast.success(result.message || `Campaign sent to ${memberName}`);
      loadAudience();
    } catch (err) {
      console.error('Error sending to member:', err);
      toast.error(err.message || 'Failed to send campaign');
    } finally {
      setResendingMemberId(null);
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
            {audience.filter(m => m.status === 'pending').length > 0 && (
              <span className="ml-2 text-orange-600 font-medium">
                ({audience.filter(m => m.status === 'pending').length} pending)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {audience.filter(m => m.status === 'pending').length > 0 && (
            <button
              onClick={handleSendToNewMembers}
              disabled={sendingToNew}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              {sendingToNew ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} />
                  <span>Send to New Members</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Icon name="UserPlus" size={16} />
            <span>Add Audience</span>
          </button>
        </div>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Send button - only show for pending members */}
                        {member.status === 'pending' && (
                          <button
                            onClick={() => handleSendToIndividual(member.campaign_contact_id, member.name)}
                            disabled={resendingMemberId === member.campaign_contact_id}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send campaign to this member"
                          >
                            {resendingMemberId === member.campaign_contact_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 inline-block"></div>
                            ) : (
                              <Icon name="Send" size={16} />
                            )}
                          </button>
                        )}
                        {/* Resend button - only show for sent, bounced, or failed members */}
                        {['sent', 'bounced', 'failed', 'delivered'].includes(member.status) && (
                          <button
                            onClick={() => handleResendToMember(member.campaign_contact_id, member.name)}
                            disabled={resendingMemberId === member.campaign_contact_id}
                            className="text-primary hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Resend campaign"
                          >
                            {resendingMemberId === member.campaign_contact_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary inline-block"></div>
                            ) : (
                              <Icon name="RefreshCw" size={16} />
                            )}
                          </button>
                        )}
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveMember(member.campaign_contact_id, member.name)}
                          disabled={removingMemberId === member.campaign_contact_id}
                          className="text-error hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove from campaign"
                        >
                          {removingMemberId === member.campaign_contact_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-error inline-block"></div>
                          ) : (
                            <Icon name="Trash2" size={16} />
                          )}
                        </button>
                      </div>
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
