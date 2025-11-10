/**
 * Single Repository Analysis Page
 * CodeCraft - Hackathon Project
 * 
 * Shows detailed analysis for a single repo with:
 * - CodeRabbit AI reviews (left column)
 * - Sentry errors (right column)
 * - Interactive features and real-time updates
 * - Loading, error, and empty states
 */

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  BugAntIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner, ErrorBoundary } from '../components'
import { 
  getMockRepoByName, 
  getMockCodeRabbitReviews, 
  getMockSentryErrors,
  simulateApiDelay,
  type CodeRabbitReview,
  type SentryError,
  type MockRepository
} from '../lib/mock-data'

// Search params type
type RepoSearchParams = {
  name: string
}

// Component for severity badges with proper color coding
const SeverityBadge: React.FC<{ severity: string; type?: 'review' | 'error' }> = ({ 
  severity, 
  type = 'review' 
}) => {
  const getStyles = () => {
    if (type === 'error') {
      switch (severity) {
        case 'fatal': return 'bg-red-100 text-red-800 border-red-200'
        case 'error': return 'bg-red-100 text-red-800 border-red-200'
        case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    } else {
      switch (severity) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200'
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'low': return 'bg-green-100 text-green-800 border-green-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {severity}
    </span>
  )
}

// Component for issue type badges
const IssueTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case 'bug': return <BugAntIcon className="w-3 h-3 mr-1" />
      case 'security': return <ShieldExclamationIcon className="w-3 h-3 mr-1" />
      case 'performance': return <CpuChipIcon className="w-3 h-3 mr-1" />
      case 'style': return <EyeIcon className="w-3 h-3 mr-1" />
      case 'maintainability': return <WrenchScrewdriverIcon className="w-3 h-3 mr-1" />
      default: return <InformationCircleIcon className="w-3 h-3 mr-1" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'bug': return 'bg-red-50 text-red-700 border-red-200'
      case 'security': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'performance': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'style': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'maintainability': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {getIcon()}
      {type}
    </span>
  )
}

