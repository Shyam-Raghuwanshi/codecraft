/**
 * GitHubAppInstallationModal - Guides users through installing the CodeCraft GitHub App
 * Implements GitHub's official installation steps with contextual guidance and status handling
 */

import React, { useEffect, useMemo, useState } from 'react'
import { GithubIcon, CloseIcon, CheckIcon, ErrorIcon, ShieldIcon } from '../lib/icons'
import type { GitHubRepository } from '../lib/github-auth'
import { useGitHubAuth, getGitHubAppInstallationUrl } from '../lib/github-auth'

export interface GitHubAppInstallationModalProps {
  isOpen: boolean
  onClose: () => void
  repositoryAccess: 'all' | 'selected'
  selectedRepositories: GitHubRepository[]
  onSuccess?: () => void
}

type InstallStatus = 'idle' | 'launching' | 'success' | 'error'

type CopyStatus = 'idle' | 'copied' | 'error'

const installationSteps = [
  {
    title: 'Open the official GitHub install page',
    description:
      'The Install button opens https://github.com/apps/APP-NAME/installations/new in a new window so you can finish the flow on GitHub.',
  },
  {
    title: 'Choose the personal account or organization',
    description:
      'Select where you want to install the app. You can pick your personal account or any organization where you have permission.',
  },
  {
    title: 'Select repository access',
    description:
      'If the app requests repository permissions, GitHub will ask you to choose All repositories or Only select repositories. The app always has read-only access to public repositories.',
  },
  {
    title: 'Pick repositories when using "Only select"',
    description:
      'Use the Select repositories dropdown on GitHub to choose the repositories you want the app to access. Repositories created by the app are automatically granted access.',
  },
  {
    title: 'Review requested permissions',
    description:
      'Confirm the scopes and REST API access listed in the Permissions section. Learn more in the "Permissions required for GitHub Apps" docs.',
  },
  {
    title: 'Finish with the correct approval button',
    description:
      'Click Install, Install and request, or Request depending on your organization’s approval policy. See "Requirements to install a GitHub App" for details.',
  },
]

const GitHubAppInstallationModal: React.FC<GitHubAppInstallationModalProps> = ({
  isOpen,
  onClose,
  repositoryAccess,
  selectedRepositories,
  onSuccess,
}) => {
  const { installApp } = useGitHubAuth()
  const [status, setStatus] = useState<InstallStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  const installUrlInfo = useMemo(() => {
    try {
      return { url: getGitHubAppInstallationUrl(), error: null as string | null }
    } catch (err) {
      return {
        url: '',
        error:
          err instanceof Error
            ? err.message
            : 'GitHub App slug is missing. Set VITE_GITHUB_APP_SLUG to your app name.',
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle')
      setError(null)
      setCopyStatus('idle')
    }
  }, [isOpen])

  if (!isOpen) return null

  const disabled = status === 'launching'
  const canLaunch = Boolean(installUrlInfo.url)

  const handleStartInstallation = async () => {
    if (!canLaunch || disabled) return
    setStatus('launching')
    setError(null)
    try {
      await installApp()
      setStatus('success')
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to open the GitHub installation page.')
    }
  }

  const handleCopyInstallUrl = async () => {
    if (!installUrlInfo.url || copyStatus === 'copied') return
    try {
      await navigator.clipboard.writeText(installUrlInfo.url)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy GitHub installation URL', err)
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2500)
    }
  }

  const handleContinue = () => {
    setStatus('idle')
    setError(null)
    onSuccess?.()
    onClose()
  }

  const handleAlreadyInstalled = () => {
    onSuccess?.()
    onClose()
  }

  const selectionSummary =
    repositoryAccess === 'all'
      ? 'Installing on all repositories ensures CodeCraft automatically gains access to any new repositories you create.'
      : selectedRepositories.length === 0
        ? 'Select the repositories you want CodeCraft to access. You can update the selection later from GitHub.'
        : `GitHub will prompt you to grant access to ${selectedRepositories.length} selected ${
            selectedRepositories.length === 1 ? 'repository' : 'repositories'
          }.`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">GitHub App</p>
            <h2 className="text-2xl font-bold text-slate-100">Install CodeCraft on GitHub</h2>
            <p className="text-sm text-slate-400">
              Follow GitHub’s official installation steps to grant CodeCraft the right level of repository access.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close installation guide"
            disabled={status === 'launching'}
          >
            <CloseIcon size="sm" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4">
            <div className="flex items-start space-x-3">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <ShieldIcon size="md" color="primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-300">{selectionSummary}</p>
                {repositoryAccess === 'selected' && selectedRepositories.length > 0 && (
                  <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Selected repositories</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRepositories.slice(0, 6).map(repo => (
                        <span
                          key={repo.id}
                          className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200"
                        >
                          {repo.full_name}
                        </span>
                      ))}
                      {selectedRepositories.length > 6 && (
                        <span className="text-xs text-slate-400">
                          +{selectedRepositories.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {installationSteps.map((step, index) => (
              <div key={step.title} className="flex items-start space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-sm font-semibold text-slate-200">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-100">{step.title}</p>
                  <p className="text-sm text-slate-400">{step.description}</p>
                  {index === 4 && (
                    <a
                      href="https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/permissions-required-for-github-apps"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Read the permissions guide ↗
                    </a>
                  )}
                  {index === 5 && (
                    <a
                      href="https://docs.github.com/en/apps/creating-github-apps/installing-github-apps/requirements-for-installing-a-github-app"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Learn about approval requirements ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {installUrlInfo.error && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <p className="font-medium">Configuration needed</p>
              <p>{installUrlInfo.error}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              <ErrorIcon size="sm" />
              <p>{error}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center space-x-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <CheckIcon size="md" color="success" />
              <p className="text-sm text-green-200">
                GitHub confirmed the installation. Continue to repository selection inside CodeCraft.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {installUrlInfo.url && (
              <button
                onClick={handleCopyInstallUrl}
                className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-slate-500"
                disabled={!installUrlInfo.url}
              >
                {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy GitHub URL'}
              </button>
            )}
            <span className="hidden sm:block">or</span>
            <a
              href={installUrlInfo.url || undefined}
              target="_blank"
              rel="noreferrer noopener"
              className={`inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 ${!installUrlInfo.url ? 'pointer-events-none opacity-50' : ''}`}
            >
              <GithubIcon size="sm" />
              <span>Open install page manually</span>
            </a>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAlreadyInstalled}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
            >
              I already installed it
            </button>
            {status === 'success' ? (
              <button
                onClick={handleContinue}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
              >
                Continue to repositories
              </button>
            ) : (
              <button
                onClick={handleStartInstallation}
                disabled={!canLaunch || disabled}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'launching' ? 'Waiting for GitHub...' : 'Install via GitHub'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubAppInstallationModal
