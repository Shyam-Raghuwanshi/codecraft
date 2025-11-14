import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { githubAuth } from '../lib/github-auth'
import { LoadingSpinner } from '../components'
import { GithubIcon, CheckIcon, ErrorIcon } from '../lib/icons'

const GitHubInstallationCallbackPage = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)
  const [installation, setInstallation] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleInstallationCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const installationId = urlParams.get('installation_id')
        const setupAction = urlParams.get('setup_action')
        const state = urlParams.get('state')

        if (!installationId || !setupAction || !state) {
          throw new Error('Invalid installation callback parameters')
        }

        const installationResult = await githubAuth.handleInstallationCallback(installationId, setupAction, state)
        
        setInstallation(installationResult)
        setStatus('success')
        
        sessionStorage.setItem('github_installation_success', 'true')
        
        if (window.opener) {
          window.close()
          return
        }
        
        setTimeout(() => navigate({ to: '/' }), 3000)

      } catch (error: any) {
        console.error('GitHub installation callback error:', error)
        setError(error.message || 'Installation failed')
        setStatus('error')
        
        if (window.opener) {
          setTimeout(() => window.close(), 3000)
        }
      }
    }

    handleInstallationCallback()
  }, [navigate])

  if (window.opener) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
          {status === 'processing' && (
            <div>
              <LoadingSpinner size="lg" />
              <p className="text-slate-300 mt-4">Installing GitHub App...</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <CheckIcon size="xl" color="success" className="mx-auto mb-2" />
              <p className="text-green-300 font-medium">App Installed Successfully!</p>
              {installation && (
                <p className="text-slate-400 text-sm mt-2">
                  Access granted to {installation.repository_selection === 'all' ? 'all repositories' : 'selected repositories'}
                </p>
              )}
            </div>
          )}
          {status === 'error' && (
            <div>
              <ErrorIcon size="xl" color="error" className="mx-auto mb-2" />
              <p className="text-red-300 font-medium">Installation Failed</p>
              <p className="text-slate-400 text-sm mt-2">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700 shadow-2xl max-w-md w-full">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GithubIcon size="xl" color="primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">GitHub App Installation</h1>
        </div>

        {status === 'processing' && (
          <div className="space-y-4">
            <LoadingSpinner size="lg" message="Processing installation..." />
            <p className="text-slate-400">Setting up repository access permissions...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckIcon size="xl" color="success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-300 mb-2">Installation Successful!</h2>
              <p className="text-slate-400 mb-4">
                CodeCraft has been granted access to your selected repositories.
              </p>
              {installation && (
                <div className="bg-slate-700/50 rounded-lg p-4 text-left">
                  <h3 className="text-sm font-medium text-slate-200 mb-2">Installation Details:</h3>
                  <div className="space-y-1 text-sm text-slate-400">
                    <p>Account: {installation.account.login}</p>
                    <p>Access: {installation.repository_selection === 'all' ? 'All repositories' : 'Selected repositories'}</p>
                    <p>Installed: {new Date(installation.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              <p className="text-slate-500 text-sm mt-4">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <ErrorIcon size="xl" color="error" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-300 mb-2">Installation Failed</h2>
              <p className="text-slate-400 mb-4">{error}</p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.history.back()} 
                  className="btn btn-primary btn-md w-full"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate({ to: '/' })} 
                  className="btn btn-secondary btn-sm w-full"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/github-installation-callback')({
  component: GitHubInstallationCallbackPage,
})