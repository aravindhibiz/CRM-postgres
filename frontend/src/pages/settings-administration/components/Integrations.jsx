// src/pages/settings-administration/components/Integrations.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Icon from '../../../components/AppIcon';
import { integrationsService } from '../../../services/integrationsService';

const Integrations = () => {
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectingProvider, setConnectingProvider] = useState(null);
  const [connecting, setConnecting] = useState({});
  const [testResults, setTestResults] = useState({});
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Available providers configuration
  const availableProviders = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync emails and contacts with Gmail',
      icon: 'Mail',
      color: 'text-red-600',
      features: ['Email sync', 'Contact sync', 'Email templates', 'Auto-logging']
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar', 
      description: 'Schedule meetings and sync calendar events',
      icon: 'Calendar',
      color: 'text-blue-600',
      features: ['Meeting scheduling', 'Event sync', 'Activity tracking', 'Reminders']
    }
  ];

  // Load integrations on component mount
  useEffect(() => {
    loadIntegrations();
    
    // Handle OAuth callback if present in URL
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (code) {
      handleOAuthCallback();
    } else if (error) {
      toast.error(`OAuth error: ${error}`);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationsService.getUserIntegrations();
      setIntegrations(data);
      setError(null);
    } catch (err) {
      console.error('Error loading integrations:', err);
      setError('Failed to load integrations');
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      console.log('🔄 Starting OAuth callback processing...');
      console.log('🔍 URL params:', window.location.search);
      
      const result = await integrationsService.handleOAuthCallbackFromUrl();
      console.log('✅ OAuth callback result:', result);
      
      toast.success(`Successfully connected ${result.provider || 'integration'}!`);
      
      // Reload integrations to reflect new connection
      await loadIntegrations();
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('💥 OAuth callback error:', err);
      toast.error(`Failed to connect: ${err.message}`);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

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

  const handleConnect = async (provider) => {
    try {
      console.log('🔌 Connecting to provider:', provider);
      setConnecting(prev => ({ ...prev, [provider]: true }));
      
      // Store provider for OAuth callback
      localStorage.setItem('oauth_provider', provider);
      
      // Get OAuth URL and redirect to Google
      console.log('📞 Calling integrationsService.getOAuthUrl...');
      const response = await integrationsService.getOAuthUrl(provider);
      console.log('📬 OAuth response:', response);
      
      if (response) {
        console.log('🚀 Redirecting to:', response);
        window.location.href = response;
      } else {
        console.error('❌ No OAuth URL received');
        toast.error('No OAuth URL received');
      }
    } catch (error) {
      console.error('💥 Connection error:', error);
      toast.error(`Failed to connect to ${provider}: ${error.message || 'Unknown error'}`);
    } finally {
      setConnecting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDisconnect = async (integrationId) => {
    try {
      await integrationsService.disconnectIntegration(integrationId);
      toast.success('Integration disconnected successfully');
      await loadIntegrations(); // Reload to get updated status
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect integration');
    }
  };

  const handleTestConnection = async (integrationId) => {
    try {
      setTestResults(prev => ({ ...prev, [integrationId]: 'testing' }));
      
      const result = await integrationsService.testIntegration(integrationId);
      
      setTestResults(prev => ({ 
        ...prev, 
        [integrationId]: result.success ? 'success' : 'error' 
      }));
      
      if (result.success) {
        toast.success('Integration test successful');
      } else {
        toast.error(`Integration test failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResults(prev => ({ 
        ...prev, 
        [integrationId]: 'error' 
      }));
      toast.error('Failed to test integration');
    }
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
          <p className="text-text-secondary mt-1">Connect your CRM with Gmail and Google Calendar</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-secondary">Loading integrations...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={20} className="text-error-600" />
            <span className="text-error-600 font-medium">Failed to load integrations</span>
          </div>
          <p className="text-error-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableProviders.map((provider) => {
          // Find connected integration for this provider
          const connectedIntegration = integrations.find(int => int.provider === provider.id && int.status === 'connected');
          const isConnected = !!connectedIntegration;
          const isConnecting = connecting[provider.id];
          
          return (
            <div key={provider.id} className="bg-surface rounded-lg border border-border p-6 hover:shadow-md transition-shadow duration-150">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${isConnected ? 'bg-success-50' : 'bg-primary-50'} rounded-lg flex items-center justify-center`}>
                    <Icon name={provider.icon} size={20} className={isConnected ? 'text-success' : provider.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{provider.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{provider.description}</p>
                  </div>
                </div>
                {getStatusIcon(isConnected ? 'connected' : 'disconnected')}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status:</span>
                  {getStatusBadge(isConnected ? 'connected' : 'disconnected')}
                </div>
                
                {connectedIntegration?.last_sync && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Last Sync:</span>
                    <span className="text-sm text-text-primary">
                      {new Date(connectedIntegration.last_sync).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {testResults?.[connectedIntegration?.id] && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Test Result:</span>
                    <span className={`text-sm ${
                      testResults?.[connectedIntegration?.id] === 'testing' ? 'text-text-secondary' :
                      testResults?.[connectedIntegration?.id] === 'success' ? 'text-success' : 'text-error'
                    }`}>
                      {testResults?.[connectedIntegration?.id] === 'testing' ? 'Testing...' :
                       testResults?.[connectedIntegration?.id] === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                )}
                
                {/* Features list */}
                <div>
                  <span className="text-sm text-text-secondary">Features:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {provider.features.map((feature, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-background rounded text-text-secondary">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {isConnected ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestConnection(connectedIntegration.id)}
                      disabled={testResults?.[connectedIntegration.id] === 'testing'}
                      className="flex-1 px-3 py-2 text-sm bg-background text-text-primary rounded hover:bg-surface-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testResults?.[connectedIntegration.id] === 'testing' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-text-secondary border-t-transparent rounded-full animate-spin"></div>
                          <span>Testing</span>
                        </div>
                      ) : (
                        'Test Connection'
                      )}
                    </button>
                    <button
                      onClick={() => handleConfigure(connectedIntegration)}
                      className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors duration-150"
                    >
                      Configure
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    disabled={isConnecting}
                    className="w-full px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
                
                {isConnected && (
                  <button
                    onClick={() => handleDisconnect(connectedIntegration.id)}
                    className="w-full px-3 py-2 text-sm text-error hover:bg-error-50 rounded transition-colors duration-150"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
      
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
                  {selectedIntegration?.provider === 'gmail' && (
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
                  
                  {selectedIntegration?.provider === 'google_calendar' && (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Auto Sync Events</label>
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Create CRM Activities</label>
                        <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-primary">Sync Meeting Notes</label>
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Default Calendar</label>
                        <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary">
                          <option value="primary">Primary Calendar</option>
                          <option value="work">Work Calendar</option>
                          <option value="crm">CRM Events</option>
                        </select>
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
              {integrations?.length} of {availableProviders?.length} integrations are connected and working properly.
              Connect your Google services to enhance your CRM capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;