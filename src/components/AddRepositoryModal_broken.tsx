/**
 * AddRepositoryModal - Modal component for adding new GitHub repositories with OAuth authentication
 * Following CodeCraft rules: TypeScript types, error handling, accessible design
 * Implements Vercel-style GitHub integration with OAuth and repository selection
 */

import React, { useState, useEffect } from 'react'
import { GithubIcon, CloseIcon, RefreshIcon, CheckIcon, ErrorIcon, ShieldIcon } from '../lib/icons'
import { useGitHubAuth, type GitHubRepository } from '../lib/github-auth'

// Helper function to check if GitHub App is properly configured
const isGitHubAppConfigured = (): boolean => {
  const appId = import.meta.env.VITE_GITHUB_APP_ID
  return !!(appId && appId !== 'your_github_app_id_here' && appId.trim() !== '')
}

export interface AddRepositoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (repoUrl: string, repoData?: GitHubRepository) => Promise<void>
  isLoading?: boolean
}

interface AuthStep {
  step: 'auth' | 'select' | 'loading'
}

interface RepositoryAccess {
  type: 'all' | 'selected'
  selectedRepos?: GitHubRepository[]
}

const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep['step']>('auth')
  const [repositoryAccess, setRepositoryAccess] = useState<RepositoryAccess>({ type: 'all' })
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [repoLoading, setRepoLoading] = useState(false)
  const [showRepositoryPicker, setShowRepositoryPicker] = useState(false)
  const [selectedRepositories, setSelectedRepositories] = useState<GitHubRepository[]>([])

  const { isAuthenticated, user, signIn, fetchRepositories } = useGitHubAuth()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('auth')
      setRepositoryAccess({ type: 'all' })
      setRepositories([])
      setSelectedRepo(null)
      setAuthError(null)
      setRepoLoading(false)
      setShowRepositoryPicker(false)
      setSelectedRepositories([])
    } else if (isAuthenticated) {
      // If already authenticated, load repositories for selection
      loadRepositoriesForSelection()
    }
  }, [isOpen, isAuthenticated])

  const loadRepositoriesForSelection = async () => {
    try {
      setRepoLoading(true)
      setAuthError(null)
      
      const repos = await fetchRepositories({
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        affiliation: ['owner', 'collaborator']
      })
      
      setRepositories(repos)
      
      // If we're in GitHub App mode, stay on auth step to show repository selection
      // If we're in OAuth mode, go to select step
      if (isGitHubAppConfigured()) {
        setCurrentStep('auth') // Stay on auth step to show repo selection interface
      } else {
        setCurrentStep('select') // Go to simple repo selection for OAuth
      }
    } catch (error) {
      console.error('Failed to load repositories:', error)
      setAuthError('Failed to load repositories. Please try again.')
    } finally {
      setRepoLoading(false)
    }
  }

  const handleGitHubAppAuth = async () => {
    try {
      setCurrentStep('loading')
      setAuthError(null)
      
      // First authenticate with OAuth to get access to repositories
      await signIn()
      
      // After successful auth, loadRepositoriesForSelection will be called via useEffect
    } catch (error: any) {
      console.error('GitHub authentication failed:', error)
      setAuthError(error.message || 'Authentication failed. Please try again.')
      setCurrentStep('auth')
    }
  }

  const handleGitHubAppInstall = async () => {
    try {
      setAuthError(null)
      
      // Get App ID from environment
      const appId = import.meta.env.VITE_GITHUB_APP_ID
      if (!appId || appId === 'your_github_app_id_here' || appId === 'demo_app_id') {
        throw new Error('GitHub App is not configured. Please set up your GitHub App first.')
      }
      
      // Build installation URL with repository selection parameter
      const baseUrl = `https://github.com/apps/install/${appId}`
      const params = new URLSearchParams({
        state: Math.random().toString(36).substring(2, 15)
      })
      
      if (repositoryAccess.type === 'selected' && selectedRepositories.length > 0) {
        // Add repository selection to URL
        selectedRepositories.forEach(repo => {
          params.append('repository_ids[]', repo.id.toString())
        })
      }
      
      const installationUrl = `${baseUrl}?${params.toString()}`
      console.log('Opening GitHub App installation:', installationUrl)
      
      // Open GitHub installation page
      window.open(installationUrl, '_blank', 'width=600,height=700')
      
      // For now, just close the modal - in real implementation this would handle the callback
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error: any) {
      console.error('GitHub App installation failed:', error)
      setAuthError(error.message || 'Installation failed. Please try again.')
    }
  }

  const handleOAuthAuth = async () => {
    try {
      setCurrentStep('loading')
      setAuthError(null)
      await signIn()
    } catch (error: any) {
      console.error('GitHub authentication failed:', error)
      setAuthError(error.message || 'Authentication failed. Please try again.')
      setCurrentStep('auth')
    }
  }

  const handleRepositorySelect = async () => {
    if (!selectedRepo) return

    try {
      await onSubmit(selectedRepo.html_url, selectedRepo)
    } catch (error) {
      console.error('Error submitting repository:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading && !repoLoading) {
      onClose()
    }
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && !isLoading && !repoLoading && onClose()}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-4 animate-scale-in max-h-[90vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <GithubIcon size="md" color="primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                {currentStep === 'auth' ? 'Install CodeCraft' : 'Select Repository'}
              </h2>
              <p className="text-sm text-slate-400">
                {currentStep === 'auth' 
                  ? 'Choose repository access permissions for CodeCraft'
                  : `Choose a repository to analyze • ${repositories.length} repositories available`
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isLoading || repoLoading}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <CloseIcon size="sm" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden">
          {currentStep === 'loading' && (
            <div className="p-8 text-center">
              <RefreshIcon size="xl" className="animate-spin mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">Connecting to GitHub...</h3>
              <p className="text-slate-400">Please complete the authentication in the popup window.</p>
            </div>
          )}

          {currentStep === 'auth' && (
            <div className="p-6 space-y-6">
              {/* Auth Error */}
              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ErrorIcon size="sm" color="error" />
                    <div>
                      <h4 className="text-sm font-medium text-red-300 mb-1">Installation Error</h4>
                      <p className="text-sm text-red-200">{authError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vercel-style GitHub App Installation Interface */}
              {isGitHubAppConfigured() ? (
                <div className="space-y-6">
                  {!isAuthenticated ? (
                    /* Step 1: Authenticate first to access repositories */
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                        <GithubIcon size="xl" color="primary" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-slate-100 mb-2">
                          Connect to GitHub first
                        </h3>
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                          To select specific repositories for CodeCraft, we need to access your GitHub account first.
                        </p>
                      </div>

                      <button
                        onClick={handleGitHubAppAuth}
                        disabled={isLoading}
                        className="btn btn-primary btn-lg w-full max-w-md mx-auto flex items-center justify-center space-x-3 glow-blue"
                      >
                        <GithubIcon size="md" />
                        <span className="text-lg font-medium">Connect GitHub Account</span>
                      </button>

                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30 max-w-md mx-auto">
                        <div className="flex items-center space-x-3 mb-3">
                          <ShieldIcon size="sm" color="success" />
                          <span className="text-sm font-medium text-blue-300">Secure & Granular</span>
                        </div>
                        
                        <p className="text-sm text-slate-400">
                          After connecting, you'll choose specific repositories for CodeCraft to access.
                          More secure than giving access to all repositories.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Step 2: Repository selection interface (after authentication) */
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-slate-100 mb-2">
                          Install CodeCraft on your GitHub account
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Choose which repositories CodeCraft can access
                        </p>
                      </div>
                  
                  {/* Repository Access Options */}
                  <div className="space-y-3">
                    {/* All repositories option */}
                    <label className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                      <input
                        type="radio"
                        name="repository-access"
                        value="all"
                        checked={repositoryAccess.type === 'all'}
                        onChange={(e) => e.target.checked && setRepositoryAccess({ type: 'all' })}
                        className="mt-1 w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500/50"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-100 mb-1">All repositories</div>
                        <div className="text-xs text-slate-400">
                          This applies to all current and future repositories owned by the resource owner.
                          Also includes public repositories (read-only).
                        </div>
                      </div>
                    </label>

                    {/* Only select repositories option */}
                    <label className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                      <input
                        type="radio"
                        name="repository-access"
                        value="selected"
                        checked={repositoryAccess.type === 'selected'}
                        onChange={(e) => e.target.checked && setRepositoryAccess({ type: 'selected' })}
                        className="mt-1 w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500/50"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-100 mb-1">Only select repositories</div>
                        <div className="text-xs text-slate-400 mb-3">
                          Select at least one repository. Also includes public repositories (read-only).
                        </div>
                        
                        {/* Repository Selection Dropdown */}
                        {repositoryAccess.type === 'selected' && (
                          <div className="pl-6 space-y-3">
                            {/* Dropdown Toggle Button */}
                            <button 
                              onClick={() => setShowRepositoryPicker(!showRepositoryPicker)}
                              className="flex items-center justify-between w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-slate-300 hover:bg-slate-600 transition-colors"
                            >
                              <span>
                                {selectedRepositories.length === 0 
                                  ? 'Select repositories' 
                                  : `${selectedRepositories.length} repositories selected`
                                }
                              </span>
                              <svg 
                                className={`w-4 h-4 transition-transform ${showRepositoryPicker ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {/* Repository List Dropdown */}
                            {showRepositoryPicker && (
                              <div className="border border-slate-600 rounded-md bg-slate-800 max-h-60 overflow-y-auto">
                                {repoLoading ? (
                                  <div className="p-4 text-center">
                                    <RefreshIcon size="sm" className="animate-spin mx-auto mb-2 text-blue-500" />
                                    <p className="text-xs text-slate-400">Loading repositories...</p>
                                  </div>
                                ) : repositories.length === 0 ? (
                                  <div className="p-4 text-center">
                                    <p className="text-xs text-slate-400">No repositories found</p>
                                  </div>
                                ) : (
                                  repositories.map((repo) => {
                                    const isSelected = selectedRepositories.some(r => r.id === repo.id)
                                    return (
                                      <div
                                        key={repo.id}
                                        className={`flex items-center space-x-3 p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 cursor-pointer ${
                                          isSelected ? 'bg-blue-500/10' : ''
                                        }`}
                                        onClick={() => {
                                          if (isSelected) {
                                            setSelectedRepositories(prev => prev.filter(r => r.id !== repo.id))
                                          } else {
                                            setSelectedRepositories(prev => [...prev, repo])
                                          }
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {}} // Handled by parent click
                                          className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50"
                                        />
                                        <div className="flex items-center space-x-3 flex-1">
                                          <GithubIcon size="sm" color="secondary" />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium text-slate-100 truncate">
                                                {repo.name}
                                              </span>
                                              {repo.private && (
                                                <ShieldIcon size="xs" color="warning" />
                                              )}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">
                                              {repo.description || 'No description'}
                                            </p>
                                            <div className="flex items-center space-x-3 mt-1">
                                              {repo.language && (
                                                <span className="text-xs text-slate-500">{repo.language}</span>
                                              )}
                                              <span className="text-xs text-slate-500">
                                                ⭐ {repo.stargazers_count}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            )}

                            {/* Selected repositories summary */}
                            {selectedRepositories.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs text-slate-400">Selected repositories:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedRepositories.map((repo) => (
                                    <span 
                                      key={repo.id}
                                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-300"
                                    >
                                      <span>{repo.name}</span>
                                      <button
                                        onClick={() => setSelectedRepositories(prev => prev.filter(r => r.id !== repo.id))}
                                        className="ml-1 text-blue-400 hover:text-blue-200"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Permissions Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-200">with these permissions:</h4>
                    
                    <div className="space-y-2 pl-4">
                      <div className="flex items-start space-x-3">
                        <CheckIcon size="sm" color="success" className="mt-0.5 shrink-0" />
                        <div className="text-sm text-slate-300">
                          <span className="font-medium">Read access</span> to members and metadata
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <CheckIcon size="sm" color="success" className="mt-0.5 shrink-0" />
                        <div className="text-sm text-slate-300">
                          <span className="font-medium">Read and write access</span> to administration, checks, code, commit 
                          statuses, deployments, issues, pull requests, and repository hooks
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Permissions Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-200">User permissions</h4>
                    <p className="text-xs text-slate-400">
                      CodeCraft can also request users' permission to the following resources. These 
                      permissions will be requested and authorized on an individual-user basis.
                    </p>
                    
                    <div className="pl-4">
                      <div className="flex items-start space-x-3">
                        <CheckIcon size="sm" color="success" className="mt-0.5 shrink-0" />
                        <div className="text-sm text-slate-300">
                          <span className="font-medium">Read access</span> to email addresses
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Install & Cancel Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleGitHubAppInstall}
                      disabled={isLoading || (repositoryAccess.type === 'selected' && selectedRepositories.length === 0)}
                      className="btn btn-primary btn-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-base font-medium">Install & Authorize</span>
                    </button>
                    
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="btn btn-secondary btn-lg px-8 py-3"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Validation Message */}
                  {repositoryAccess.type === 'selected' && selectedRepositories.length === 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-sm text-amber-200">
                        Please select at least one repository to continue with the installation.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback to OAuth when GitHub App not configured */
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                    <GithubIcon size="xl" color="primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-slate-100 mb-2">
                      Connect your GitHub account
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                      Grant CodeCraft access to your GitHub repositories for analysis.
                    </p>
                  </div>

                  {/* OAuth Authentication */}
                  <div className="space-y-4">
                    <button
                      onClick={handleOAuthAuth}
                      disabled={isLoading}
                      className="btn btn-primary btn-lg w-full max-w-md mx-auto flex items-center justify-center space-x-3 glow-blue"
                    >
                      <GithubIcon size="md" />
                      <span className="text-lg font-medium">Connect with OAuth</span>
                    </button>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 max-w-md mx-auto">
                      <div className="flex items-center space-x-3 mb-3">
                        <ShieldIcon size="sm" color="warning" />
                        <span className="text-sm font-medium text-amber-300">Full Repository Access</span>
                      </div>
                      
                      <p className="text-sm text-slate-400">
                        OAuth provides access to all your repositories. For granular control, 
                        ask your administrator to configure GitHub App.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Repository Selection Step (for OAuth flow) */}
          {currentStep === 'select' && (
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-100 mb-2">
                  Select Repository to Analyze
                </h3>
                <p className="text-slate-400 mb-6">
                  Choose from your connected repositories
                </p>
              </div>
              
              {/* Simple repository list for demo */}
              <div className="space-y-3">
                {repositories.slice(0, 5).map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-700/50
                      ${selectedRepo?.id === repo.id 
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50' 
                        : 'border-slate-600 hover:border-slate-500'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GithubIcon size="sm" color="secondary" />
                        <div>
                          <div className="text-sm font-medium text-slate-100">{repo.name}</div>
                          <div className="text-xs text-slate-400">{repo.owner.login}</div>
                        </div>
                      </div>
                      {selectedRepo?.id === repo.id && (
                        <CheckIcon size="sm" color="success" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Select Repository Button */}
              <div className="flex items-center justify-center space-x-3 mt-6">
                <button
                  onClick={handleRepositorySelect}
                  disabled={!selectedRepo || isLoading}
                  className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon size="sm" />
                  <span>Analyze Repository</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {currentStep !== 'loading' && (
          <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-b-xl border-t border-slate-700">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              {user && (
                <>
                  <img 
                    src={user.avatar_url} 
                    alt={user.login} 
                    className="w-5 h-5 rounded-full"
                  />
                  <span>Connected as {user.login}</span>
                </>
              )}
            </div>

            <div className="text-xs text-slate-500">
              CodeCraft • Secure GitHub Integration
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddRepositoryModal