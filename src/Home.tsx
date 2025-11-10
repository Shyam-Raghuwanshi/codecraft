
import { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorBoundary } from './components';
import { StatCard, ReviewCard } from './components';
import { getMockDashboardStats, getRecentActivity, simulateApiDelay } from './lib/mock-data';

interface DashboardStats {
  totalRepos: number;
  totalIssues: number;
  totalErrors: number;
  resolvedErrors: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
}

interface LoadingState {
  stats: boolean;
  activity: boolean;
}

interface ErrorState {
  stats: string | null;
  activity: string | null;
}

function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    activity: true
  });
  const [errors, setErrors] = useState<ErrorState>({
    stats: null,
    activity: null
  });

  // Load dashboard data with error handling and retry logic
  const loadDashboardData = async () => {
    try {
      setLoading({ stats: true, activity: true });
      setErrors({ stats: null, activity: null });

      // Simulate loading stats
      await simulateApiDelay(1000);
      const dashboardStats = getMockDashboardStats();
      setStats(dashboardStats);
      setLoading(prev => ({ ...prev, stats: false }));

      // Simulate loading activity
      await simulateApiDelay(500);
      const activity = getRecentActivity();
      setRecentActivity(activity);
      setLoading(prev => ({ ...prev, activity: false }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setErrors({
        stats: 'Failed to load dashboard statistics. Please check your connection and try again.',
        activity: 'Failed to load recent activity. Please check your connection and try again.'
      });
      setLoading({ stats: false, activity: false });
    }
  };

  // Retry specific section
  const retryStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setErrors(prev => ({ ...prev, stats: null }));
      
      await simulateApiDelay(1000);
      const dashboardStats = getMockDashboardStats();
      setStats(dashboardStats);
      setLoading(prev => ({ ...prev, stats: false }));
    } catch (error) {
      console.error('Error retrying stats:', error);
      setErrors(prev => ({ 
        ...prev, 
        stats: 'Failed to load statistics. Please try again later.' 
      }));
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const retryActivity = async () => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      setErrors(prev => ({ ...prev, activity: null }));
      
      await simulateApiDelay(500);
      const activity = getRecentActivity();
      setRecentActivity(activity);
      setLoading(prev => ({ ...prev, activity: false }));
    } catch (error) {
      console.error('Error retrying activity:', error);
      setErrors(prev => ({ 
        ...prev, 
        activity: 'Failed to load recent activity. Please try again later.' 
      }));
      setLoading(prev => ({ ...prev, activity: false }));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CodeCraft Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor your code quality, track issues, and improve your development workflow
            </p>
          </div>

          {/* Dashboard Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Overview
            </h2>
            
            {loading.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <LoadingSpinner size="sm" />
                  </div>
                ))}
              </div>
            ) : errors.stats ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unable to Load Statistics
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {errors.stats}
                  </p>
                  <button
                    onClick={retryStats}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Repositories"
                  value={stats.totalRepos}
                  icon="github"
                  trend={{ value: 5, isPositive: true, label: "vs last month" }}
                />
                <StatCard
                  title="Active Issues"
                  value={stats.totalIssues}
                  icon="warning"
                  trend={{ value: 12, isPositive: false, label: "vs last week" }}
                />
                <StatCard
                  title="Critical Issues"
                  value={stats.criticalIssues}
                  icon="error"
                  trend={{ value: 8, isPositive: false, label: "vs last week" }}
                />
                <StatCard
                  title="Resolved Errors"
                  value={stats.resolvedErrors}
                  icon="check"
                  trend={{ value: 25, isPositive: true, label: "vs last month" }}
                />
              </div>
            ) : (
              // Empty state for stats
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Statistics Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect your first repository to see dashboard statistics.
                </p>
                <button
                  onClick={retryStats}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            
            {loading.activity ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <LoadingSpinner message="Loading recent activity..." />
                </div>
              </div>
            ) : errors.activity ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unable to Load Activity
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {errors.activity}
                  </p>
                  <button
                    onClick={retryActivity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="bg-white rounded-lg shadow">
                <div className="divide-y divide-gray-200">
                  {recentActivity.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-6">
                      {'reviewId' in item ? (
                        <ReviewCard 
                          review={item}
                          onSave={() => console.log('Save review:', item.reviewId)}
                        />
                      ) : (
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              item.severity === 'fatal' ? 'bg-red-500' :
                              item.severity === 'error' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.errorMessage}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.repoName} • {item.affectedUsers} users affected
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(item.occurredAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {recentActivity.length > 5 && (
                  <div className="bg-gray-50 px-6 py-3">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      View all activity ({recentActivity.length} items)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Empty state for activity
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Recent Activity
                </h3>
                <p className="text-gray-600 mb-4">
                  Recent code reviews and error reports will appear here.
                </p>
                <button
                  onClick={retryActivity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Home;
  