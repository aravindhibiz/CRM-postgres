import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Icon from 'components/AppIcon';
import { campaignsService } from '../../../services/campaignsService';

const ProspectConversionDialog = ({ prospect, onClose, onConvert }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionData, setConversionData] = useState({
    notes: '',
    create_activity: true
  });

  const handleConvert = async () => {
    if (isConverting) return;

    setIsConverting(true);
    try {
      const result = await campaignsService.convertProspectToContact(prospect.id, conversionData);

      toast.success('Prospect converted to contact successfully!');
      onConvert(result);
    } catch (err) {
      console.error('Error converting prospect:', err);

      // Handle specific error cases
      if (err?.message?.includes('duplicate') || err?.message?.includes('already exists')) {
        toast.error('A contact with this email already exists');
      } else {
        toast.error('Failed to convert prospect. Please try again.');
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConversionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Icon name="UserPlus" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary">
                  Convert Prospect to Contact
                </h3>
                <p className="text-sm text-text-secondary">
                  {prospect.first_name} {prospect.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isConverting}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prospect Information Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Prospect Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Name:</span>
                <span className="text-blue-900 ml-2">
                  {prospect.first_name} {prospect.last_name}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Email:</span>
                <span className="text-blue-900 ml-2">{prospect.email}</span>
              </div>
              {prospect.phone && (
                <div>
                  <span className="text-blue-700 font-medium">Phone:</span>
                  <span className="text-blue-900 ml-2">{prospect.phone}</span>
                </div>
              )}
              {prospect.company && (
                <div>
                  <span className="text-blue-700 font-medium">Company:</span>
                  <span className="text-blue-900 ml-2">{prospect.company}</span>
                </div>
              )}
              {prospect.job_title && (
                <div>
                  <span className="text-blue-700 font-medium">Title:</span>
                  <span className="text-blue-900 ml-2">{prospect.job_title}</span>
                </div>
              )}
              <div>
                <span className="text-blue-700 font-medium">Lead Score:</span>
                <span className="text-blue-900 ml-2">{prospect.lead_score || 0}</span>
              </div>
            </div>
          </div>

          {/* Conversion Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900 mb-1">
                  What happens when you convert?
                </h4>
                <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                  <li>A new contact will be created with the prospect's information</li>
                  <li>The prospect status will be changed to "Converted"</li>
                  <li>Campaign associations will be maintained</li>
                  <li>An activity log entry will be created (if enabled below)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Conversion Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={conversionData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Add any notes about this conversion..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isConverting}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="create_activity"
                name="create_activity"
                checked={conversionData.create_activity}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                disabled={isConverting}
              />
              <label htmlFor="create_activity" className="ml-2 text-sm text-text-primary">
                Create activity log entry for this conversion
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                  Important Note
                </h4>
                <p className="text-sm text-yellow-700">
                  This action cannot be undone. The prospect will be marked as converted and a new contact record will be created.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex space-x-3">
          <button
            onClick={onClose}
            disabled={isConverting}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Icon name="UserPlus" size={16} />
                <span>Convert to Contact</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProspectConversionDialog;
