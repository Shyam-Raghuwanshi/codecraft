import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth, useUser } from '@clerk/clerk-react'
import { UserButton } from '@clerk/clerk-react'
import { 
  GithubIcon, 
  StarIcon, 
  CodeIcon,
  ErrorIcon,
  TrendUpIcon,
  RefreshIcon,
  EyeIcon
} from '../lib/icons'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { getMockRepos, getMockDashboardStats, type MockRepository } from '../lib/mock-data'
import { useState, useEffect } from 'react'

// Types following CodeCraft rules
interface DashboardStats {
  totalRepos: number
  totalIssues: number
  criticalBugs: number
  resolvedIssues: number
}

interface RepositoryCardProps {
  repository: MockRepository
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
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
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
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  
  // State management following CodeCraft rules
  const [repositories, setRepositories] = useState<MockRepository[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRepos: 0,
    totalIssues: 0,
    criticalBugs: 0,
    resolvedIssues: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data with error handling
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate loading delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 800))

        const mockRepos = getMockRepos()
        const mockStats = getMockDashboardStats()

        if (!mockRepos || mockRepos.length === 0) {
          throw new Error('No repositories found')
        }

        setRepositories(mockRepos.slice(0, 6)) // Show only first 6 repos
        setDashboardStats({
          totalRepos: mockStats.totalRepos,
          totalIssues: mockStats.totalIssues,
          criticalBugs: mockStats.criticalIssues || 0,
          resolvedIssues: mockStats.resolvedErrors || 0
        })

      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    if (isSignedIn) {
      loadDashboardData()
    }
  }, [isSignedIn])

  // Redirect to signin if not authenticated
  if (!isSignedIn) {
    return <WelcomeSection />
  }

  // Show loading state
  if (isLoading) {
    return <LoadingState />
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="heading-1 mb-2">
            Welcome back, Developer! 👋
          </h1>
          <p className="text-lg text-slate-300">
            {user?.firstName || 'You have'} {dashboardStats.totalRepos} repositories under review
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <UserButton 
            afterSignOutUrl="/signin"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10 ring-2 ring-blue-500/30 hover:ring-blue-400 transition-all",
                userButtonPopoverCard: "bg-slate-800 border-slate-700",
                userButtonPopoverFooter: "bg-slate-800",
                userButtonPopoverActionButton: "text-slate-200 hover:bg-slate-700"
              }
            }}
          />
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

      {/* Repository List Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading-2 mb-2">Your Repositories</h2>
            <p className="text-slate-400">
              Recent repositories ready for code review and analysis
            </p>
          </div>
          <Badge type="success" label="Live monitoring" showIcon variant="ghost" />
        </div>

        {repositories.length === 0 ? (
          <div className="card text-center py-16">
            <GithubIcon size="xl" color="secondary" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No repositories found</h3>
            <p className="text-slate-400 mb-6">Connect your GitHub account to start analyzing repositories</p>
            <button className="btn btn-primary btn-md">
              <GithubIcon size="sm" />
              Connect GitHub
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo, index) => (
              <div key={repo.id} className="animation-delay-200" style={{ animationDelay: `${index * 100}ms` }}>
                <RepositoryCard repository={repo} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card-glow p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-100 mb-3">Ready to analyze more repositories?</h3>
            <p className="text-slate-300 leading-relaxed">
              Connect additional repositories and get comprehensive code reviews with our AI-powered analysis. 
              Catch bugs early and improve code quality across your entire organization.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <TrendUpIcon size="sm" />
              <span className="text-sm font-medium">98% accuracy rate</span>
            </div>
            <button className="btn btn-primary btn-lg glow-blue">
              <GithubIcon size="sm" />
              <span>Add Repository</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: DashboardPage,
})