import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { githubAuth } from '../lib/github-auth'
import { LoadingSpinner } from '../components'
import { GithubIcon, CheckIcon, ErrorIcon } from '../lib/icons'

const GitHubCallbackPage = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          throw new Error(error === 'access_denied' ? 'Access denied by user' : `GitHub OAuth error: ${error}`)
        }

        if (!code || !state) {
          throw new Error('Invalid callback parameters')
        }

        await githubAuth.handleCallback(code, state)
        setStatus('success')
        
        // Set success flag for parent window polling
        localStorage.setItem('github_auth_success', 'true')
        
        // Close popup window if opened from modal
        if (window.opener) {
          console.log('Authentication successful, closing popup')
          window.close()
          return
        }
        
        // Otherwise redirect to homepage
        setTimeout(() => navigate({ to: '/' }), 2000)

      } catch (error: any) {
        console.error('GitHub callback error:', error)
        setError(error.message || 'Authentication failed')
        setStatus('error')
        
        if (window.opener) {
          setTimeout(() => window.close(), 3000)
        }
      }
    }

    handleCallback()
  }, [navigate])

  if (window.opener) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          {status === 'processing' && <LoadingSpinner size="lg" message="Authenticating..." />}
          {status === 'success' && (
            <div>
              <CheckIcon size="xl" color="success" className="mx-auto mb-2" />
              <p className="text-green-300">Success! Closing...</p>
            </div>
          )}
          {status === 'error' && (
            <div>
              <ErrorIcon size="xl" color="error" className="mx-auto mb-2" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <GithubIcon size="xl" color="primary" className="mx-auto mb-4" />
        
        {status === 'processing' && (
          <div>
            <LoadingSpinner size="lg" message="Processing authentication..." />
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <CheckIcon size="xl" color="success" className="mx-auto mb-4" />
            <h2 className="text-xl text-green-300 mb-2">Success!</h2>
            <p className="text-slate-400">Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <ErrorIcon size="xl" color="error" className="mx-auto mb-4" />
            <h2 className="text-xl text-red-300 mb-2">Authentication Failed</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <button onClick={() => navigate({ to: '/' })} className="btn btn-primary btn-md">
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/github-callback')({
  component: GitHubCallbackPage,
})