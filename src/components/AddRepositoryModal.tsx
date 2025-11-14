/**
 * AddRepositoryModal - Modal component for adding new GitHub repositories with OAuth authentication
 * Following CodeCraft rules: TypeScript types, error handling, accessible design
 * Implements Vercel-style GitHub integration with OAuth and repository selection
 */

import React, { useState, useEffect } from 'react'
import { GithubIcon, CloseIcon, RefreshIcon, CheckIcon, ErrorIcon, ShieldIcon } from '../lib/icons'
import { useGitHubAuth, type GitHubRepository } from '../lib/github-auth'

export interface AddRepositoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (repoUrl: string, repoData?: GitHubRepository) => Promise<void>
  isLoading?: boolean
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
  const [currentStep, setCurrentStep] = useState<'auth' | 'select' | 'loading'>('auth')
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
    if (isOpen) {
      setCurrentStep('auth')
      setSelectedRepo(null)
      setAuthError(null)
      setRepositoryAccess({ type: 'all' })
      setSelectedRepositories([])
      setShowRepositoryPicker(false)
    }
  }, [isOpen])

  // Load repositories when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadRepositories = async () => {
        setRepoLoading(true)
        try {
          const repos = await fetchRepositories()
          setRepositories(repos)
          setAuthError(null)
        } catch (error) {
          setAuthError(error instanceof Error ? error.message : 'Failed to load repositories')
        } finally {
          setRepoLoading(false)
        }
      }
      
      loadRepositories()
    }
  }, [isAuthenticated, fetchRepositories])

  const handleRefreshRepositories = async () => {
    setRepoLoading(true)
    try {
      const repos = await fetchRepositories()
      setRepositories(repos)
      setAuthError(null)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to load repositories')
    } finally {
      setRepoLoading(false)
    }
  }

  const handleAuth = async () => {
    setCurrentStep('loading')
    setAuthError(null)
    
    try {
      await signIn()
      // The useEffect will trigger loadRepositories when isAuthenticated becomes true
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed')
      setCurrentStep('auth')
    }
  }

  const handleRepositoryToggle = (repo: GitHubRepository, checked: boolean) => {
    setSelectedRepositories(prev => {
      if (checked) {
        return [...prev, repo]
      } else {
        return prev.filter(r => r.id !== repo.id)
      }
    })
  }

  const handleProceedToRepositorySelection = () => {
    setCurrentStep('select')
  }

  const handleSubmit = async () => {
    if (!selectedRepo) return
    
    try {
      await onSubmit(selectedRepo.clone_url, selectedRepo)
      onClose()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to add repository')
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
        tabIndex={0}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <GithubIcon size="md" color="primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                {currentStep === 'auth' ? 'Connect GitHub' : 'Select Repository'}
              </h2>
              <p className="text-sm text-slate-400">
                {currentStep === 'auth' 
                  ? 'Authenticate with GitHub to access your repositories'
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
              <h3 className="text-lg font-medium text-slate-100 mb-2">
                Connecting to GitHub...
              </h3>
              <p className="text-slate-400">
                Please complete the authentication in the popup window.
              </p>
            </div>
          )}
          
          {currentStep === 'auth' && (
            <div className="p-8">
              {/* Authentication Step */}
              {!isAuthenticated ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                    <GithubIcon size="xl" color="primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-slate-100 mb-2">
                      Connect your GitHub account
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                      Sign in to access your repositories and start analyzing your code. 
                      We'll then show you installation options similar to Vercel.
                    </p>
                    
                    <button
                      onClick={handleAuth}
                      disabled={isLoading || authError !== null}
                      className="w-full max-w-sm bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium py-3 px-6 rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <GithubIcon size="sm" />
                        <span>Continue with GitHub</span>
                      </div>
                    </button>
                    
                    <div className="flex items-center justify-center space-x-2 bg-slate-700/50 rounded-lg p-3 max-w-md mx-auto">
                      <ShieldIcon size="sm" color="success" />
                      <p className="text-sm text-slate-300">
                        We only request repository access, no personal data
                      </p>
                    </div>
                  </div>
                  
                  {authError && (
                    <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <ErrorIcon size="sm" />
                      <p className="text-sm">{authError}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Vercel-style Installation Interface */
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-slate-100 mb-2">
                      Install CodeCraft
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Choose which repositories CodeCraft can access
                    </p>
                  </div>

                  <div className="space-y-4 text-left max-w-lg mx-auto">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="repository-access"
                        value="all"
                        checked={repositoryAccess.type === 'all'}
                        onChange={() => setRepositoryAccess({ type: 'all' })}
                        className="mt-1 w-4 h-4 text-blue-500 border-slate-600 bg-slate-700 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-100 group-hover:text-blue-400 transition-colors">
                          All repositories
                        </div>
                        <div className="text-sm text-slate-400">
                          This will install CodeCraft on all repositories including any new repositories added in the future.
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="repository-access"
                        value="selected"
                        checked={repositoryAccess.type === 'selected'}
                        onChange={() => setRepositoryAccess({ type: 'selected' })}
                        className="mt-1 w-4 h-4 text-blue-500 border-slate-600 bg-slate-700 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-100 group-hover:text-blue-400 transition-colors">
                          Only select repositories
                        </div>
                        <div className="text-sm text-slate-400 mb-3">
                          Only install on repositories you choose.
                        </div>

                        {/* Repository Selection Dropdown */}
                        {repositoryAccess.type === 'selected' && (
                          <div className="mt-3">
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

                            {/* Repository List */}
                            {showRepositoryPicker && (
                              <div className="mt-2 border border-slate-600 rounded-md bg-slate-800 max-h-48 overflow-y-auto">
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
                                  repositories.map((repo) => (
                                    <label
                                      key={repo.id}
                                      className="flex items-center space-x-3 p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedRepositories.some(r => r.id === repo.id)}
                                        onChange={(e) => handleRepositoryToggle(repo, e.target.checked)}
                                        className="w-4 h-4 text-blue-500 border-slate-600 bg-slate-700 rounded focus:ring-blue-500 focus:ring-2"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-slate-100 text-sm">{repo.name}</div>
                                        <div className="text-xs text-slate-400">{repo.full_name}</div>
                                      </div>
                                      {repo.private && (
                                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                          Private
                                        </span>
                                      )}
                                    </label>
                                  ))
                                )}
                              </div>
                            )}

                            {selectedRepositories.length === 0 && repositoryAccess.type === 'selected' && (
                              <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                <p className="text-sm text-amber-200">
                                  Please select at least one repository to continue.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={handleProceedToRepositorySelection}
                    disabled={repositoryAccess.type === 'selected' && selectedRepositories.length === 0}
                    className="w-full max-w-lg mx-auto bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed block"
                  >
                    {repositoryAccess.type === 'all' 
                      ? 'Install & Authorize' 
                      : `Install on ${selectedRepositories.length} Selected ${selectedRepositories.length === 1 ? 'Repository' : 'Repositories'}`
                    }
                  </button>

                  {authError && (
                    <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <ErrorIcon size="sm" />
                      <p className="text-sm">{authError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 'select' && (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-100">
                    Your Repositories
                  </h3>
                  <button
                    onClick={handleRefreshRepositories}
                    disabled={repoLoading}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh repositories"
                  >
                    <RefreshIcon size="sm" className={repoLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
                
                {user && (
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-100">{user.name || user.login}</p>
                      <p className="text-sm text-slate-400">@{user.login}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {repoLoading ? (
                  <div className="p-8 text-center">
                    <RefreshIcon size="lg" className="animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-slate-400">Loading your repositories...</p>
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <GithubIcon size="lg" color="muted" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-100 mb-2">No repositories found</h3>
                    <p className="text-slate-400 mb-4">
                      We couldn't find any repositories in your GitHub account.
                    </p>
                    <button
                      onClick={handleRefreshRepositories}
                      className="text-blue-400 hover:text-blue-300 underline text-sm"
                    >
                      Try refreshing
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-3">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-700/50 ${
                          selectedRepo?.id === repo.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-100">{repo.name}</h4>
                              {repo.private && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                  Private
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{repo.description || 'No description'}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              {repo.language && (
                                <span className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  <span>{repo.language}</span>
                                </span>
                              )}
                              <span>⭐ {repo.stargazers_count}</span>
                              <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {selectedRepo?.id === repo.id && (
                            <CheckIcon size="sm" color="success" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {currentStep === 'select' && (
          <div className="p-6 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep('auth')}
                disabled={isLoading}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!selectedRepo || isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Repository'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddRepositoryModal