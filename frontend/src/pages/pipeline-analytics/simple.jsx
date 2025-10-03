import React from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';

const PipelineAnalyticsSimple = () => {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics</h1>
          <p className="text-gray-600">Testing if basic component loads...</p>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Debugging Information:</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p>✅ Component loaded successfully</p>
              <p>✅ Basic JSX rendering works</p>
              <p>🔄 Now testing imports...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsSimple;