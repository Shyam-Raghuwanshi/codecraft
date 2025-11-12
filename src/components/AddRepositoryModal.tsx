/**
 * AddRepositoryModal - Modal component for adding new GitHub repositories
 * Following CodeCraft rules: TypeScript types, error handling, accessible design
 */

import React, { useState, useEffect } from 'react'
import { GithubIcon, CloseIcon, RefreshIcon, CheckIcon, ErrorIcon } from '../lib/icons'

export interface AddRepositoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (repoUrl: string) => Promise<void>
  isLoading?: boolean
}

interface ValidationResult {
  isValid: boolean
  message?: string
}

// GitHub URL validation function
const validateGitHubUrl = (url: string): ValidationResult => {
  try {
    // Check if URL is provided
    if (!url.trim()) {
      return { isValid: false, message: 'Repository URL is required' }
    }

    // GitHub URL regex pattern
    const githubRegex = /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/
    const match = url.trim().match(githubRegex)
    
    if (!match) {
      return { 
        isValid: false, 
        message: 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)' 
      }
    }

    const [, owner, repo] = match
    
    // Check for valid owner and repo names
    if (owner.length === 0 || repo.length === 0) {
      return { isValid: false, message: 'Invalid repository owner or name' }
    }

    // Check for reserved names
    const reservedNames = ['about', 'account', 'admin', 'api', 'apps', 'auth', 'blog', 'business']
    if (reservedNames.includes(owner.toLowerCase()) || reservedNames.includes(repo.toLowerCase())) {
      return { isValid: false, message: 'Repository name cannot be a reserved word' }
    }

    return { isValid: true }
  } catch (error) {
    console.error('Error validating GitHub URL:', error)
    return { isValid: false, message: 'Invalid URL format' }
  }
}

const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [repoUrl, setRepoUrl] = useState('')
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const [hasInteracted, setHasInteracted] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRepoUrl('')
      setValidation({ isValid: true })
      setHasInteracted(false)
    }
  }, [isOpen])

  // Real-time validation
  useEffect(() => {
    if (hasInteracted && repoUrl) {
      const result = validateGitHubUrl(repoUrl)
      setValidation(result)
    }
  }, [repoUrl, hasInteracted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRepoUrl(value)
    
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate before submission
    const result = validateGitHubUrl(repoUrl)
    setValidation(result)
    setHasInteracted(true)
    
    if (!result.isValid) {
      return
    }

    try {
      await onSubmit(repoUrl.trim())
      // Modal will be closed by parent component on success
    } catch (error) {
      console.error('Error submitting repository:', error)
      // Error handling will be done by parent component
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose()
    }
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg mx-4 animate-scale-in"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <GithubIcon size="md" color="primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Add Repository</h2>
              <p className="text-sm text-slate-400">Connect a GitHub repository for analysis</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <CloseIcon size="sm" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="repo-url" className="block text-sm font-medium text-slate-200">
              Repository URL
            </label>
            <div className="relative">
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="https://github.com/owner/repository"
                className={`
                  w-full px-4 py-3 bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${hasInteracted && validation.isValid === false 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-slate-600 focus:ring-blue-500/50 hover:border-slate-500'
                  }
                `}
                autoFocus
              />
              
              {/* Validation Icon */}
              {hasInteracted && repoUrl && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {validation.isValid ? (
                    <CheckIcon size="sm" color="success" />
                  ) : (
                    <ErrorIcon size="sm" color="error" />
                  )}
                </div>
              )}
            </div>
            
            {/* Validation Message */}
            {hasInteracted && !validation.isValid && validation.message && (
              <p className="text-sm text-red-400 flex items-center space-x-2">
                <ErrorIcon size="xs" color="error" />
                <span>{validation.message}</span>
              </p>
            )}
            
            {/* Help Text */}
            <p className="text-xs text-slate-500">
              Enter the full GitHub URL for a public repository. Private repositories require authentication.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-300 mb-2">What happens next?</h4>
            <ul className="text-xs text-blue-200/80 space-y-1">
              <li>• Repository code will be analyzed for issues and improvements</li>
              <li>• CodeRabbit will provide automated code review insights</li>
              <li>• Sentry integration will track error patterns and performance</li>
              <li>• Results will appear in your dashboard within minutes</li>
            </ul>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-slate-900/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !validation.isValid || !repoUrl.trim()}
            className="btn btn-primary btn-md glow-blue disabled:opacity-50 disabled:cursor-not-allowed min-w-32"
          >
            {isLoading ? (
              <>
                <RefreshIcon size="sm" className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <GithubIcon size="sm" />
                <span>Add Repository</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddRepositoryModal