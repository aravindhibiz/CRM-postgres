import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import ExportMenu from '../../components/ExportMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import dealsService from '../../services/dealsService';
import { configService } from '../../services/configService';
import { Loader2 } from 'lucide-react';

const PipelineAnalyticsMinimal = () => {
  const [status, setStatus] = useState('Starting component...');
  const [error, setError] = useState(null);

  // Test basic state management
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedRep, setSelectedRep] = useState('all');
  const [loading, setLoading] = useState(true);

  // Test useEffect
  useEffect(() => {
    try {
      setStatus('✅ useEffect working');
      setLoading(false);
    } catch (err) {
      setError(`❌ useEffect failed: ${err.message}`);
    }
  }, []);

  // Test useMemo
  const testMemo = useMemo(() => {
    try {
      return '✅ useMemo working';
    } catch (err) {
      return `❌ useMemo failed: ${err.message}`;
    }
  }, [selectedDateRange]);

  // Test useRef
  const testRef = useRef(null);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - Component Logic Testing</h1>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Component Status:</h2>
              <div className="space-y-1 text-sm font-mono">
                <div>Status: {status}</div>
                <div>Loading: {loading ? 'true' : 'false'}</div>
                <div>Memo Test: {testMemo}</div>
                <div>Ref Test: {testRef.current ? '✅ useRef working' : '✅ useRef initialized'}</div>
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">State Values:</h2>
              <div className="space-y-1 text-sm font-mono">
                <div>selectedDateRange: {selectedDateRange}</div>
                <div>selectedRep: {selectedRep}</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Components Test:</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">✅ Loader2 icon working</span>
                </div>
                <div className="text-sm">
                  <ExportMenu 
                    isOpen={false}
                    onClose={() => {}}
                    onExport={() => {}}
                    exportData={{}}
                    chartRefs={{}}
                  />
                  <span>✅ ExportMenu component rendered</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Next Steps:</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>If this page loads without errors, the issue is in:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>API calls (useEffect with service calls)</li>
                  <li>Data processing logic</li>
                  <li>Chart rendering</li>
                  <li>Complex state management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsMinimal;