import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth, useUser } from '@clerk/clerk-react'
import { UserButton } from '@clerk/clerk-react'
import { 
  Github, 
  AlertTriangle, 
  CheckCircle, 
  Star, 
  Code, 
  Bug, 
  Shield, 
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react'
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

// Repository Card Component
const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-100 text-blue-800',
      'Python': 'bg-green-100 text-green-800',
      'Java': 'bg-red-100 text-red-800',
      'React Native': 'bg-purple-100 text-purple-800',
      'JavaScript': 'bg-yellow-100 text-yellow-800',
    }
    return colors[language] || 'bg-gray-100 text-gray-800'
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
        return `${diffInHours} hours ago`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} days ago`
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Github className="h-8 w-8 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{repository.name}</h3>
            <p className="text-sm text-gray-500">@{repository.owner}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-gray-500">
          <Star className="h-4 w-4" />
          <span className="text-sm font-medium">{formatStars(repository.stars)}</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {repository.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(repository.language)}`}>
            {repository.language}
          </span>
          <span className="text-xs text-gray-500">
            Updated {formatDate(repository.lastUpdated)}
          </span>
        </div>
        {repository.isPrivate && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            Private
          </span>
        )}
      </div>

      <Link 
        to="/repo"
        search={{ name: repository.name }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <Code className="h-4 w-4" />
        <span>Review Repository</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// Stats Card Component
const StatsCard: React.FC<{
  icon: React.ReactNode
  title: string
  value: number | string
  subtitle?: string
  color: string
}> = ({ icon, title, value, subtitle, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

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
        await new Promise(resolve => setTimeout(resolve, 500))

        const mockRepos = getMockRepos()
        const mockStats = getMockDashboardStats()

        if (!mockRepos || mockRepos.length === 0) {
          throw new Error('No repositories found')
        }

        setRepositories(mockRepos.slice(0, 5)) // Show only first 5 repos
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Github className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              CodeCraft - AI Code Review Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Automated code review and error tracking for your GitHub repositories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Github className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">CodeRabbit Integration</h3>
              <p className="text-gray-600 text-sm">
                Automated code reviews with AI-powered insights and suggestions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <AlertTriangle className="h-8 w-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Sentry Error Tracking</h3>
              <p className="text-gray-600 text-sm">
                Real-time error monitoring and performance tracking
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link 
              to="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CodeCraft - AI Code Review Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'Developer'}!
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <UserButton 
            afterSignOutUrl="/signin"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
                userButtonPopoverCard: "border border-gray-200 shadow-lg",
              }
            }}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<Github className="h-6 w-6 text-blue-600" />}
          title="Total Repositories"
          value={dashboardStats.totalRepos}
          subtitle="Analyzed"
          color="bg-blue-50"
        />
        <StatsCard
          icon={<Bug className="h-6 w-6 text-red-600" />}
          title="Total Issues"
          value={dashboardStats.totalIssues}
          subtitle="Found"
          color="bg-red-50"
        />
        <StatsCard
          icon={<Shield className="h-6 w-6 text-orange-600" />}
          title="Critical Bugs"
          value={dashboardStats.criticalBugs}
          subtitle="Caught"
          color="bg-orange-50"
        />
        <StatsCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          title="Issues Resolved"
          value={dashboardStats.resolvedIssues}
          subtitle="This month"
          color="bg-green-50"
        />
      </div>

      {/* Repository List Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Repositories</h2>
            <p className="text-gray-600">
              Recent repositories ready for code review and analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">Live monitoring active</span>
          </div>
        </div>

        {repositories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-600 mb-4">Connect your GitHub account to start analyzing repositories</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Connect GitHub
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to analyze more repositories?</h3>
            <p className="text-gray-600">
              Connect additional repositories and get comprehensive code reviews with our AI-powered analysis.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Github className="h-4 w-4" />
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