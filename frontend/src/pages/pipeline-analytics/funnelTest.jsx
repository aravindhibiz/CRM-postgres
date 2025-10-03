import React, { useEffect, useState } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

const PipelineAnalyticsFunnelTest = () => {
  const [error, setError] = useState(null);
  const [funnelStatus, setFunnelStatus] = useState('Testing FunnelChart...');

  // Sample funnel data
  const funnelData = [
    { name: 'Lead', value: 100000, count: 20, fill: '#3B82F6' },
    { name: 'Qualified', value: 80000, count: 16, fill: '#6366F1' },
    { name: 'Proposal', value: 60000, count: 12, fill: '#8B5CF6' },
    { name: 'Negotiation', value: 40000, count: 8, fill: '#A855F7' },
    { name: 'Won', value: 20000, count: 4, fill: '#10B981' }
  ];

  useEffect(() => {
    try {
      setFunnelStatus('✅ FunnelChart imported successfully');
    } catch (err) {
      setError(`❌ FunnelChart error: ${err.message}`);
      setFunnelStatus(`❌ FunnelChart failed: ${err.message}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb 
        items={[
          { label: 'Dashboard', href: '/sales-dashboard' },
          { label: 'Pipeline Analytics', href: '/pipeline-analytics' }
        ]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - Funnel Chart Test</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Funnel Status:</h2>
              <div className="text-sm font-mono">
                <div>{funnelStatus}</div>
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            </div>

            {/* Test FunnelChart - This is likely the problematic component */}
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-semibold mb-2">🔥 FunnelChart Test (Suspected Issue)</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={funnelData}
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ If this page crashes or shows error, FunnelChart is the culprit!
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Analysis:</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>FunnelChart is a more complex Recharts component that might have issues.</p>
                <p>If this page loads successfully, the issue is elsewhere.</p>
                <p>If this page crashes, we found our problem - FunnelChart!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsFunnelTest;