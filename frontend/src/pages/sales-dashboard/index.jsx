import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';

import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import UpcomingTasks from './components/UpcomingTasks';
import PipelineStage from './components/PipelineStage';
import PerformanceMetrics from './components/PerformanceMetrics';

import dealsService from '../../services/dealsService';



const SalesDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [selectedProbability, setSelectedProbability] = useState('all');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pipelineData, setPipelineData] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Load all dashboard data in parallel
      const [
        pipelineDeals,
        revenueStats,
        performanceStats
      ] = await Promise.all([
        dealsService?.getPipelineDeals(),
        dealsService?.getRevenueData(),
        dealsService?.getPerformanceMetrics()
      ]);

      setPipelineData(pipelineDeals);
      setRevenueData(revenueStats);
      setPerformanceData(performanceStats);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadDashboardData();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Handle drag and drop for pipeline
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination?.droppableId === source?.droppableId && destination?.index === source?.index) {
      return;
    }

    try {
      // Update deal stage in database
      await dealsService?.updateDealStage(draggableId, destination?.droppableId);

      // Update local state optimistically
      const sourceStage = pipelineData?.[source?.droppableId];
      const destStage = pipelineData?.[destination?.droppableId];
      const draggedDeal = sourceStage?.deals?.find(deal => deal?.id === draggableId);

      if (draggedDeal) {
        const stageProbs = {
          'lead': 10,
          'qualified': 25,
          'proposal': 50,
          'negotiation': 75,
          'closed_won': 100,
          'closed_lost': 0
        };

        const updatedDeal = {
          ...draggedDeal,
          probability: stageProbs?.[destination?.droppableId] || draggedDeal?.probability,
          daysInStage: 0
        };

        // Remove from source
        const newSourceDeals = sourceStage?.deals?.filter(deal => deal?.id !== draggableId);
        
        // Add to destination
        const newDestDeals = [...(destStage?.deals || [])];
        newDestDeals?.splice(destination?.index, 0, updatedDeal);

        setPipelineData({
          ...pipelineData,
          [source?.droppableId]: {
            ...sourceStage,
            deals: newSourceDeals
          },
          [destination?.droppableId]: {
            ...destStage,
            deals: newDestDeals
          }
        });
      }
    } catch (err) {
      console.error('Error updating deal stage:', err);
      setError('Failed to update deal stage. Please try again.');
    }
  };

  // Calculate pipeline totals
  const calculateStageTotal = (stage) => {
    return stage?.deals?.reduce((total, deal) => total + (deal?.value || 0), 0) || 0;
  };

  const calculateWeightedTotal = (stage) => {
    return stage?.deals?.reduce((total, deal) => 
      total + ((deal?.value || 0) * (deal?.probability || 0) / 100), 0
    ) || 0;
  };

  const totalPipelineValue = Object.values(pipelineData)?.reduce((total, stage) => 
    total + calculateStageTotal(stage), 0
  );

  const weightedPipelineValue = Object.values(pipelineData)?.reduce((total, stage) => 
    total + calculateWeightedTotal(stage), 0
  );

  const totalActiveDeals = Object.values(pipelineData)?.reduce((total, stage) => 
    total + (stage?.deals?.length || 0), 0
  );

  // Show preview mode for non-authenticated users
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-text-secondary">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20 px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={20} className="text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">Preview Mode</p>
                  <p className="text-blue-700 text-sm">
                    This is how the sales dashboard looks when authenticated.{' '}
                    <a href="/login" className="font-medium underline hover:text-blue-800">
                      Sign in to access real data
                    </a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="opacity-75">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Sales Dashboard</h1>
              <p className="text-text-secondary mb-8">
                Preview of your sales pipeline and performance metrics
              </p>

              {/* Preview metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Total Pipeline</p>
                      <p className="text-2xl font-normal text-text-primary">$2.1M</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Icon name="TrendingUp" size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Weighted Pipeline</p>
                      <p className="text-2xl font-normal text-text-primary">$1.2M</p>
                    </div>
                    <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                      <Icon name="Target" size={24} className="text-success" />
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Active Deals</p>
                      <p className="text-2xl font-normal text-text-primary">24</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center">
                      <Icon name="Briefcase" size={24} className="text-secondary" />
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Quota Achievement</p>
                      <p className="text-2xl font-normal text-text-primary">74%</p>
                    </div>
                    <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center">
                      <Icon name="Award" size={24} className="text-accent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-normal text-text-primary mb-6">Pipeline Preview</h2>
                <div className="text-center py-12">
                  <Icon name="BarChart3" size={48} className="text-text-tertiary mx-auto mb-4" />
                  <p className="text-text-secondary">Sign in to view your interactive sales pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Sales Dashboard</h1>
              <p className="text-text-secondary">
                Last updated: {lastUpdated?.toLocaleTimeString()} • Auto-refresh every 5 minutes
              </p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e?.target?.value)}
                className="input-field text-sm"
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
              </select>
              
              <select
                value={selectedProbability}
                onChange={(e) => setSelectedProbability(e?.target?.value)}
                className="input-field text-sm"
              >
                <option value="all">All Probabilities</option>
                <option value="high">High (&gt;70%)</option>
                <option value="medium">Medium (30-70%)</option>
                <option value="low">Low (&lt;30%)</option>
              </select>
              
              <select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e?.target?.value)}
                className="input-field text-sm"
              >
                <option value="all">All Territories</option>
                <option value="north">North America</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia Pacific</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg mb-6 flex items-center space-x-2">
              <Icon name="AlertCircle" size={20} />
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-error hover:text-error-600"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-text-secondary">Loading dashboard data...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm font-normal">Total Pipeline</p>
                      <p className="text-2xl font-normal text-text-primary">
                        ${(totalPipelineValue / 1000000)?.toFixed(1)}M
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Icon name="TrendingUp" size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm font-normal">Weighted Pipeline</p>
                      <p className="text-2xl font-normal text-text-primary">
                        ${(weightedPipelineValue / 1000000)?.toFixed(1)}M
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                      <Icon name="Target" size={24} className="text-success" />
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm font-normal">Active Deals</p>
                      <p className="text-2xl font-normal text-text-primary">{totalActiveDeals}</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center">
                      <Icon name="Briefcase" size={24} className="text-secondary" />
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm font-normal">Quota Achievement</p>
                      <p className="text-2xl font-normal text-text-primary">{performanceData?.percentage || 0}%</p>
                    </div>
                    <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center">
                      <Icon name="Award" size={24} className="text-accent" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Pipeline Section */}
                <div className="xl:col-span-3 space-y-8">
                  {/* Interactive Pipeline */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-normal text-text-primary">Sales Pipeline</h2>
                      <div className="flex items-center space-x-2 text-sm text-text-secondary">
                        <Icon name="RefreshCw" size={16} />
                        <span>Drag deals to update stages</span>
                      </div>
                    </div>
                    
                    <DragDropContext onDragEnd={onDragEnd}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {Object.values(pipelineData)?.map((stage) => (
                          <PipelineStage
                            key={stage?.id}
                            stage={stage}
                            totalValue={calculateStageTotal(stage)}
                            weightedValue={calculateWeightedTotal(stage)}
                          />
                        ))}
                      </div>
                    </DragDropContext>
                  </div>

                  {/* Revenue Forecast Chart */}
                  <div className="card p-6">
                    <h2 className="text-xl font-normal text-text-primary mb-6">Monthly Revenue Forecast</h2>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="month" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" tickFormatter={(value) => `$${value / 1000}K`} />
                          <Tooltip 
                            formatter={(value) => [`$${value?.toLocaleString()}`, '']}
                            labelStyle={{ color: '#1F2937' }}
                          />
                          <Bar dataKey="forecast" fill="var(--color-primary)" name="Forecast" />
                          <Bar dataKey="actual" fill="var(--color-success)" name="Actual" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <PerformanceMetrics data={performanceData} />
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <QuickActions />
                  
                  {/* Upcoming Tasks */}
                  <UpcomingTasks />
                  
                  {/* Recent Activity */}
                  <RecentActivity />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;