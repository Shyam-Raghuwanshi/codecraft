/**
 * Real-time Repository Page Component
 * CodeCraft - Hackathon Project
 * 
 * Shows real-time notifications for new issues detected and auto-updating error counts
 * Integrates with Convex for live data updates
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from '@tanstack/react-router';
import { LoadingSpinner, ErrorBoundary } from '../components';
import { NotificationContainer, notifications } from '../components/NotificationContainer';
import { useRepoData } from '../lib/convex-hooks';

// Search params type
type RepoSearchParams = {
  name: string;
};

/**
 * Real-time Issue Notification Badge
 */
function IssueNotificationBadge({ 
  issueCount, 
  criticalCount, 
  hasNewIssues 
}: { 
  issueCount: number; 
  criticalCount: number; 
  hasNewIssues: boolean; 
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
          hasNewIssues 
            ? 'bg-red-50 border-2 border-red-200 text-red-700 animate-pulse' 
            : criticalCount > 0
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}
      >
        <div className="relative">
          <ExclamationTriangleIcon className="w-5 h-5" />
          {hasNewIssues && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </div>
        <span className="font-medium">
          {issueCount} Issues ({criticalCount} Critical)
        </span>
        {hasNewIssues && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            NEW!
          </span>
        )}
      </button>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64 z-10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Issue Details</h4>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Issues:</span>
              <span className="font-medium">{issueCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Critical:</span>
              <span className="font-medium text-red-600">{criticalCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Major:</span>
              <span className="font-medium text-orange-600">{Math.max(0, issueCount - criticalCount)}</span>
            </div>
            
            {hasNewIssues && (
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-red-600 font-medium">
                  🚨 New issues detected in the last 5 minutes!
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Real-time Status Indicator
 */
function RealtimeStatusIndicator({ lastUpdate }: { lastUpdate?: number }) {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdateText, setLastUpdateText] = useState('');

  useEffect(() => {
    if (lastUpdate) {
      const updateTime = () => {
        const now = Date.now();
        const diff = now - lastUpdate;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (seconds < 60) {
          setLastUpdateText(`${seconds}s ago`);
        } else {
          setLastUpdateText(`${minutes}m ago`);
        }
        
        // Consider disconnected if no update in 30 seconds
        setIsConnected(diff < 30000);
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [lastUpdate]);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
      <span className="text-gray-600">
        {isConnected ? 'Live' : 'Disconnected'} 
        {lastUpdateText && ` • Updated ${lastUpdateText}`}
      </span>
    </div>
  );
}

/**
 * Demo Issue Generator (for demonstration purposes)
 */
function DemoControls({ repoName }: { repoName: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const simulateNewIssues = async () => {
    setIsGenerating(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issueCount = Math.floor(Math.random() * 5) + 1;
    
    // Show notification for new issues
    notifications.newIssues(issueCount, repoName);
    
    // Show success notification after a moment
    setTimeout(() => {
      notifications.reviewCompleted(repoName);
    }, 1000);
    
    setIsGenerating(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-medium text-blue-900 mb-2">🎮 Demo Controls</h3>
      <p className="text-sm text-blue-700 mb-3">
        Simulate real-time issue detection for demonstration
      </p>
      <button
        onClick={simulateNewIssues}
        disabled={isGenerating}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isGenerating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" className="inline mr-2" />
            Analyzing...
          </>
        ) : (
          'Simulate New Issues'
        )}
      </button>
    </div>
  );
}

/**
 * Main Repository Component
 */
function RepositoryPage() {
  const { name: repoName } = Route.useSearch();
  const { isSignedIn } = useAuth();
  
  // Real-time repository data
  const { 
    repoData, 
    hasNewIssues, 
    issueCount, 
    criticalCount, 
    lastAnalysis, 
    isLoading, 
    hasError, 
    error 
  } = useRepoData(repoName);

  // Demo state for visualization
  const [demoIssueCount, setDemoIssueCount] = useState(15);
  const [demoCriticalCount, setDemoCriticalCount] = useState(3);
  const [demoHasNew, setDemoHasNew] = useState(false);
  const [demoLastUpdate, setDemoLastUpdate] = useState(Date.now());

  // Use real data if available, otherwise use demo data
  const displayIssueCount = issueCount || demoIssueCount;
  const displayCriticalCount = criticalCount || demoCriticalCount;
  const displayHasNew = hasNewIssues || demoHasNew;
  const displayLastUpdate = lastAnalysis || demoLastUpdate;

  // Handle demo notifications
  useEffect(() => {
    // Show welcome notification
    const timer = setTimeout(() => {
      notifications.info(
        'Real-time Monitoring Active',
        `Watching ${repoName} for new issues and code changes`,
        { duration: 4000 }
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [repoName]);

  // Simulate periodic updates for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoLastUpdate(Date.now());
      
      // Occasionally trigger new issues for demo
      if (Math.random() < 0.1) { // 10% chance every 10 seconds
        setDemoHasNew(true);
        const newIssues = Math.floor(Math.random() * 3) + 1;
        setDemoIssueCount(prev => prev + newIssues);
        setDemoCriticalCount(prev => prev + (newIssues > 2 ? 1 : 0));
        
        notifications.newIssues(newIssues, repoName);
        
        // Reset after showing
        setTimeout(() => setDemoHasNew(false), 5000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [repoName]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view repository analysis.</p>
          <Link to="/signin">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!repoName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Repository Not Specified</h2>
          <p className="text-gray-600 mb-4">Please provide a repository name to view analysis.</p>
          <Link to="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Real-time Notification Container */}
        <NotificationContainer />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Repository Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Dashboard
                  </button>
                </Link>
                
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {repoName}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      JavaScript
                    </span>
                    <span className="text-sm text-gray-500">
                      ⭐ 1.2k stars
                    </span>
                    <RealtimeStatusIndicator lastUpdate={displayLastUpdate} />
                  </div>
                </div>
              </div>

              {/* Real-time Issue Badge */}
              <IssueNotificationBadge 
                issueCount={displayIssueCount}
                criticalCount={displayCriticalCount}
                hasNewIssues={displayHasNew}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Live Statistics
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{displayIssueCount}</div>
                    <div className="text-sm text-gray-600">Total Issues</div>
                    {displayHasNew && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        ↗ New issues detected!
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{displayCriticalCount}</div>
                    <div className="text-sm text-gray-600">Critical</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.max(0, 20 - displayIssueCount)}
                    </div>
                    <div className="text-sm text-gray-600">Resolved</div>
                  </div>
                </div>
              </div>

              {/* Recent Issues */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    🐛 Recent Issues
                  </h2>
                  {displayHasNew && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full animate-pulse">
                      NEW ISSUES DETECTED
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Mock issues for demonstration */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          Security: Potential SQL Injection vulnerability
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          src/database/queries.js:45
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                        Critical
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          Performance: Unnecessary re-renders detected
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          src/components/Dashboard.jsx:23
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                        Major
                      </span>
                    </div>
                  </div>

                  {displayHasNew && (
                    <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4 animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-900">
                            🆕 Memory leak in event listeners
                          </h4>
                          <p className="text-sm text-red-600 mt-1">
                            src/utils/eventManager.js:12
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded">
                          NEW
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Demo Controls */}
              <DemoControls repoName={repoName} />

              {/* Real-time Features Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">
                  ⚡ Real-time Features
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Live issue detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Auto-updating counts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Push notifications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Real-time collaboration</span>
                  </li>
                </ul>
              </div>

              {/* Last Analysis Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">📋 Analysis Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Last scan: {new Date(displayLastUpdate).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Contributors: 12 active
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BellIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Notifications: Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export const Route = createFileRoute('/repo-realtime')({
  validateSearch: (search: Record<string, unknown>): RepoSearchParams => ({
    name: (search.name as string) || '',
  }),
  component: RepositoryPage,
});