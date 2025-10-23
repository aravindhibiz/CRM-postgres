import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Icon from 'components/AppIcon';
import { configService } from '../../../services/configService';

const PerformanceMetrics = ({ data, revenueData = [] }) => {
  // Load system configuration on component mount
  useEffect(() => {
    configService.loadConfiguration();
  }, []);

  // Format currency using dynamic configuration
  const formatCurrency = (value) => {
    return configService.formatCurrency(value);
  };

  // Format currency for short display (e.g., €2.1M)
  const formatCurrencyShort = (value) => {
    const currency = configService.getCurrency();
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    
    if (value >= 1000000) {
      return formatter.format(value / 1000000).replace(/\.0/, '') + 'M';
    } else if (value >= 1000) {
      return formatter.format(value / 1000).replace(/\.0/, '') + 'K';
    } else {
      return formatter.format(value);
    }
  };

  const quotaData = [
    { name: 'Achieved', value: data?.achieved, color: '#10B981' },
    { name: 'Remaining', value: data?.quota - data?.achieved, color: '#E5E7EB' }
  ];

  const dealOutcomeData = [
    { name: 'Won', value: data?.dealsWon, color: '#10B981' },
    { name: 'Lost', value: data?.dealsLost, color: '#EF4444' }
  ];

  // Use real revenue data if available, otherwise fallback to dummy data
  const monthlyPerformance = revenueData.length > 0 ? revenueData.map(item => ({
    month: item.month,
    target: item.target,
    actual: item.actual
  })) : [
    { month: 'Jan', target: 400000, actual: 420000 },
    { month: 'Feb', target: 450000, actual: 485000 },
    { month: 'Mar', target: 500000, actual: 562000 },
    { month: 'Apr', target: 520000, actual: 598000 },
    { month: 'May', target: 550000, actual: 645000 },
    { month: 'Jun', target: 600000, actual: 580000 }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Performance Metrics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quota Achievement */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Quota Achievement</h3>
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quotaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {quotaData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Quota</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatCurrencyShort(data?.quota)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Achieved</p>
                <p className="text-lg font-semibold text-success">
                  {formatCurrencyShort(data?.achieved)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Remaining</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatCurrencyShort(data?.quota - data?.achieved)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Outcomes */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Deal Outcomes</h3>
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealOutcomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {dealOutcomeData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Deals Won</p>
                <p className="text-lg font-semibold text-success">{data?.dealsWon}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Deals Lost</p>
                <p className="text-lg font-semibold text-error">{data?.dealsLost}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Win Rate</p>
                <p className="text-lg font-semibold text-text-primary">
                  {((data?.dealsWon / (data?.dealsWon + data?.dealsLost)) * 100)?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="DollarSign" size={20} className="text-primary" />
          </div>
          <p className="text-sm text-text-secondary">Avg Deal Size</p>
          <p className="text-lg font-semibold text-text-primary">
            {formatCurrencyShort(data?.avgDealSize)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="TrendingUp" size={20} className="text-success" />
          </div>
          <p className="text-sm text-text-secondary">Conversion Rate</p>
          <p className="text-lg font-semibold text-text-primary">{data?.conversionRate}%</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="Clock" size={20} className="text-accent" />
          </div>
          <p className="text-sm text-text-secondary">Avg Sales Cycle</p>
          <p className="text-lg font-semibold text-text-primary">45 days</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="Target" size={20} className="text-secondary" />
          </div>
          <p className="text-sm text-text-secondary">Activities</p>
          <p className="text-lg font-semibold text-text-primary">127</p>
        </div>
      </div>
      {/* Monthly Performance Trend */}
      {/* <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-medium text-text-primary mb-4">Monthly Performance Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(value) => {
                const currency = configService.getCurrency();
                const symbol = new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(part => part.type === 'currency').value;
                return `${symbol}${value / 1000}K`;
              }} />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), '']}
                labelStyle={{ color: '#1F2937' }}
              />
              <Bar dataKey="target" fill="#E5E7EB" name="Target" />
              <Bar dataKey="actual" fill="var(--color-primary)" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
};

export default PerformanceMetrics;