// CodeRabbit Review Card Component
const CodeRabbitCard: React.FC<{ 
  review: CodeRabbitReview; 
  onSaveReview: (review: CodeRabbitReview) => void;
  onToggleExpanded: (reviewId: string) => void;
  isExpanded: boolean;
}> = ({ review, onSaveReview, onToggleExpanded, isExpanded }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      onSaveReview(review)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000) // Reset after 3 seconds
    } catch (error) {
      console.error('Error saving review:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">{review.fileName}</h4>
          <p className="text-xs text-gray-500">Line {review.line}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <IssueTypeBadge type={review.issueType} />
          <SeverityBadge severity={review.severity} />
        </div>
      </div>

      {/* Issue Message */}
      <p className="text-sm text-gray-700 mb-3">{review.message}</p>

      {/* Expandable Content */}
      <div className="space-y-3">
        <button
          onClick={() => onToggleExpanded(review.reviewId)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4 mr-1" />
              Show AI Suggestion & Code
            </>
          )}
        </button>

        {isExpanded && (
          <div className="space-y-4">
            {/* AI Suggestion */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h5 className="text-xs font-medium text-blue-800 mb-2">💡 AI Suggestion</h5>
              <p className="text-xs text-blue-700">{review.suggestion}</p>
            </div>

            {/* Code Snippet */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <h5 className="text-xs font-medium text-gray-700 mb-2">📝 Code Snippet</h5>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                <code>{review.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="w-3 h-3 mr-1" />
            {new Date(review.createdAt).toLocaleDateString()}
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              isSaved 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : isSaving
                  ? 'bg-gray-100 text-gray-500 border border-gray-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
            }`}
          >
            {isSaving ? (
              'Saving...'
            ) : isSaved ? (
              <>
                <CheckCircleIcon className="w-3 h-3 inline mr-1" />
                Saved
              </>
            ) : (
              'Save Review'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Sentry Error Card Component
const SentryErrorCard: React.FC<{ 
  error: SentryError;
  onToggleExpanded: (errorId: string) => void;
  isExpanded: boolean;
}> = ({ error, onToggleExpanded, isExpanded }) => {
  const isRecent = () => {
    const errorTime = new Date(error.occurredAt).getTime()
    const now = Date.now()
    const hoursDiff = (now - errorTime) / (1000 * 60 * 60)
    return hoursDiff <= 2 // Within last 2 hours
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffHours * 60)
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`
    } else {
      const diffDays = Math.round(diffHours / 24)
      return `${diffDays}d ago`
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {isRecent() && (
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" 
                   title="Recent activity" />
            )}
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {error.errorMessage}
            </h4>
          </div>
          <p className="text-xs text-gray-500">{error.errorType}</p>
        </div>
        <SeverityBadge severity={error.severity} type="error" />
      </div>

      {/* Error Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <UsersIcon className="w-4 h-4 text-gray-400 mr-1" />
          </div>
          <p className="text-xs font-medium text-gray-900">{error.affectedUsers}</p>
          <p className="text-xs text-gray-500">Users</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <ExclamationTriangleIcon className="w-4 h-4 text-gray-400 mr-1" />
          </div>
          <p className="text-xs font-medium text-gray-900">{error.totalOccurrences}</p>
          <p className="text-xs text-gray-500">Events</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
          </div>
          <p className="text-xs font-medium text-gray-900">{formatTime(error.occurredAt)}</p>
          <p className="text-xs text-gray-500">Last seen</p>
        </div>
      </div>

      {/* Environment Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="bg-gray-100 px-2 py-1 rounded">{error.environment}</span>
        {error.browser && <span>{error.browser}</span>}
        {error.os && <span>{error.os}</span>}
      </div>

      {/* Expandable Stack Trace */}
      <button
        onClick={() => onToggleExpanded(error.errorId)}
        className="flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium w-full"
      >
        {isExpanded ? (
          <>
            <ChevronUpIcon className="w-4 h-4 mr-1" />
            Hide Stack Trace
          </>
        ) : (
          <>
            <ChevronDownIcon className="w-4 h-4 mr-1" />
            Show Stack Trace
          </>
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-3">
          <h5 className="text-xs font-medium text-gray-700 mb-2">🐛 Stack Trace</h5>
          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
            {error.stackTrace}
          </pre>
          {error.url && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>URL:</strong> {error.url}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main Repository Component
function RepositoryPage() {
  const { name: repoName } = Route.useSearch()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  
  // State management
  const [repository, setRepository] = useState<MockRepository | null>(null)
  const [codeRabbitReviews, setCodeRabbitReviews] = useState<CodeRabbitReview[]>([])
  const [sentryErrors, setSentryErrors] = useState<SentryError[]>([])
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())
  
  // Loading states
  const [loading, setLoading] = useState({
    initial: true,
    reviews: false,
    errors: false,
    generating: false
  })
  
  // Error states
  const [errors, setErrors] = useState({
    repository: null as string | null,
    reviews: null as string | null,
    errors: null as string | null,
    generating: null as string | null
  })

  // Check authentication and repo name
  useEffect(() => {
    if (!isSignedIn) {
      navigate({ to: '/signin' })
      return
    }

    if (!repoName) {
      navigate({ to: '/' })
      return
    }
  }, [isSignedIn, repoName, navigate])

  // Load repository data with error handling
  const loadRepositoryData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }))
      setErrors({ repository: null, reviews: null, errors: null, generating: null })
      
      // Simulate API loading delay
      await simulateApiDelay(1000)
      
      if (!repoName) {
        throw new Error('Repository name is required')
      }
      
      // Fetch repository data
      const repo = getMockRepoByName(repoName)
      if (!repo) {
        throw new Error(`Repository '${repoName}' not found`)
      }
      
      setRepository(repo)
      
      // Load reviews and errors in parallel
      await Promise.all([
        loadReviews(repoName),
        loadErrors(repoName)
      ])
      
    } catch (error) {
      console.error('Error loading repository data:', error)
      setErrors(prev => ({ 
        ...prev, 
        repository: error instanceof Error ? error.message : 'Failed to load repository data'
      }))
    } finally {
      setLoading(prev => ({ ...prev, initial: false }))
    }
  }

  // Load CodeRabbit reviews with error handling
  const loadReviews = async (name: string) => {
    try {
      setLoading(prev => ({ ...prev, reviews: true }))
      setErrors(prev => ({ ...prev, reviews: null }))
      
      await simulateApiDelay(800)
      const reviews = getMockCodeRabbitReviews(name)
      setCodeRabbitReviews(reviews)
      
    } catch (error) {
      console.error('Error loading reviews:', error)
      setErrors(prev => ({ 
        ...prev, 
        reviews: 'Failed to load CodeRabbit reviews. Please check your connection and try again.'
      }))
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }))
    }
  }

  // Load Sentry errors with error handling
  const loadErrors = async (name: string) => {
    try {
      setLoading(prev => ({ ...prev, errors: true }))
      setErrors(prev => ({ ...prev, errors: null }))
      
      await simulateApiDelay(600)
      const sentryData = getMockSentryErrors(name)
      setSentryErrors(sentryData)
      
    } catch (error) {
      console.error('Error loading Sentry errors:', error)
      setErrors(prev => ({ 
        ...prev, 
        errors: 'Failed to load Sentry errors. Please check your connection and try again.'
      }))
    } finally {
      setLoading(prev => ({ ...prev, errors: false }))
    }
  }

  // Retry functions
  const retryRepositoryData = () => {
    if (repoName) {
      loadRepositoryData()
    }
  }

  const retryReviews = () => {
    if (repoName) {
      loadReviews(repoName)
    }
  }

  const retryErrors = () => {
    if (repoName) {
      loadErrors(repoName)
    }
  }

  // Load repository data on mount
  useEffect(() => {
    if (isSignedIn && repoName) {
      loadRepositoryData()
    }
  }, [repoName, isSignedIn])

  // Toggle expanded state for reviews
  const toggleReviewExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  // Toggle expanded state for errors
  const toggleErrorExpanded = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(errorId)) {
        newSet.delete(errorId)
      } else {
        newSet.add(errorId)
      }
      return newSet
    })
  }

  // Save review to Convex with error handling
  const handleSaveReview = async (review: CodeRabbitReview) => {
    try {
      console.log('Saving review to database:', review.reviewId)
      await simulateApiDelay(500)
    } catch (error) {
      console.error('Error saving review:', error)
      throw error
    }
  }

  // Generate new review with error handling
  const handleGenerateNewReview = async () => {
    try {
      setLoading(prev => ({ ...prev, generating: true }))
      setErrors(prev => ({ ...prev, generating: null }))
      
      // Simulate AI analysis delay
      await simulateApiDelay(2000)
      
      // Create a new mock review
      const newReview: CodeRabbitReview = {
        reviewId: `cr-new-${Date.now()}`,
        repoName: repository?.name || '',
        fileName: 'src/components/NewFeature.tsx',
        issueType: 'performance',
        severity: 'medium',
        line: Math.floor(Math.random() * 100) + 1,
        message: 'Newly generated review: Component could benefit from memoization',
        suggestion: 'Consider using React.memo() to prevent unnecessary re-renders when props haven\'t changed',
        codeSnippet: `const NewFeature = ({ data, onUpdate }) => {
  // ⚠️ Re-renders on every parent update
  const processedData = data.map(item => ({ ...item, processed: true }));
  return <div>{/* component content */}</div>;
};`,
        createdAt: new Date().toISOString(),
        status: 'open'
      }
      
      setCodeRabbitReviews(prev => [newReview, ...prev])
      
    } catch (error) {
      console.error('Error generating new review:', error)
      setErrors(prev => ({ 
        ...prev, 
        generating: 'Failed to generate new review. Please try again.'
      }))
    } finally {
      setLoading(prev => ({ ...prev, generating: false }))
    }
  }

  // Calculate summary stats
  const summaryStats = () => {
    const totalIssues = codeRabbitReviews.length + sentryErrors.filter(e => e.severity === 'error' || e.severity === 'fatal').length
    const criticalCount = codeRabbitReviews.filter(r => r.severity === 'high').length + 
                         sentryErrors.filter(e => e.severity === 'fatal').length
    const fixedCount = codeRabbitReviews.filter(r => r.status === 'resolved').length
    
    return { totalIssues, criticalCount, fixedCount }
  }

  // Handle empty repository name
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
    )
  }

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
    )
  }

  if (loading.initial) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" message="Loading repository analysis..." />
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (errors.repository) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Repository Error</h2>
            <p className="text-gray-600 mb-4">{errors.repository}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retryRepositoryData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200"
              >
                Try Again
              </button>
              <Link to="/">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 
                               focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                               transition-colors duration-200">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Repository Not Found</h2>
          <p className="text-gray-600 mb-4">The requested repository "{repoName}" could not be found.</p>
          <Link to="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const stats = summaryStats()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {repository.owner}/{repository.name}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {repository.language}
                  </span>
                  <span className="text-sm text-gray-500">
                    ⭐ {repository.stars.toLocaleString()} stars
                  </span>
                  <span className="text-sm text-gray-500">
                    Updated {new Date(repository.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {repository.description && (
            <p className="mt-4 text-gray-700">{repository.description}</p>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* LEFT COLUMN - CodeRabbit Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                🤖 CodeRabbit AI Reviews
                <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {codeRabbitReviews.length}
                </span>
              </h2>
              <button
                onClick={handleGenerateNewReview}
                disabled={loading.generating}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  loading.generating
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading.generating ? (
                  <>
                    <LoadingSpinner size="sm" className="inline-block mr-2" />
                    Generating...
                  </>
                ) : (
                  'Generate New Review'
                )}
              </button>
            </div>
            
            {loading.reviews ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <LoadingSpinner message="Loading CodeRabbit reviews..." />
              </div>
            ) : errors.reviews ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unable to Load Reviews
                  </h3>
                  <p className="text-gray-600 mb-4">{errors.reviews}</p>
                  <button
                    onClick={retryReviews}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {codeRabbitReviews.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No code reviews found</p>
                    <p className="text-sm text-gray-500">This repository is in excellent shape!</p>
                  </div>
                ) : (
                  codeRabbitReviews.map(review => (
                    <CodeRabbitCard
                      key={review.reviewId}
                      review={review}
                      onSaveReview={handleSaveReview}
                      onToggleExpanded={toggleReviewExpanded}
                      isExpanded={expandedReviews.has(review.reviewId)}
                    />
                  ))
                )}
              </div>
            )}

            {errors.generating && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">{errors.generating}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sentry Errors */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              🚨 Sentry Errors
              <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {sentryErrors.length}
              </span>
            </h2>
            
            {loading.errors ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <LoadingSpinner message="Loading Sentry errors..." />
              </div>
            ) : errors.errors ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unable to Load Errors
                  </h3>
                  <p className="text-gray-600 mb-4">{errors.errors}</p>
                  <button
                    onClick={retryErrors}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {sentryErrors.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No errors detected</p>
                    <p className="text-sm text-gray-500">Your application is running smoothly!</p>
                  </div>
                ) : (
                  sentryErrors.map(error => (
                    <SentryErrorCard
                      key={error.errorId}
                      error={error}
                      onToggleExpanded={toggleErrorExpanded}
                      isExpanded={expandedErrors.has(error.errorId)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Summary Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalIssues}</div>
              <div className="text-sm text-gray-600">Total Issues Found</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.criticalCount}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.fixedCount}</div>
              <div className="text-sm text-gray-600">Issues Resolved</div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Last analysis completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export const Route = createFileRoute('/repo')({
  validateSearch: (search: Record<string, unknown>): RepoSearchParams => ({
    name: (search.name as string) || '',
  }),
  component: RepositoryPage,
})