import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useState, useCallback } from 'react'
import { 
  GithubIcon, 
  StarIcon, 
  CodeIcon,
  ErrorIcon,
  TrendUpIcon,
  RefreshIcon,
  EyeIcon,
  CheckIcon
} from '../lib/icons'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { AddRepositoryModal, showNotification, LoadingSpinner } from '../components'
import { useGitHubAuth } from '../lib/github-auth'
import type { GitHubRepository } from '../lib/github-auth'
import { analyzeRepo } from '../server/functions'
import { useDashboardStats, useUserReviews, useSaveReview } from '../lib/convex-hooks'

// Types following CodeCraft rules
interface Repository {
  id: string
  name: string
  owner: string
  url: string
  language: string
  stars: number
  description: string
  lastUpdated: string
  isPrivate: boolean
  defaultBranch: string
}

interface RepositoryCardProps {
  repository: Repository
}

interface InstallationRepoEntry {
  installationId: number
  accountLogin: string
  repositorySelection: 'all' | 'selected'
  repositories: GitHubRepository[]
}

// Repository Card Component with dark theme
const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-900/50 text-blue-200 border-blue-700',
      'Python': 'bg-green-900/50 text-green-200 border-green-700',
      'Java': 'bg-red-900/50 text-red-200 border-red-700',
      'React Native': 'bg-purple-900/50 text-purple-200 border-purple-700',
      'JavaScript': 'bg-amber-900/50 text-amber-200 border-amber-700',
    }
    return colors[language] || 'bg-slate-700/50 text-slate-300 border-slate-600'
  }

  const formatStars = (stars: number): string => {
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1)}k`
    }
    return stars.toString()
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 24) {
        return `${diffInHours}h ago`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown'
    }
  }

  return (
    <article className="card card-hover group animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-700 rounded-lg group-hover:bg-slate-600 transition-colors">
            <GithubIcon size="md" color="secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
              {repository.name}
            </h3>
            <p className="text-sm text-slate-400">@{repository.owner}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <StarIcon size="sm" color="warning" />
          <span className="text-sm font-medium">{formatStars(repository.stars)}</span>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
        {repository.description}
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLanguageColor(repository.language)}`}>
            {repository.language}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <RefreshIcon size="xs" color="secondary" />
            {formatDate(repository.lastUpdated)}
          </span>
        </div>
        {repository.isPrivate && (
          <Badge type="info" label="Private" size="sm" variant="ghost" />
        )}
      </div>

      <Link 
        to="/repo"
        search={{ name: repository.name }}
        className="btn btn-primary btn-md w-full group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all"
      >
        <CodeIcon size="sm" />
        <span>Review Repository</span>
        <EyeIcon size="sm" />
      </Link>
    </article>
  )
}

// Enhanced Welcome Section for Unauthenticated Users
const WelcomeSection = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
          <span className="text-white font-bold text-3xl">C</span>
        </div>
        <h1 className="heading-1 mb-6">
          CodeCraft
        </h1>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          AI-powered code review and error tracking dashboard for GitHub repositories. 
          Get automated insights, catch bugs early, and ship better code.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="card p-8 text-left group hover:scale-105 transition-transform">
          <div className="mb-4">
            <GithubIcon size="xl" color="primary" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100 mb-3">CodeRabbit Integration</h3>
          <p className="text-slate-300 leading-relaxed">
            Automated code reviews with AI-powered insights, security analysis, and smart suggestions for better code quality.
          </p>
        </div>
        
        <div className="card p-8 text-left group hover:scale-105 transition-transform">
          <div className="mb-4">
            <ErrorIcon size="xl" color="error" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100 mb-3">Sentry Error Tracking</h3>
          <p className="text-slate-300 leading-relaxed">
            Real-time error monitoring, performance tracking, and detailed stack traces to keep your apps running smoothly.
          </p>
        </div>
      </div>

      <Link 
        to="/signin"
        className="btn btn-primary btn-lg glow-blue animate-pulse-glow"
      >
        <span>Get Started</span>
        <TrendUpIcon size="sm" />
      </Link>
    </div>
  </div>
)

// Loading State Component
const LoadingState = () => (
  <div className="animate-fade-in">
    <div className="mb-8">
      <div className="loading-skeleton h-8 w-1/3 mb-4"></div>
      <div className="loading-skeleton h-4 w-1/2 mb-8"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="loading-skeleton h-24 w-full"></div>
        </div>
      ))}
    </div>
    <div className="loading-skeleton h-6 w-1/4 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="loading-skeleton h-48 w-full"></div>
        </div>
      ))}
    </div>
  </div>
)

