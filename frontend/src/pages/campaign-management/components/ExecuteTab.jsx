import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import toast from 'react-hot-toast';
import { campaignsService } from '../../../services/campaignsService';

const ExecuteTab = ({ campaign }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [sendTestEmail, setSendTestEmail] = useState(false);
  const [testEmailRecipients, setTestEmailRecipients] = useState('');
  const [scheduleFor, setScheduleFor] = useState('');

  const handleExecuteCampaign = async () => {
    if (!campaign?.id) return;

    // Validate campaign is ready to execute
    if (campaign.type === 'email') {
      if (!campaign.email_template_id) {
        toast.error('Campaign must have an email template selected');
        return;
      }
      if (!campaign.email_subject) {
        toast.error('Campaign must have an email subject');
        return;
      }
    }

    // Validate test email recipients if sending test
    if (sendTestEmail) {
      const emails = testEmailRecipients.split(',').map(e => e.trim()).filter(e => e);
      if (emails.length === 0) {
        toast.error('Please enter at least one test email recipient');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(e => !emailRegex.test(e));
      if (invalidEmails.length > 0) {
        toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
        return;
      }
    }

    setIsExecuting(true);

    try {
      const executionData = {
        send_test_email: sendTestEmail,
        test_email_recipients: sendTestEmail
          ? testEmailRecipients.split(',').map(e => e.trim()).filter(e => e)
          : [],
        schedule_for: scheduleFor || null
      };

      const result = await campaignsService.executeCampaign(campaign.id, executionData);

      if (sendTestEmail) {
        toast.success('Test emails sent successfully!');
      } else if (scheduleFor) {
        toast.success(`Campaign scheduled for ${new Date(scheduleFor).toLocaleString()}`);
      } else {
        toast.success(`Campaign executed! Sent to ${result.sent_count || 0} recipients`);
      }

      // Reset form
      setSendTestEmail(false);
      setTestEmailRecipients('');
      setScheduleFor('');

    } catch (error) {
      console.error('Error executing campaign:', error);
      toast.error(error.message || 'Failed to execute campaign');
    } finally {
      setIsExecuting(false);
    }
  };

  // Check if campaign can be executed
  const canExecute = campaign?.status !== 'completed' && campaign?.status !== 'cancelled';
  const isEmailCampaign = campaign?.type === 'email';

  return (
    <div className="space-y-6">
      {/* Campaign Readiness Check */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Campaign Execution</h3>
            <p className="text-sm text-blue-800">
              {isEmailCampaign
                ? 'This will send emails to all members in the campaign audience using the configured email template and settings.'
                : 'Execute this campaign to engage with your audience.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Readiness Checklist */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="CheckCircle" size={20} className="mr-2" />
          Pre-flight Checklist
        </h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon
              name={campaign?.status === 'draft' || campaign?.status === 'active' ? 'CheckCircle' : 'XCircle'}
              size={20}
              className={campaign?.status === 'draft' || campaign?.status === 'active' ? 'text-green-600' : 'text-red-600'}
            />
            <span className="text-text-secondary">
              Campaign status: <span className="font-medium text-text-primary">{campaign?.status}</span>
            </span>
          </div>

          {isEmailCampaign && (
            <>
              <div className="flex items-center space-x-3">
                <Icon
                  name={campaign?.email_template_id ? 'CheckCircle' : 'XCircle'}
                  size={20}
                  className={campaign?.email_template_id ? 'text-green-600' : 'text-red-600'}
                />
                <span className="text-text-secondary">
                  Email template: {campaign?.email_template_id
                    ? <span className="font-medium text-text-primary">{campaign?.email_template_name || 'Selected'}</span>
                    : <span className="font-medium text-red-600">Not selected</span>
                  }
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Icon
                  name={campaign?.email_subject ? 'CheckCircle' : 'XCircle'}
                  size={20}
                  className={campaign?.email_subject ? 'text-green-600' : 'text-red-600'}
                />
                <span className="text-text-secondary">
                  Email subject: {campaign?.email_subject
                    ? <span className="font-medium text-text-primary">{campaign?.email_subject}</span>
                    : <span className="font-medium text-red-600">Not set</span>
                  }
                </span>
              </div>
            </>
          )}

          <div className="flex items-center space-x-3">
            <Icon
              name={canExecute ? 'CheckCircle' : 'XCircle'}
              size={20}
              className={canExecute ? 'text-green-600' : 'text-red-600'}
            />
            <span className="text-text-secondary">
              Can execute: <span className={`font-medium ${canExecute ? 'text-green-600' : 'text-red-600'}`}>
                {canExecute ? 'Yes' : 'No (campaign is completed or cancelled)'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Execution Options */}
      {canExecute && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Settings" size={20} className="mr-2" />
            Execution Options
          </h3>

          <div className="space-y-6">
            {/* Test Email Option */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="send-test-email"
                checked={sendTestEmail}
                onChange={(e) => setSendTestEmail(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
              />
              <div className="flex-1">
                <label htmlFor="send-test-email" className="block text-sm font-medium text-text-primary cursor-pointer">
                  Send Test Email First
                </label>
                <p className="text-sm text-text-secondary mt-1">
                  Send a test email to verify everything looks correct before sending to your entire audience
                </p>

                {sendTestEmail && (
                  <div className="mt-3">
                    <label htmlFor="test-recipients" className="block text-sm font-medium text-text-secondary mb-2">
                      Test Email Recipients (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="test-recipients"
                      value={testEmailRecipients}
                      onChange={(e) => setTestEmailRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Option */}
            {!sendTestEmail && (
              <div>
                <label htmlFor="schedule-for" className="block text-sm font-medium text-text-secondary mb-2">
                  Schedule for Later (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="schedule-for"
                  value={scheduleFor}
                  onChange={(e) => setScheduleFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <p className="text-sm text-text-tertiary mt-1">
                  Leave empty to send immediately, or select a date and time to schedule for later
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execute Button */}
      {canExecute && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                Ready to {sendTestEmail ? 'Send Test' : scheduleFor ? 'Schedule Campaign' : 'Execute Campaign'}?
              </h3>
              <p className="text-sm text-text-secondary">
                {sendTestEmail
                  ? 'Test emails will be sent to the specified recipients'
                  : scheduleFor
                    ? 'Campaign will be scheduled for the specified date and time'
                    : 'This will immediately send to all audience members'
                }
              </p>
            </div>

            <button
              onClick={handleExecuteCampaign}
              disabled={isExecuting || (isEmailCampaign && (!campaign?.email_template_id || !campaign?.email_subject))}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Icon name={sendTestEmail ? 'Send' : scheduleFor ? 'Clock' : 'Send'} size={16} />
                  <span>
                    {sendTestEmail ? 'Send Test' : scheduleFor ? 'Schedule' : 'Execute Campaign'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Cannot Execute Warning */}
      {!canExecute && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">Campaign Cannot Be Executed</h3>
              <p className="text-sm text-yellow-800">
                This campaign has a status of "{campaign?.status}" and cannot be executed.
                Only campaigns with "draft" or "active" status can be executed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecuteTab;
