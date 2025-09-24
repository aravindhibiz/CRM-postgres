import React, { useMemo } from 'react';
import Icon from 'components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ActivityInsights = ({ activities }) => {
  const insights = useMemo(() => {
    if (!activities.length) return null;

    // Activity volume by type
    const activityTypeData = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const typeChartData = Object.entries(activityTypeData).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      count
    }));

    // Activity trends over last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const trendData = last30Days.map(date => {
      const dayActivities = activities.filter(activity => 
        activity.timestamp.toISOString().split('T')[0] === date
      ).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activities: dayActivities
      };
    });

    // Channel distribution
    const channelData = activities.reduce((acc, activity) => {
      acc[activity.channel] = (acc[activity.channel] || 0) + 1;
      return acc;
    }, {});

    const channelChartData = Object.entries(channelData).map(([channel, count]) => ({
      channel: channel.charAt(0).toUpperCase() + channel.slice(1),
      count,
      fill: getChannelColor(channel)
    }));

    // Response time analysis (mock data for demonstration)
    const avgResponseTime = Math.floor(Math.random() * 4) + 1; // 1-5 hours
    const responseTimeImprovement = Math.floor(Math.random() * 20) + 5; // 5-25%

    // Activity completion rates
    const completedActivities = activities.filter(activity => activity.status === 'completed').length;
    const completionRate = activities.length > 0 ? Math.round((completedActivities / activities.length) * 100) : 0;

    return {
      typeChartData,
      trendData,
      channelChartData,
      avgResponseTime,
      responseTimeImprovement,
      completionRate,
      totalActivities: activities.length,
      todayActivities: activities.filter(activity => 
        activity.timestamp.toDateString() === new Date().toDateString()
      ).length
    };
  }, [activities]);

  const getChannelColor = (channel) => {
    const colors = {
      gmail: '#4285F4',
      twilio: '#F22F46',
      calendar: '#34A853',
      system: '#9AA0A6'
    };
    return colors[channel] || '#9AA0A6';
  };

  if (!insights) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="BarChart3" size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No data available</h3>
        <p className="text-text-secondary">
          Add some activities to see insights and analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Activities</p>
              <p className="text-2xl font-bold text-text-primary">{insights.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Today's Activities</p>
              <p className="text-2xl font-bold text-text-primary">{insights.todayActivities}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Response Time</p>
              <p className="text-2xl font-bold text-text-primary">{insights.avgResponseTime}h</p>
              <p className="text-xs text-green-600">↓ {insights.responseTimeImprovement}% this month</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Completion Rate</p>
              <p className="text-2xl font-bold text-text-primary">{insights.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Volume by Type */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Activity Volume by Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.typeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="type" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Channel Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.channelChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ channel, percent }) => `${channel} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {insights.channelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Activity Trend (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={insights.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="activities" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Icon name="Zap" size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">AI Insights</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>• Your email response time has improved by {insights.responseTimeImprovement}% this month. Keep up the great work!</p>
              <p>• Peak activity hours are between 9-11 AM. Consider scheduling important calls during this time.</p>
              <p>• {insights.typeChartData[0]?.type || 'Emails'} make up the majority of your activities. Consider automating routine tasks.</p>
              <p>• Your completion rate is {insights.completionRate}%. {insights.completionRate > 80 ? 'Excellent!' : 'Consider setting reminders for follow-ups.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityInsights;