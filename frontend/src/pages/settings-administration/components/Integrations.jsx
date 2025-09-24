// src/pages/settings-administration/components/Integrations.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync emails and contacts with Gmail',
      status: 'connected',
      lastSync: '2024-01-15 14:30',
      icon: 'Mail',
      config: {
        syncFrequency: '15 minutes',
        autoSync: true,
        syncContacts: true,
        syncEmails: true
      }
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Schedule meetings and sync calendar events',
      status: 'connected',
      lastSync: '2024-01-15 14:25',
      icon: 'Calendar',
      config: {
        syncFrequency: '5 minutes',
        autoSync: true,
        createMeetings: true,
        syncEvents: true
      }
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Send SMS and make calls through Twilio',
      status: 'disconnected',
      lastSync: null,
      icon: 'Phone',
      config: {
        smsEnabled: false,
        callEnabled: false,
        webhookUrl: ''
      }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates in Slack',
      status: 'error',
      lastSync: '2024-01-10 09:15',
      icon: 'MessageSquare',
      config: {
        channel: '#sales',
        notifications: true,
        dealUpdates: true
      }
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [testResults, setTestResults] = useState({});

  const getStatusBadge = (status) => {
    const statusStyles = {
      connected: { bg: 'bg-success-50', text: 'text-success-600', border: 'border-success-100', label: 'Connected' },
      disconnected: { bg: 'bg-error-50', text: 'text-error-600', border: 'border-error-100', label: 'Disconnected' },
      error: { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-100', label: 'Error' }
    };

    const style = statusStyles?.[status] || statusStyles?.disconnected;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${style?.bg} ${style?.text} ${style?.border}`}>
        {style?.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      connected: { name: 'CheckCircle', color: 'text-success' },
      disconnected: { name: 'XCircle', color: 'text-error' },
      error: { name: 'AlertCircle', color: 'text-warning' }
    };

    const icon = icons?.[status] || icons?.disconnected;
    return <Icon name={icon?.name} size={20} className={icon?.color} />;
  };

  const handleConnect = (integrationId) => {
    console.log('Connecting to:', integrationId);
    // Simulate connection process
    setIntegrations(prev =>
      prev?.map(integration =>
        integration?.id === integrationId
          ? { ...integration, status: 'connected', lastSync: new Date()?.toISOString()?.slice(0, 16)?.replace('T', ' ') }
          : integration
      )
    );
  };

  const handleDisconnect = (integrationId) => {
    console.log('Disconnecting from:', integrationId);
    setIntegrations(prev =>
      prev?.map(integration =>
        integration?.id === integrationId
          ? { ...integration, status: 'disconnected', lastSync: null }
          : integration
      )
    );
  };

  const handleTestConnection = async (integrationId) => {
    console.log('Testing connection for:', integrationId);
    setTestResults(prev => ({ ...prev, [integrationId]: 'testing' }));
    
    // Simulate test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      setTestResults(prev => ({ 
        ...prev, 
        [integrationId]: success ? 'success' : 'error' 
      }));
    }, 2000);
  };

  const handleConfigure = (integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    console.log('Saving configuration for:', selectedIntegration?.name);
    setShowConfigModal(false);
    setSelectedIntegration(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Integrations</h2>
          <p className="text-text-secondary mt-1">Manage API connections and third-party services</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth flex items-center space-x-2">
          <Icon name="Plus" size={16} />
          <span>Add Integration</span>
        </button>
      </div>
      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations?.map((integration) => (
          <div key={integration?.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Icon name={integration?.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{integration?.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{integration?.description}</p>
                </div>
              </div>
              {getStatusIcon(integration?.status)}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Status:</span>
                {getStatusBadge(integration?.status)}
              </div>
              
              {integration?.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Last Sync:</span>
                  <span className="text-sm text-text-primary">{integration?.lastSync}</span>
                </div>
              )}
              
              {testResults?.[integration?.id] && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Test Result:</span>
                  <span className={`text-sm ${
                    testResults?.[integration?.id] === 'testing' ? 'text-text-secondary' :
                    testResults?.[integration?.id] === 'success' ? 'text-success' : 'text-error'
                  }`}>
                    {testResults?.[integration?.id] === 'testing' ? 'Testing...' :
                     testResults?.[integration?.id] === 'success' ? 'Success' : 'Failed'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {integration?.status === 'connected' ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestConnection(integration?.id)}
                    disabled={testResults?.[integration?.id] === 'testing'}
                    className="flex-1 px-3 py-2 text-sm bg-background text-text-primary rounded hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testResults?.[integration?.id] === 'testing' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin"></div>
                        <span>Testing</span>
                      </div>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                  <button
                    onClick={() => handleConfigure(integration)}
                    className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors duration-150"
                  >
                    Configure
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(integration?.id)}
                  className="w-full px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors duration-150"
                >
                  Connect
                </button>
              )}
              
              {integration?.status === 'connected' && (
                <button
                  onClick={() => handleDisconnect(integration?.id)}
                  className="w-full px-3 py-2 text-sm text-error hover:bg-error-50 rounded transition-colors duration-150"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 z-1200 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowConfigModal(false)}></div>
            <div className="bg-surface rounded-lg shadow-xl max-w-lg w-full relative z-1300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Configure {selectedIntegration?.name}
                  </h3>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedIntegration?.id === 'gmail' && (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Auto Sync</label>
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Sync Contacts</label>
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Sync Emails</label>
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Sync Frequency</label>
                        <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary">
                          <option value="5">Every 5 minutes</option>
                          <option value="15" selected>Every 15 minutes</option>
                          <option value="30">Every 30 minutes</option>
                          <option value="60">Every hour</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  {selectedIntegration?.id === 'twilio' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Account SID</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Auth Token</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="Enter auth token"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Enable SMS</label>
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Enable Calls</label>
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-150 ease-smooth"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Integration Status Summary */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Zap" size={16} className="text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-text-primary text-sm">Integration Health</h4>
            <p className="text-text-secondary text-sm mt-1">
              {integrations?.filter(i => i?.status === 'connected')?.length} of {integrations?.length} integrations are connected and working properly.
              Regular testing ensures optimal performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;