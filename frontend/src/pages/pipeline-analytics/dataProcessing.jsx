import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import ExportMenu from '../../components/ExportMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import dealsService from '../../services/dealsService';
import { configService } from '../../services/configService';
import { Loader2 } from 'lucide-react';

const PipelineAnalyticsDataProcessing = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedRep, setSelectedRep] = useState('all');
  const [loading, setLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('Starting...');
  
  // Raw data from API
  const [rawData, setRawData] = useState({
    pipeline: null,
    revenue: null,
    performance: null,
    winRate: null
  });

  // Processed data for charts
  const [processedData, setProcessedData] = useState({
    pipelineFunnel: [],
    revenueTrend: [],
    velocityMetrics: [],
    winRateData: []
  });

  // Chart refs for export functionality
  const revenueChartRef = useRef(null);
  const pipelineChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        await configService.loadConfiguration();
        setConfigLoaded(true);
      } catch (error) {
        console.error('Failed to load configuration:', error);
        setConfigLoaded(true);
      }
    };
    loadConfig();
  }, []);

  // Fetch data
  useEffect(() => {
    if (!configLoaded) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setProcessingStatus('🔄 Fetching API data...');
        
        const filters = {
          dateRange: selectedDateRange !== 'all' ? selectedDateRange : undefined,
          ownerId: selectedRep !== 'all' ? selectedRep : undefined
        };
        
        const [pipeline, revenue, performance, winRate] = await Promise.all([
          dealsService.getPipelineDeals(filters),
          dealsService.getRevenueData(filters),
          dealsService.getPerformanceMetrics(filters),
          dealsService.getWinRateData(),
        ]);

        setRawData({ pipeline, revenue, performance, winRate });
        setProcessingStatus('✅ API data fetched, processing...');

        // Process pipeline data
        setProcessingStatus('🔄 Processing pipeline data...');
        const transformedPipeline = Object.values(pipeline).map(stage => ({
          name: stage.title,
          value: stage.deals.reduce((sum, deal) => sum + deal.value, 0),
          count: stage.deals.length,
          deals: stage.deals,
          fill: stage.id === 'lead' ? '#3B82F6' :
                stage.id === 'qualified' ? '#6366F1' :
                stage.id === 'proposal' ? '#8B5CF6' :
                stage.id === 'negotiation' ? '#A855F7' :
                stage.id === 'closed_won' ? '#10B981' : '#EF4444'
        }));
        setProcessingStatus('✅ Pipeline data processed');

        // Process revenue data
        setProcessingStatus('🔄 Processing revenue data...');
        const transformedRevenue = revenue.map(item => ({
          month: item.month,
          actual: item.actual || 0,
          forecast: item.forecast || 0,
          target: item.target || 0
        }));
        setProcessingStatus('✅ Revenue data processed');

        // Process performance data
        setProcessingStatus('🔄 Processing performance data...');
        const transformedVelocity = [
          {
            metric: 'Average Deal Size',
            value: performance.averageDealSize || 0,
            target: 50000,
            unit: '$'
          },
          {
            metric: 'Sales Cycle Length',
            value: performance.averageSalesCycle || 0,
            target: 30,
            unit: ' days'
          },
          {
            metric: 'Win Rate',
            value: performance.winRate || 0,
            target: 25,
            unit: '%'
          },
          {
            metric: 'Pipeline Velocity',
            value: performance.pipelineVelocity || 0,
            target: 100000,
            unit: '$/month'
          }
        ];
        setProcessingStatus('✅ Performance data processed');

        // Process win rate data
        setProcessingStatus('🔄 Processing win rate data...');
        const transformedWinRate = winRate.map(item => ({
          quarter: item.quarter,
          winRate: item.winRate || 0,
          totalDeals: item.totalDeals || 0,
          wonDeals: item.wonDeals || 0
        }));
        setProcessingStatus('✅ Win rate data processed');

        setProcessedData({
          pipelineFunnel: transformedPipeline,
          revenueTrend: transformedRevenue,
          velocityMetrics: transformedVelocity,
          winRateData: transformedWinRate
        });

        setProcessingStatus('✅ All data processed successfully');
        setLoading(false);

      } catch (err) {
        setError(`Processing error: ${err.message}`);
        setProcessingStatus(`❌ Error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [configLoaded, selectedDateRange, selectedRep]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - Data Processing Testing</h1>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Processing Status:</h2>
              <div className="text-sm font-mono">
                <div>{processingStatus}</div>
                <div>Loading: {loading ? 'true' : 'false'}</div>
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Raw Data Summary:</h2>
              <div className="space-y-1 text-sm font-mono">
                <div>Pipeline stages: {rawData.pipeline ? Object.keys(rawData.pipeline).length : 0}</div>
                <div>Revenue data points: {rawData.revenue ? rawData.revenue.length : 0}</div>
                <div>Performance metrics: {rawData.performance ? Object.keys(rawData.performance).length : 0}</div>
                <div>Win rate data: {rawData.winRate ? rawData.winRate.length : 0}</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Processed Data Summary:</h2>
              <div className="space-y-1 text-sm font-mono">
                <div>Pipeline funnel: {processedData.pipelineFunnel.length} stages</div>
                <div>Revenue trend: {processedData.revenueTrend.length} months</div>
                <div>Velocity metrics: {processedData.velocityMetrics.length} metrics</div>
                <div>Win rate data: {processedData.winRateData.length} quarters</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Next Steps:</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>If this loads successfully, the issue is in chart rendering.</p>
                <p>If this fails, the issue is in data processing logic.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsDataProcessing;