import React from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';

// Test imports one by one
let importStatus = {
  react: '✅ React imported',
  header: '✅ Header imported',
  breadcrumb: '✅ Breadcrumb imported'
};

try {
  // Test Recharts import
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } = require('recharts');
  importStatus.recharts = '✅ Recharts imported';
} catch (error) {
  importStatus.recharts = `❌ Recharts failed: ${error.message}`;
}

try {
  // Test ExportMenu import
  const ExportMenu = require('../../components/ExportMenu').default;
  importStatus.exportMenu = '✅ ExportMenu imported';
} catch (error) {
  importStatus.exportMenu = `❌ ExportMenu failed: ${error.message}`;
}

try {
  // Test dealsService import
  const dealsService = require('../../services/dealsService').default;
  importStatus.dealsService = '✅ dealsService imported';
} catch (error) {
  importStatus.dealsService = `❌ dealsService failed: ${error.message}`;
}

try {
  // Test configService import
  const { configService } = require('../../services/configService');
  importStatus.configService = '✅ configService imported';
} catch (error) {
  importStatus.configService = `❌ configService failed: ${error.message}`;
}

try {
  // Test lucide-react import
  const { Loader2 } = require('lucide-react');
  importStatus.lucideReact = '✅ lucide-react imported';
} catch (error) {
  importStatus.lucideReact = `❌ lucide-react failed: ${error.message}`;
}

const PipelineAnalyticsDebug = () => {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - Import Testing</h1>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Import Status:</h2>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              {Object.entries(importStatus).map(([key, status]) => (
                <div key={key} className="font-mono text-sm">
                  <strong>{key}:</strong> {status}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>If all imports are ✅, the issue is in component logic</li>
              <li>If any import is ❌, that's our problem to fix</li>
              <li>Check the specific error messages above</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsDebug;