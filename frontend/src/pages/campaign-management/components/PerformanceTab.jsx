import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { campaignsService } from '../../../services/campaignsService';

const PerformanceTab = ({ campaignId }) => {
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    if (campaignId) {
      loadPerformanceData();
    }
  }, [campaignId, timeRange]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [metricsData, analyticsData] = await Promise.all([
        campaignsService.getCampaignMetrics(campaignId),
        campaignsService.getCampaignAnalytics(campaignId, timeRange)
      ]);

      setMetrics(metricsData);
      setAnalytics(analyticsData || []);
    } catch (err) {
      console.error('Error loading performance data:', err);
      setError('Failed to load performance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <p className="text-error mb-4">{error}</p>
        <button onClick={loadPerformanceData} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Performance Analytics</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="text-sm border border-border rounded-md px-3 py-1.5 bg-surface"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Open Rate</span>
              <Icon name="Mail" size={16} className="text-blue-600" />
            </div>
            <div className="text-2xl font-semibold text-blue-900">
              {metrics.open_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {metrics.opened_count || 0} / {metrics.sent_count || 0}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Click Rate</span>
              <Icon name="MousePointer" size={16} className="text-green-600" />
            </div>
            <div className="text-2xl font-semibold text-green-900">
              {metrics.click_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-green-600 mt-1">
              {metrics.clicked_count || 0} / {metrics.sent_count || 0}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Conversion Rate</span>
              <Icon name="TrendingUp" size={16} className="text-purple-600" />
            </div>
            <div className="text-2xl font-semibold text-purple-900">
              {metrics.conversion_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {metrics.converted_count || 0} conversions
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${
            (metrics.roi || 0) >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                (metrics.roi || 0) >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                ROI
              </span>
              <Icon
                name="DollarSign"
                size={16}
                className={(metrics.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}
              />
            </div>
            <div className={`text-2xl font-semibold ${
              (metrics.roi || 0) >= 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {metrics.roi?.toFixed(1) || 0}%
            </div>
          </div>
        </div>
      )}

      {/* Performance Trend Chart */}
      {analytics.length > 0 && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Engagement Trends</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period_start"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="open_rate"
                name="Open Rate (%)"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="click_rate"
                name="Click Rate (%)"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="conversion_rate"
                name="Conversion Rate (%)"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Engagement Funnel */}
      {metrics && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Engagement Funnel</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Sent', count: metrics.sent_count || 0, percentage: 100 },
                { name: 'Delivered', count: metrics.delivered_count || 0, percentage: metrics.sent_count > 0 ? (metrics.delivered_count / metrics.sent_count * 100).toFixed(1) : 0 },
                { name: 'Opened', count: metrics.opened_count || 0, percentage: metrics.sent_count > 0 ? (metrics.opened_count / metrics.sent_count * 100).toFixed(1) : 0 },
                { name: 'Clicked', count: metrics.clicked_count || 0, percentage: metrics.sent_count > 0 ? (metrics.clicked_count / metrics.sent_count * 100).toFixed(1) : 0 },
                { name: 'Responded', count: metrics.responded_count || 0, percentage: metrics.sent_count > 0 ? (metrics.responded_count / metrics.sent_count * 100).toFixed(1) : 0 },
                { name: 'Converted', count: metrics.converted_count || 0, percentage: metrics.sent_count > 0 ? (metrics.converted_count / metrics.sent_count * 100).toFixed(1) : 0 }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'percentage') return [`${value}%`, 'Percentage'];
                  return [value, 'Count'];
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Metrics Table */}
      {metrics && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h4 className="text-lg font-semibold text-text-primary">Detailed Metrics</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Sent</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                    {metrics.sent_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-text-secondary">-</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Delivered</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                    {metrics.delivered_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-text-secondary">
                    {metrics.sent_count > 0 ? ((metrics.delivered_count / metrics.sent_count) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Opened</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-primary">
                    {metrics.opened_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-primary font-medium">
                    {metrics.open_rate?.toFixed(1) || 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Clicked</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                    {metrics.clicked_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-text-secondary">
                    {metrics.click_rate?.toFixed(1) || 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Bounced</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-yellow-600">
                    {metrics.bounced_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-yellow-600">
                    {metrics.bounce_rate?.toFixed(1) || 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Unsubscribed</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                    {metrics.unsubscribed_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">
                    {metrics.unsubscribe_rate?.toFixed(1) || 0}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-text-primary">Responded</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-text-primary">
                    {metrics.responded_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-text-secondary">
                    {metrics.response_rate?.toFixed(1) || 0}%
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-6 py-4 text-sm font-medium text-green-900">Converted</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-green-900">
                    {metrics.converted_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-green-900">
                    {metrics.conversion_rate?.toFixed(1) || 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTab;
