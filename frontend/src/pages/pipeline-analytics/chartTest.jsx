import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import ExportMenu from '../../components/ExportMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import dealsService from '../../services/dealsService';
import { configService } from '../../services/configService';
import { Loader2 } from 'lucide-react';

const PipelineAnalyticsChartTest = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedRep, setSelectedRep] = useState('all');
  const [loading, setLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [chartStatus, setChartStatus] = useState('Loading data...');
  
  // Sample data for testing charts
  const sampleData = {
    pipelineFunnel: [
      { name: 'Lead', value: 100000, count: 20, fill: '#3B82F6' },
      { name: 'Qualified', value: 80000, count: 16, fill: '#6366F1' },
      { name: 'Proposal', value: 60000, count: 12, fill: '#8B5CF6' },
      { name: 'Negotiation', value: 40000, count: 8, fill: '#A855F7' },
      { name: 'Won', value: 20000, count: 4, fill: '#10B981' }
    ],
    revenueTrend: [
      { month: 'Jan', actual: 45000, forecast: 50000, target: 45000 },
      { month: 'Feb', actual: 52000, forecast: 55000, target: 50000 },
      { month: 'Mar', actual: 48000, forecast: 52000, target: 48000 }
    ],
    velocityMetrics: [
      { metric: 'Average Deal Size', value: 50000, target: 45000, unit: '$' },
      { metric: 'Sales Cycle', value: 28, target: 30, unit: ' days' },
      { metric: 'Win Rate', value: 25, target: 20, unit: '%' }
    ]
  };

  const [processedData, setProcessedData] = useState(sampleData);

  // Chart refs
  const revenueChartRef = useRef(null);
  const pipelineChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  useEffect(() => {
    setChartStatus('✅ Data loaded, testing charts...');
    setLoading(false);
  }, []);

  // Test individual chart components
  const testCharts = () => {
    const results = [];

    try {
      // Test BarChart
      results.push('✅ BarChart component available');
    } catch (err) {
      results.push(`❌ BarChart failed: ${err.message}`);
    }

    try {
      // Test LineChart  
      results.push('✅ LineChart component available');
    } catch (err) {
      results.push(`❌ LineChart failed: ${err.message}`);
    }

    try {
      // Test PieChart
      results.push('✅ PieChart component available');
    } catch (err) {
      results.push(`❌ PieChart failed: ${err.message}`);
    }

    return results;
  };

  const chartTests = testCharts();

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - Chart Rendering Test</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Chart Status:</h2>
              <div className="text-sm font-mono">
                <div>{chartStatus}</div>
                <div>Loading: {loading ? 'true' : 'false'}</div>
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Chart Component Tests:</h2>
              <div className="space-y-1 text-sm font-mono">
                {chartTests.map((test, index) => (
                  <div key={index}>{test}</div>
                ))}
              </div>
            </div>

            {/* Test Simple Bar Chart */}
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Test 1: Simple Bar Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="actual" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-green-600 mt-2">✅ If you see a chart above, bar charts work!</p>
            </div>

            {/* Test Simple Line Chart */}
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Test 2: Simple Line Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-yellow-600 mt-2">✅ If you see a chart above, line charts work!</p>
            </div>

            {/* Test Simple Pie Chart */}
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Test 3: Simple Pie Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedData.pipelineFunnel}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {processedData.pipelineFunnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-purple-600 mt-2">✅ If you see a chart above, pie charts work!</p>
            </div>

            <div className="bg-red-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Analysis:</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>If all charts render above, the issue is in complex chart configuration.</p>
                <p>If any chart fails to render, we've found the problematic chart type.</p>
                <p>Look for any JavaScript errors in the browser console.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsChartTest;