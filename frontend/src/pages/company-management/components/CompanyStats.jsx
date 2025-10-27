import React from 'react';
import Icon from 'components/AppIcon';

const CompanyStats = ({ stats, className = '' }) => {
  if (!stats) return null;

  // Get top industries
  const topIndustries = Object.entries(stats.industries || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get top sizes
  const topSizes = Object.entries(stats.sizes || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const getIndustryColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700'
    ];
    return colors[index % colors.length];
  };

  const getSizeColor = (size) => {
    const sizeMap = {
      'small': 'bg-blue-50 border-blue-200 text-blue-700',
      'medium': 'bg-green-50 border-green-200 text-green-700',
      'large': 'bg-purple-50 border-purple-200 text-purple-700',
      'enterprise': 'bg-orange-50 border-orange-200 text-orange-700',
    };
    return sizeMap[size.toLowerCase()] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Companies */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon name="Building2" size={20} className="text-primary" />
          </div>
          <span className="text-xs text-text-tertiary">Total</span>
        </div>
        <div className="text-2xl font-bold text-text-primary">{stats.total || 0}</div>
        <div className="text-sm text-text-secondary">Companies</div>
      </div>

      {/* Recently Added */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-success-50 rounded-lg">
            <Icon name="TrendingUp" size={20} className="text-success" />
          </div>
          <span className="text-xs text-text-tertiary">Last 30 days</span>
        </div>
        <div className="text-2xl font-bold text-text-primary">{stats.recentlyAdded || 0}</div>
        <div className="text-sm text-text-secondary">Recently Added</div>
      </div>

      {/* Top Industries */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Icon name="Briefcase" size={20} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-text-primary">Top Industries</span>
          </div>
        </div>
        <div className="space-y-2">
          {topIndustries.length > 0 ? (
            topIndustries.slice(0, 3).map(([industry, count], index) => (
              <div key={industry} className="flex items-center justify-between text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getIndustryColor(index)}`}>
                  {industry}
                </span>
                <span className="text-text-secondary">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-tertiary">No data</p>
          )}
        </div>
      </div>

      {/* Company Sizes */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Icon name="Users" size={20} className="text-orange-600" />
            </div>
            <span className="text-sm font-medium text-text-primary">By Size</span>
          </div>
        </div>
        <div className="space-y-2">
          {topSizes.length > 0 ? (
            topSizes.map(([size, count]) => (
              <div key={size} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary capitalize">{size}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-border rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${(count / stats.total) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-primary w-6 text-right">{count}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-tertiary">No data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyStats;
