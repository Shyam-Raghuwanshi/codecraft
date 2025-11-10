
/**
 * Dashboard Home Component with Real-time Convex Integration
 * CodeCraft - Hackathon Project
 * 
 * Real-time dashboard that subscribes to user reviews and statistics
 * Follow the rules: Include error handling, loading states, real-time updates
 */

import { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorBoundary } from './components';
import { StatCard, ReviewCard } from './components';
import { NotificationContainer, NotificationBell, notifications } from './components/NotificationContainer';
import { 
  useDashboardStats, 
  useRecentReviews, 
  useNotificationPermission 
} from './lib/convex-hooks';
import { useAuth } from '@clerk/clerk-react';

function Home() {
  const { isSignedIn, userId } = useAuth();
  const [showAllActivity, setShowAllActivity] = useState(false);
  
  // Real-time Convex data hooks
  const { 
    stats, 
    notifications: notificationCount, 
    isLoading: statsLoading, 
    hasError: statsError, 
    error: statsErrorMessage,
    retry: retryStats 
  } = useDashboardStats();
  
  const { 
    reviews: recentActivity, 
    isLoading: activityLoading, 
    hasError: activityError, 
    error: activityErrorMessage,
    retry: retryActivity 
  } = useRecentReviews(showAllActivity ? 20 : 5);

  // Notification permission management
  const { permission, requestPermission, isSupported } = useNotificationPermission();

  // Show notification permission request on first visit
  useEffect(() => {
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        notifications.info(
          'Enable Notifications',
          'Get real-time alerts for new code issues and reviews',
          {
            actionText: 'Enable',
            onAction: async () => {
              await requestPermission();
            },
            autoClose: false,
          }
        );
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission]);

  // Show welcome notification for new users
  useEffect(() => {
    if (stats && stats.totalReviews === 0 && isSignedIn) {
      notifications.info(
        'Welcome to CodeCraft!',
        'Connect your first repository to start analyzing your code quality',
        {
          actionText: 'Get Started',
          onAction: () => {
            // Navigate to add repo (you can implement this)
            console.log('Navigate to add repo');
          }
        }
      );
    }
  }, [stats, isSignedIn]);

  // Handle save review action
  const handleSaveReview = async (review: any) => {
    try {
      // This would use the useSaveReview hook in a real implementation
      console.log('Saving review:', review);
      notifications.success('Review Saved', 'Review has been saved to your collection');
    } catch (error) {
      notifications.error('Save Failed', 'Unable to save review. Please try again.');
    }
  };

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CodeCraft</h1>
            <p className="text-gray-600">AI-powered code quality analysis</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sign in to continue
            </h2>
            <p className="text-gray-600 mb-6">
              Access your dashboard and start analyzing your repositories
            </p>
            <button 
              onClick={() => window.location.href = '/signin'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Notification Container */}
        <NotificationContainer />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Notification Bell */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                CodeCraft Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your code quality, track issues, and improve your development workflow
              </p>
            </div>
            
            {notificationCount && (
              <NotificationBell 
                count={notificationCount.totalNotifications}
                onClick={() => {
                  // Could open a notification panel
                  notifications.info(
                    'Notifications',
                    `You have ${notificationCount.newReviews} new reviews and ${notificationCount.criticalIssues} critical issues`
                  );
                }}
              />
            )}
          </div>

          {/* Dashboard Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Overview
              {stats?.lastUpdated && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Updated {new Date(stats.lastUpdated).toLocaleTimeString()})
                </span>
              )}
            </h2>
            
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <LoadingSpinner size="sm" />
                  </div>
                ))}
              </div>
            ) : statsError ? (
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
                    {statsErrorMessage || 'Please check your connection and try again.'}
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
                  title="Total Reviews"
                  value={stats.totalReviews}
                  icon="github"
                  trend={{ 
                    value: stats.totalReviews > 0 ? 5 : 0, 
                    isPositive: true, 
                    label: "vs last month" 
                  }}
                />
                <StatCard
                  title="Active Issues"
                  value={stats.totalIssuesFound}
                  icon="warning"
                  trend={{ 
                    value: stats.totalIssuesFound > 0 ? 12 : 0, 
                    isPositive: false, 
                    label: "vs last week" 
                  }}
                />
                <StatCard
                  title="Critical Issues"
                  value={stats.criticalIssues}
                  icon="error"
                  trend={{ 
                    value: stats.criticalIssues > 0 ? 8 : 0, 
                    isPositive: false, 
                    label: "vs last week" 
                  }}
                />
                <StatCard
                  title="Code Quality"
                  value={stats.avgCodeQuality}
                  icon="check"
                  trend={{ 
                    value: stats.avgCodeQuality > 0 ? 25 : 0, 
                    isPositive: true, 
                    label: "average score" 
                  }}
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
                  onClick={() => {
                    notifications.info(
                      'Add Repository', 
                      'Feature coming soon! For now, you can simulate data by saving a review.'
                    );
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200"
                >
                  Add Repository
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity with Real-time Updates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activity
                {recentActivity.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {recentActivity.length}
                  </span>
                )}
              </h2>
              
              {recentActivity.length > 5 && (
                <button
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {showAllActivity ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
            
            {activityLoading ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <LoadingSpinner message="Loading recent activity..." />
                </div>
              </div>
            ) : activityError ? (
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
                    {activityErrorMessage || 'Please check your connection and try again.'}
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
                  {recentActivity.map((review, index) => (
                    <div key={review._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* New indicator */}
                        {review.isNewReview && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {review.repoName}
                            </h4>
                            <span className="text-xs text-gray-500 ml-2">
                              {review.timeAgoText}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            Found {review.reviewData.summary.totalIssues} issues 
                            ({review.reviewData.summary.criticalIssues} critical)
                          </p>
                          
                          {review.reviewData.summary.codeQualityScore && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 mr-2">Code Quality:</span>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                review.reviewData.summary.codeQualityScore >= 80 
                                  ? 'bg-green-100 text-green-800'
                                  : review.reviewData.summary.codeQualityScore >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {review.reviewData.summary.codeQualityScore}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleSaveReview(review)}
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  Recent code reviews and analysis results will appear here in real-time.
                </p>
                <button
                  onClick={() => {
                    notifications.info(
                      'Getting Started', 
                      'Run your first code analysis to see activity here'
                    );
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200"
                >
                  Analyze Repository
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