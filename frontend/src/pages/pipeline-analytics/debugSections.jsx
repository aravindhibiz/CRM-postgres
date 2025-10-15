import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import ExportMenu from '../../components/ExportMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import dealsService from '../../services/dealsService';
import { configService } from '../../services/configService';
import { Loader2 } from 'lucide-react';

// Error boundary component
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log(`Error in ${this.props.section}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-red-800 font-semibold">❌ Error in {this.props.section}</h3>
          <p className="text-red-600 text-sm mt-1">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const PipelineAnalyticsDebugSections = () => {
  console.log('🔍 Starting PipelineAnalytics component...');
  
  // Basic state
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedRep, setSelectedRep] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Data state
  const [pipelineFunnelData, setPipelineFunnelData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [winRateData, setWinRateData] = useState([]);
  const [velocityMetrics, setVelocityMetrics] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    reps: [],
    dateRanges: []
  });

  // Chart refs
  const revenueChartRef = useRef(null);
  const pipelineChartRef = useRef(null);
  const performanceChartRef = useRef(null);

  console.log('🔍 State initialized');

  // Configuration loading
  useEffect(() => {
    console.log('🔍 Loading configuration...');
    const loadConfig = async () => {
      try {
        await configService.loadConfiguration();
        const options = await dealsService.getFilterOptions();
        setFilterOptions(options);
        setConfigLoaded(true);
        console.log('✅ Configuration loaded');
      } catch (error) {
        console.error('❌ Config error:', error);
        setError(`Config error: ${error.message}`);
        setConfigLoaded(true);
      }
    };
    loadConfig();
  }, []);

  // Data loading
  useEffect(() => {
    if (!configLoaded) return;
    
    console.log('🔍 Loading data...');
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const filters = {
          dateRange: selectedDateRange !== 'all' ? selectedDateRange : undefined,
          ownerId: selectedRep !== 'all' ? selectedRep : undefined
        };
        
        const [pipeline, revenue, performance, winRate] = await Promise.all([
          dealsService.getPipelineDeals(filters),
          dealsService.getRevenueData(filters),
          dealsService.getPerformanceMetrics(filters),
          dealsService.getWinRateData(filters), // Updated to use filters
        ]);

        // Process data
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

        setPipelineFunnelData(transformedPipeline);
        setRevenueTrendData(revenue);
        setWinRateData(winRate);
        setVelocityMetrics([
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
          }
        ]);

        setLoading(false);
        console.log('✅ Data loaded successfully');
        
      } catch (err) {
        console.error('❌ Data error:', err);
        setError(`Data error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [configLoaded, selectedDateRange, selectedRep]);

  // Export data memo
  const exportAnalyticsData = useMemo(() => {
    try {
      return {
        velocityMetrics,
        revenueTrendData,
        pipelineFunnelData,
        winRateData,
        selectedDateRange,
        selectedRep
      };
    } catch (err) {
      console.error('❌ Export data memo error:', err);
      return {};
    }
  }, [velocityMetrics, revenueTrendData, pipelineFunnelData, winRateData, selectedDateRange, selectedRep]);

  const chartRefs = {
    revenue: revenueChartRef,
    pipeline: pipelineChartRef,
    performance: performanceChartRef
  };

  console.log('🔍 About to render component');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionErrorBoundary section="Header">
        <Header />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary section="Breadcrumb">
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/sales-dashboard' },
            { label: 'Pipeline Analytics', href: '/pipeline-analytics' }
          ]} 
        />
      </SectionErrorBoundary>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          
          <SectionErrorBoundary section="Page Header">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Pipeline Analytics - Debug Version</h1>
              <button 
                onClick={() => setIsExportMenuOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Export
              </button>
            </div>
          </SectionErrorBoundary>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-red-600">❌ Error: {error}</p>
            </div>
          )}

          <SectionErrorBoundary section="Filter Section">
            <div className="mb-6 flex gap-4">
              <select 
                value={selectedDateRange} 
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="text-gray-900 bg-white">All Time</option>
                <option value="thisMonth" className="text-gray-900 bg-white">This Month</option>
                <option value="lastMonth" className="text-gray-900 bg-white">Last Month</option>
              </select>
              
              <select 
                value={selectedRep} 
                onChange={(e) => setSelectedRep(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
              >
                <option value="all" className="text-gray-900 bg-white">All Reps</option>
                {filterOptions.reps.map(rep => (
                  <option key={rep.id} value={rep.id} className="text-gray-900 bg-white">
                    {rep.name}
                  </option>
                ))}
              </select>
            </div>
          </SectionErrorBoundary>

          <SectionErrorBoundary section="Charts Grid">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <SectionErrorBoundary section="Funnel Chart">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold mb-4">Pipeline Funnel</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip />
                        <Funnel
                          dataKey="value"
                          data={pipelineFunnelData}
                        >
                          <LabelList position="center" fill="#fff" stroke="none" />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionErrorBoundary>

              <SectionErrorBoundary section="Revenue Chart">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionErrorBoundary>

            </div>
          </SectionErrorBoundary>

          <SectionErrorBoundary section="Export Menu">
            <ExportMenu 
              isOpen={isExportMenuOpen}
              onClose={() => setIsExportMenuOpen(false)}
              onExport={(format) => console.log('Export:', format)}
              analyticsData={exportAnalyticsData}
              filters={{
                dateRange: selectedDateRange,
                ownerId: selectedRep
              }}
              chartRefs={chartRefs}
            />
          </SectionErrorBoundary>

        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsDebugSections;