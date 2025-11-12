/**
 * Single Repository Analysis Page
 * CodeCraft - Dynamic Functionality
 * 
 * Shows detailed analysis for a single repo using real Convex data
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  BugAntIcon,
  ShieldExclamationIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

// Search params type
type RepoSearchParams = {
  name: string
}

// Repository page component
function RepositoryPage() {
  const { name: repoName } = Route.useSearch()
  const navigate = useNavigate()
  const { isSignedIn, userId } = useAuth()
  
  // Get user reviews from Convex
  const allReviews = useQuery(
    api.functions.getUserReviews,
    userId ? { clerkId: userId } : 'skip'
  )
  
  // State for current repository
  const [currentReview, setCurrentReview] = useState<any | null>(null)
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication
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

  // Find the current repository review
  useEffect(() => {
    if (allReviews && repoName) {
      try {
        const matchingReview = allReviews.find(review => 
          review.repoName.toLowerCase().includes(repoName.toLowerCase())
        )
        
        if (matchingReview) {
          setCurrentReview(matchingReview)
          setError(null)
        } else {
          setError(`Repository "${repoName}" not found in your analyzed repositories.`)
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Error finding repository:', err)
        setError('Failed to load repository data.')
        setIsLoading(false)
      }
    } else if (allReviews) {
      setError(`Repository "${repoName}" not found.`)
      setIsLoading(false)
    }
  }, [allReviews, repoName])

  // Toggle expanded state for issues
  const toggleIssueExpanded = (issueId: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev)
      if (newSet.has(issueId)) {
        newSet.delete(issueId)
      } else {
        newSet.add(issueId)
      }
      return newSet
    })
  }

  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-700'
      case 'major': return 'text-orange-400 bg-orange-900/20 border-orange-700'
      case 'minor': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
      default: return 'text-slate-400 bg-slate-900/20 border-slate-700'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading repository data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Repository Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate({ to: '/' })}
            className="btn btn-primary btn-md"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // No review data
  if (!currentReview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">No review data available.</p>
        </div>
      </div>
    )
  }

  const { reviewData } = currentReview
  const issues = reviewData.issues || []
  const sentryErrors = reviewData.sentryErrors || []
  const summary = reviewData.summary || {}

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate({ to: '/' })}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold">{currentReview.repoName}</h1>
              <p className="text-slate-400">
                Analyzed on {new Date(currentReview.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Issues</p>
                <p className="text-2xl font-bold text-slate-100">{summary.totalIssues || 0}</p>
              </div>
              <BugAntIcon className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Critical Issues</p>
                <p className="text-2xl font-bold text-red-400">{summary.criticalIssues || 0}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Major Issues</p>
                <p className="text-2xl font-bold text-orange-400">{summary.majorIssues || 0}</p>
              </div>
              <ShieldExclamationIcon className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Code Quality</p>
                <p className="text-2xl font-bold text-blue-400">{summary.codeQualityScore || 'N/A'}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Issues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CodeRabbit Issues */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BugAntIcon className="w-6 h-6 mr-2" />
              Code Issues ({issues.length})
            </h2>
            
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No code issues found!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue: any) => (
                  <div key={issue.id} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-100">{issue.title}</h3>
                        <p className="text-sm text-slate-400">{issue.file}:{issue.line}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-3">{issue.description}</p>
                    
                    <button
                      onClick={() => toggleIssueExpanded(issue.id)}
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      {expandedIssues.has(issue.id) ? (
                        <><ChevronUpIcon className="w-4 h-4 mr-1" /> Hide details</>
                      ) : (
                        <><ChevronDownIcon className="w-4 h-4 mr-1" /> Show details</>
                      )}
                    </button>
                    
                    {expandedIssues.has(issue.id) && issue.suggestion && (
                      <div className="mt-3 p-3 bg-slate-800 rounded border border-slate-600">
                        <p className="text-sm text-green-400 font-medium mb-1">Suggestion:</p>
                        <p className="text-sm text-slate-300">{issue.suggestion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sentry Errors */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
              Runtime Errors ({sentryErrors.length})
            </h2>
            
            {sentryErrors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No runtime errors detected!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentryErrors.map((error: any) => (
                  <div key={error.id} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-100">{error.title}</h3>
                        <p className="text-sm text-slate-400">
                          {error.count} occurrences
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(error.level)}`}>
                        {error.level}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-xs">
                      Last seen: {new Date(error.lastSeen).toLocaleString()}
                    </p>
                    
                    {error.url && (
                      <p className="text-slate-400 text-xs mt-1">
                        URL: {error.url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Route configuration
export const Route = createFileRoute('/repo')({
  component: RepositoryPage,
  validateSearch: (search: Record<string, unknown>): RepoSearchParams => {
    return {
      name: typeof search.name === 'string' ? search.name : ''
    }
  }
})