// Error State Component
const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="text-center py-16 animate-fade-in">
    <div className="card p-8 max-w-md mx-auto">
      <ErrorIcon size="xl" color="error" className="mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-red-300 mb-3">Error Loading Dashboard</h2>
      <p className="text-slate-400 mb-6">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="btn btn-primary btn-md"
      >
        <RefreshIcon size="sm" />
        Retry
      </button>
    </div>
  </div>
)

// Main Dashboard Component
const DashboardPage = () => {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  
  // Use Convex hooks for real-time data
  const { stats, isLoading: statsLoading, hasError: statsError, error: statsErrorMessage } = useDashboardStats()
  const { reviews: allReviews, isLoading: reviewsLoading } = useUserReviews()
  const { save: saveReview } = useSaveReview()
  
  // State management following CodeCraft rules
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state for adding repositories
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isInstallingApp, setIsInstallingApp] = useState(false)
  const [installationRepos, setInstallationRepos] = useState<InstallationRepoEntry[]>([])
  const [isLoadingInstallationRepos, setIsLoadingInstallationRepos] = useState(false)
  const [installationRepoError, setInstallationRepoError] = useState<string | null>(null)

  const {
    installApp,
    fetchInstallationRepositories,
    fetchUserInstallations,
    isAuthenticated: isGitHubAuthenticated,
  } = useGitHubAuth()

  const handleConnectRepository = async () => {
    try {
      setIsInstallingApp(true)
      await installApp()
      setIsModalOpen(true)
    } catch (error) {
      console.error('GitHub App installation failed:', error)
      showNotification({
        type: 'error',
        title: 'GitHub App Installation Failed',
        message: error instanceof Error ? error.message : 'Unable to open GitHub installation. Please try again.',
      })
    } finally {
      setIsInstallingApp(false)
    }
  }

  const refreshInstallationRepos = useCallback(async () => {
    if (!isGitHubAuthenticated) {
      setInstallationRepoError('Connect GitHub via OAuth to list accessible repositories.')
      setInstallationRepos([])
      return
    }

    try {
      setIsLoadingInstallationRepos(true)
      setInstallationRepoError(null)

      const installations = await fetchUserInstallations()
      if (!installations.length) {
        setInstallationRepos([])
        return
      }

      const entries: InstallationRepoEntry[] = []

      for (const installation of installations) {
        try {
          const repositories = await fetchInstallationRepositories(installation.id.toString())
          entries.push({
            installationId: installation.id,
            accountLogin: installation.account.login,
            repositorySelection: installation.repository_selection,
            repositories,
          })
        } catch (error) {
          console.error('Failed to fetch repositories for installation', installation.id, error)
          setInstallationRepoError('Unable to fetch some repositories. Please refresh.')
        }
      }

      setInstallationRepos(entries)
    } catch (error) {
      console.error('Failed to load GitHub installations', error)
      setInstallationRepoError(
        error instanceof Error ? error.message : 'Failed to load GitHub installations.'
      )
      setInstallationRepos([])
    } finally {
      setIsLoadingInstallationRepos(false)
    }
  }, [
    fetchInstallationRepositories,
    fetchUserInstallations,
    isGitHubAuthenticated,
  ])

  // Convert reviews to repositories for display
  const convertReviewsToRepositories = useCallback((reviews: any[]): Repository[] => {
    return reviews.map((review, index) => {
      const urlMatch = review.repoUrl?.match(/github\.com\/([^\/]+)\/([^\/]+)/) || []
      const [, owner = 'unknown', name = `repo-${index}`] = urlMatch
      
      return {
        id: review._id,
        name,
        owner,
        url: review.repoUrl || '',
        language: 'TypeScript', // Default, could be enhanced
        stars: 0, // Could be fetched from GitHub API
        description: `Repository analyzed with ${review.reviewData.summary.totalIssues} issues found`,
        lastUpdated: new Date(review.createdAt).toISOString(),
        isPrivate: false,
        defaultBranch: 'main'
      }
    })
  }, []);

  // Handle repository analysis with enhanced data
  const handleAddRepository = async (repoUrl: string, repoData?: any) => {
    if (!userId) {
      showNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to add repositories.'
      })
      return
    }

    try {
      setIsAnalyzing(true)
      
      console.log('Analyzing repository:', repoUrl, repoData)
      
      // Call the analyze function
      const result = await analyzeRepo(repoUrl)
      
      // Check if analysis returned data
      if (result && result.codeRabbitReviews && result.sentryErrors) {
        // Save the review using Convex
        const reviewData = {
          summary: result.metrics,
          issues: result.codeRabbitReviews,
          sentryErrors: result.sentryErrors,
          analysisTimestamp: Date.now(),
          toolsUsed: ['coderabbit', 'sentry']
        }

        // Use repository data from GitHub if available
        let repositoryName = 'Repository'
        let repoOwner = 'unknown'
        
        if (repoData) {
          repositoryName = repoData.name
          repoOwner = repoData.owner.login
        } else {
          const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
          if (urlMatch) {
            const [, owner, name] = urlMatch
            repositoryName = name
            repoOwner = owner
          }
        }
        
        // Save to Convex database
        await saveReview({
          clerkId: userId,
          repoName: `${repoOwner}/${repositoryName}`,
          repoUrl,
          reviewData
        })
        
        // Close modal
        setIsModalOpen(false)
        
        console.log('Repository analysis completed successfully:', result)
        
        // Show success notification
        showNotification({
          type: 'success',
          title: 'Repository Added Successfully',
          message: `${repositoryName} has been analyzed and added to your dashboard.`
        })
        
      } else {
        console.error('Repository analysis returned incomplete data:', result)
        showNotification({
          type: 'error',
          title: 'Analysis Failed',
          message: 'Failed to analyze repository completely. Please try again.'
        })
      }
      
    } catch (error) {
      console.error('Error adding repository:', error)
      showNotification({
        type: 'error',
        title: 'Error Adding Repository',
        message: 'Failed to add repository. Please check the URL and try again.'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Update repositories when reviews change
  React.useEffect(() => {
    if (allReviews) {
      const repos = convertReviewsToRepositories(allReviews)
      setRepositories(repos)
      setIsLoading(false)
    }
  }, [allReviews, convertReviewsToRepositories])

  React.useEffect(() => {
    if (isGitHubAuthenticated) {
      refreshInstallationRepos()
    } else {
      setInstallationRepos([])
      setInstallationRepoError(null)
    }
  }, [isGitHubAuthenticated, refreshInstallationRepos])

  // Handle loading and error states
  React.useEffect(() => {
    if (statsError || statsErrorMessage) {
      setError(statsErrorMessage || 'Failed to load dashboard data')
      setIsLoading(false)
    }
  }, [statsError, statsErrorMessage])

  // Redirect to signin if not authenticated
  if (!isSignedIn) {
    return <WelcomeSection />
  }

  // Show loading state
  if (isLoading || statsLoading || reviewsLoading) {
    return <LoadingState />
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />
  }

  // Calculate dashboard stats from real data
  const dashboardStats = {
    totalRepos: stats?.totalReviews || 0,
    totalIssues: stats?.totalIssuesFound || 0,
    criticalBugs: stats?.criticalIssues || 0,
    resolvedIssues: stats?.majorIssues || 0, // Using major issues as resolved for now
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section with Primary Add Repository Button */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div className="flex-1">
          <h1 className="heading-1 mb-2">
            Welcome back, Developer! 👋
          </h1>
          <p className="text-lg text-slate-300 mb-4">
            {user?.firstName || 'You have'} {dashboardStats.totalRepos} repositories under review
          </p>
          
          {/* Quick stats summary */}
          {dashboardStats.totalRepos > 0 && (
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{dashboardStats.resolvedIssues} resolved issues</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{dashboardStats.criticalBugs} critical bugs</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Live monitoring</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Primary Add Repository Button - Positioned like Vercel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {repositories.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Last updated</p>
              <p className="text-sm font-medium text-slate-300">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
          
          <button 
            className="btn btn-primary btn-lg glow-blue whitespace-nowrap"
            onClick={handleConnectRepository}
            disabled={isInstallingApp}
          >
            <GithubIcon size="sm" />
            <span>{isInstallingApp ? 'Waiting for GitHub…' : 'Connect Repository'}</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Repositories"
          value={dashboardStats.totalRepos}
          icon="github"
          description="Repositories analyzed"
          color="primary"
          trend={{ value: 12, isPositive: true, label: "this month" }}
        />
        <StatCard
          title="Total Issues"
          value={dashboardStats.totalIssues}
          icon="bug"
          description="Issues identified"
          color="warning"
          trend={{ value: 8, isPositive: false, label: "vs last month" }}
        />
        <StatCard
          title="Critical Bugs"
          value={dashboardStats.criticalBugs}
          icon="shield"
          description="High priority fixes"
          color="error"
          trend={{ value: 15, isPositive: false, label: "needs attention" }}
        />
        <StatCard
          title="Issues Resolved"
          value={dashboardStats.resolvedIssues}
          icon="check"
          description="Fixed this month"
          color="success"
          trend={{ value: 23, isPositive: true, label: "great progress!" }}
        />
      </div>

      {/* GitHub App Access Section */}
      <div className="card border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="heading-2 mb-1">GitHub App Access</h2>
            <p className="text-slate-400 text-sm">
              Repositories CodeCraft can read based on your GitHub App installations
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm whitespace-nowrap"
            onClick={refreshInstallationRepos}
            disabled={isLoadingInstallationRepos || !isGitHubAuthenticated}
          >
            <RefreshIcon size="sm" color="secondary" />
            <span>{isLoadingInstallationRepos ? 'Refreshing…' : 'Refresh list'}</span>
          </button>
        </div>

        {installationRepoError && (
          <p className="text-sm text-red-300">{installationRepoError}</p>
        )}

        {!isGitHubAuthenticated ? (
          <p className="text-slate-400 text-sm">
            Authenticate with GitHub to load the repositories granted via your installations.
          </p>
        ) : isLoadingInstallationRepos ? (
          <div className="flex items-center space-x-3 text-slate-200">
            <LoadingSpinner size="sm" />
            <span>Fetching repositories…</span>
          </div>
        ) : installationRepos.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No GitHub App installations detected yet. Install CodeCraft on your GitHub account to grant access.
          </p>
        ) : (
          <div className="space-y-4">
            {installationRepos.map((entry) => {
              const displayedRepos = entry.repositories.slice(0, 12)
              const remaining = entry.repositories.length - displayedRepos.length
              return (
                <div
                  key={entry.installationId}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-slate-200 font-medium">@{entry.accountLogin}</p>
                      <p className="text-xs text-slate-400">
                        Access: {entry.repositorySelection === 'all' ? 'All repositories' : 'Selected repositories'}
                      </p>
                    </div>
                    <Badge
                      type="info"
                      variant="ghost"
                      label={`${entry.repositories.length} repo${entry.repositories.length === 1 ? '' : 's'}`}
                    />
                  </div>
                  {displayedRepos.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No repositories returned for this installation yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayedRepos.map((repo) => (
                        <a
                          key={repo.id}
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-300 border border-slate-700 rounded-full px-3 py-1 hover:border-blue-500 hover:text-blue-300 transition"
                        >
                          {repo.full_name}
                        </a>
                      ))}
                      {remaining > 0 && (
                        <span className="text-xs text-slate-500">+{remaining} more…</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Repository List Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="heading-2 mb-2">Your Repositories</h2>
              <p className="text-slate-400">
                Recent repositories ready for code review and analysis
              </p>
            </div>
            {repositories.length > 0 && (
              <Badge 
                type="success" 
                label={`${repositories.length} ${repositories.length === 1 ? 'repository' : 'repositories'}`} 
                showIcon 
                variant="ghost" 
              />
            )}
          </div>
          
          {repositories.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live monitoring</span>
            </div>
          )}
        </div>

        {repositories.length === 0 ? (
          <div className="card text-center py-16 border-2 border-dashed border-slate-700">
            <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GithubIcon size="xl" color="secondary" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">No repositories analyzed yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
              Connect your GitHub account and select repositories to start analyzing code quality and tracking issues
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CodeIcon size="sm" color="primary" />
                </div>
                <p className="text-xs text-slate-400">AI Code Review</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckIcon size="sm" color="success" />
                </div>
                <p className="text-xs text-slate-400">Issue Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendUpIcon size="sm" color="primary" />
                </div>
                <p className="text-xs text-slate-400">Analytics</p>
              </div>
            </div>
            
            <button 
              className="btn btn-primary btn-lg glow-blue"
              onClick={handleConnectRepository}
              disabled={isInstallingApp}
            >
              <GithubIcon size="sm" />
              {isInstallingApp ? 'Waiting for GitHub…' : 'Connect GitHub'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {repositories.map((repo, index) => (
              <div key={repo.id} className="animation-delay-200" style={{ animationDelay: `${index * 100}ms` }}>
                <RepositoryCard repository={repo} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Repository Modal */}
      <AddRepositoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRepository}
        isLoading={isAnalyzing}
      />
    </div>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})