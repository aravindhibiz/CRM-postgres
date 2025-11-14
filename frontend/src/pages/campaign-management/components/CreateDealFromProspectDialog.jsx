import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Icon from 'components/AppIcon';
import apiClient from '../../../lib/apiClient';

const CreateDealFromProspectDialog = ({ prospect, campaignId, onClose, onSuccess }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [dealData, setDealData] = useState({
    name: `Deal - ${prospect.first_name} ${prospect.last_name}`,
    value: '',
    stage: 'lead',
    probability: 10,
    description: `Deal created from campaign prospect: ${prospect.first_name} ${prospect.last_name}`,
    expected_close_date: ''
  });

  const dealStages = [
    { value: 'lead', label: 'Lead', probability: 10 },
    { value: 'qualified', label: 'Qualified', probability: 25 },
    { value: 'proposal', label: 'Proposal', probability: 50 },
    { value: 'negotiation', label: 'Negotiation', probability: 75 },
    { value: 'closed_won', label: 'Closed Won', probability: 100 },
    { value: 'closed_lost', label: 'Closed Lost', probability: 0 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update probability when stage changes
    if (name === 'stage') {
      const stage = dealStages.find(s => s.value === value);
      setDealData(prev => ({
        ...prev,
        [name]: value,
        probability: stage ? stage.probability : prev.probability
      }));
    } else {
      setDealData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Get the contact ID that was created from this prospect
      // First, check if prospect has a contact_id field (after conversion)
      let contactId = prospect.contact_id;

      // If not, we need to find the contact by email
      if (!contactId) {
        const { data: contacts } = await apiClient.get(`/api/v1/contacts?email=${prospect.email}`);
        if (contacts && contacts.length > 0) {
          contactId = contacts[0].id;
        }
      }

      if (!contactId) {
        toast.error('Could not find the contact for this prospect. Please convert the prospect first.');
        setIsCreating(false);
        return;
      }

      // Create the deal
      const dealPayload = {
        name: dealData.name,
        value: parseFloat(dealData.value) || 0,
        stage: dealData.stage,
        probability: parseInt(dealData.probability),
        description: dealData.description,
        expected_close_date: dealData.expected_close_date || null,
        contact_id: contactId,
        // Add any other required fields based on your Deal model
      };

      const { data: deal, error: dealError } = await apiClient.post('/api/v1/deals', dealPayload);

      if (dealError) {
        throw dealError;
      }

      // Now link the deal to the campaign using the new endpoint
      try {
        const { error: linkError } = await apiClient.post(
          `/api/v1/campaigns/${campaignId}/prospects/${prospect.id}/link-deal`,
          {
            deal_id: deal.id,
            conversion_value: parseFloat(dealData.value) || 0
          }
        );

        if (linkError) {
          // If 404, the prospect isn't in campaign audience - add it first then retry
          if (linkError.status === 404) {
            try {
              // Add prospect to campaign audience
              await apiClient.post(`/api/v1/campaigns/${campaignId}/audience`, {
                contact_ids: [],
                prospect_ids: [prospect.id]
              });

              // Retry linking the deal
              const { error: retryError } = await apiClient.post(
                `/api/v1/campaigns/${campaignId}/prospects/${prospect.id}/link-deal`,
                {
                  deal_id: deal.id,
                  conversion_value: parseFloat(dealData.value) || 0
                }
              );

              if (retryError) {
                console.error('❌ Error linking deal after adding to audience:', retryError);
                toast.warning('Deal created but could not link to campaign.');
              } else {
              }
            } catch (audienceError) {
              console.error('❌ Error adding prospect to audience:', audienceError);
              toast.warning('Deal created but could not link to campaign.');
            }
          } else {
            console.error('❌ Error linking deal to campaign:', linkError);
            toast.warning('Deal created but could not link to campaign.');
          }
        } else {
        }
      } catch (linkError) {
        console.error('❌ Error linking deal to campaign:', linkError);
        toast.warning('Deal created but could not link to campaign.');
      }

      toast.success('Deal created successfully and linked to campaign!');
      onSuccess(deal);
      onClose();
    } catch (err) {
      console.error('Error creating deal:', err);
      toast.error(err?.detail || 'Failed to create deal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="DollarSign" size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary">
                  Create Deal from Prospect
                </h3>
                <p className="text-sm text-text-secondary">
                  {prospect.first_name} {prospect.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Prospect Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Prospect Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Email:</span>
                  <span className="text-blue-900 ml-2">{prospect.email}</span>
                </div>
                {prospect.phone && (
                  <div>
                    <span className="text-blue-700">Phone:</span>
                    <span className="text-blue-900 ml-2">{prospect.phone}</span>
                  </div>
                )}
                {prospect.company && (
                  <div>
                    <span className="text-blue-700">Company:</span>
                    <span className="text-blue-900 ml-2">{prospect.company}</span>
                  </div>
                )}
                <div>
                  <span className="text-blue-700">Lead Score:</span>
                  <span className="text-blue-900 ml-2">{prospect.lead_score || 0}</span>
                </div>
              </div>
            </div>

            {/* Deal Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Deal Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={dealData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                required
                disabled={isCreating}
              />
            </div>

            {/* Deal Value */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Deal Value <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
                  $
                </span>
                <input
                  type="number"
                  name="value"
                  value={dealData.value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Stage and Probability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Deal Stage
                </label>
                <select
                  name="stage"
                  value={dealData.stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={isCreating}
                >
                  {dealStages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Probability (%)
                </label>
                <input
                  type="number"
                  name="probability"
                  value={dealData.probability}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Expected Close Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                name="expected_close_date"
                value={dealData.expected_close_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isCreating}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={dealData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isCreating}
              />
            </div>

            {/* Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Info" size={20} className="text-green-600 mt-0.5" />
                <div className="flex-1 text-sm text-green-700">
                  This deal will be created and linked to this campaign. It will appear in the Conversions tab with revenue tracking.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Icon name="DollarSign" size={16} />
                    <span>Create Deal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealFromProspectDialog;
