import React, { useEffect, useState, useMemo, useRef } from 'react';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import ExportMenu from '../../components/ExportMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import dealsService from '../../services/dealsService';
import { configService } from '../../services/configService';
import { Loader2 } from 'lucide-react';

const PipelineAnalyticsAPI = () => {
  const [apiStatus, setApiStatus] = useState('Testing API calls...');
  const [configLoaded, setConfigLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    reps: [],
    dateRanges: []
  });

  // Test configuration loading
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setApiStatus('🔄 Loading configuration...');
        await configService.loadConfiguration();
        setApiStatus('✅ Configuration loaded');
        
        setApiStatus('🔄 Loading filter options...');
        const options = await dealsService.getFilterOptions();
        setFilterOptions(options);
        setApiStatus('✅ Filter options loaded');
        
        setConfigLoaded(true);
        setLoading(false);
      } catch (error) {
        setError(`❌ Config failed: ${error.message}`);
        setApiStatus(`❌ Configuration failed: ${error.message}`);
        setConfigLoaded(true); // Continue with fallback
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Test data fetching (only after config is loaded)
  const [dataStatus, setDataStatus] = useState('Waiting for config...');
  
  useEffect(() => {
    if (!configLoaded) return;

    const fetchData = async () => {
      try {
        setDataStatus('🔄 Fetching analytics data...');
        
        const filters = {
          dateRange: undefined,
          ownerId: undefined
        };
        
        // Test each API call individually
        setDataStatus('🔄 Fetching pipeline data...');
        const pipeline = await dealsService.getPipelineDeals(filters);
        setDataStatus('✅ Pipeline data fetched');
        
        setDataStatus('🔄 Fetching revenue data...');
        const revenue = await dealsService.getRevenueData(filters);
        setDataStatus('✅ Revenue data fetched');
        
        setDataStatus('🔄 Fetching performance data...');
        const performance = await dealsService.getPerformanceMetrics(filters);
        setDataStatus('✅ Performance data fetched');
        
        setDataStatus('🔄 Fetching win rate data...');
        const winRate = await dealsService.getWinRateData();
        setDataStatus('✅ All data fetched successfully');
        
      } catch (err) {
        setDataStatus(`❌ Data fetch failed: ${err.message}`);
        setError(`Data fetch error: ${err.message}`);
      }
    };

    fetchData();
  }, [configLoaded]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Analytics - API Testing</h1>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Configuration Status:</h2>
              <div className="space-y-1 text-sm font-mono">
                <div>Status: {apiStatus}</div>
                <div>Config Loaded: {configLoaded ? 'true' : 'false'}</div>
                <div>Loading: {loading ? 'true' : 'false'}</div>
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Data Fetch Status:</h2>
              <div className="text-sm font-mono">
                <div>{dataStatus}</div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Filter Options:</h2>
              <div className="space-y-1 text-sm font-mono">
                <div>Reps: {filterOptions.reps?.length || 0} found</div>
                <div>Date Ranges: {filterOptions.dateRanges?.length || 0} found</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h2 className="font-semibold mb-2">Analysis:</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>This test isolates API calls to identify the exact failure point.</p>
                <p>If any API call fails, we'll see the specific error message.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnalyticsAPI;