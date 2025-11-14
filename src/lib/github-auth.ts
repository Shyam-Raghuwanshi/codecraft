/**
 * GitHub OAuth Authentication Service
 * Following CodeCraft rules: TypeScript types, error handling, production-ready implementation
 * Similar to Vercel's GitHub integration pattern
 */

// Types for GitHub API responses
export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
    type: 'User' | 'Organization'
  }
  description: string | null
  html_url: string
  clone_url: string
  ssh_url: string
  private: boolean
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  default_branch: string
  permissions?: {
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
}

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubAuthToken {
  access_token: string
  token_type: string
  scope: string
  refresh_token?: string
  expires_in?: number
  created_at: number
}

export interface GitHubInstallation {
  id: number
  account: {
    login: string
    avatar_url: string
    type: 'User' | 'Organization'
  }
  repository_selection: 'all' | 'selected'
  permissions: {
    actions: string
    administration: string
    checks: string
    contents: string
    deployments: string
    environments: string
    issues: string
    metadata: string
    packages: string
    pages: string
    pull_requests: string
    repository_hooks: string
    repository_projects: string
    security_events: string
    statuses: string
    vulnerability_alerts: string
  }
  created_at: string
  updated_at: string
  app_slug: string
  target_type: string
  single_file_name: string | null
}

// GitHub OAuth Configuration
const getRedirectUri = (): string => {
  // For development, use the configured base URL or fallback to current origin
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${baseUrl}/github-callback`
}

const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '', // Note: In production, this should be on server-side
  appId: import.meta.env.VITE_GITHUB_APP_ID || '', // GitHub App ID for installation flow
  get redirectUri() {
    return getRedirectUri()
  },
  get installationRedirectUri() {
    return `${import.meta.env.VITE_APP_URL || window.location.origin}/github-installation-callback`
  },
  scope: [
    'repo', // Full control of private repositories
    'read:user', // Read user profile data
    'user:email', // Read user email addresses
    'read:org', // Read organization membership
    'repo:status', // Read repository commit status
    'repo_deployment', // Read repository deployments
    'public_repo', // Access public repositories
  ].join(' '),
  appName: 'CodeCraft',
} as const

// Installation flow types
export interface GitHubAppInstallation {
  id: number
  account: {
    login: string
    id: number
    avatar_url: string
    type: 'User' | 'Organization'
  }
  repository_selection: 'all' | 'selected'
  repositories?: GitHubRepository[]
  permissions: Record<string, string>
  created_at: string
  updated_at: string
  app_slug: string
  suspended_by?: any
  suspended_at?: string
}

class GitHubAuthError extends Error {
  code?: string
  status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = 'GitHubAuthError'
    this.code = code
    this.status = status
  }
}

export class GitHubAuthService {
  private static instance: GitHubAuthService
  private token: GitHubAuthToken | null = null
  private user: GitHubUser | null = null

  static getInstance(): GitHubAuthService {
    if (!GitHubAuthService.instance) {
      GitHubAuthService.instance = new GitHubAuthService()
    }
    return GitHubAuthService.instance
  }

  private constructor() {
    this.loadStoredAuth()
  }

  /**
   * Generate OAuth state parameter for security
   */
  private generateState(): string {
    const array = new Uint32Array(4)
    crypto.getRandomValues(array)
    return Array.from(array, dec => dec.toString(16)).join('')
  }

  /**
   * Start GitHub App installation flow for repository-specific access
   */
  async initiateAppInstallation(): Promise<void> {
    try {
      // Check if GitHub App is configured and not a placeholder
      if (!GITHUB_CONFIG.appId || GITHUB_CONFIG.appId === 'your_github_app_id_here') {
        throw new GitHubAuthError('GitHub App is not configured yet. Please create a GitHub App first or use OAuth authentication.')
      }

      const state = this.generateState()
      sessionStorage.setItem('github_installation_state', state)

      // GitHub App installation URL using App ID instead of name
      // This is more reliable as it uses the actual App ID
      const installUrl = `https://github.com/apps/install/${GITHUB_CONFIG.appId}?state=${state}`
      
      console.log('Opening GitHub App installation URL:', installUrl)
      
      // Use popup window for better UX
      const popup = window.open(
        installUrl,
        'github-app-install',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new GitHubAuthError('Popup blocked. Please allow popups for GitHub App installation.')
      }

      // Poll for popup completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            
            // Check if installation was successful
            const installationSuccess = sessionStorage.getItem('github_installation_success')
            if (installationSuccess) {
              sessionStorage.removeItem('github_installation_success')
              resolve()
            } else {
              reject(new GitHubAuthError('App installation was cancelled or failed.'))
            }
          }
        }, 1000)

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          if (!popup.closed) {
            popup.close()
            reject(new GitHubAuthError('App installation timed out.'))
          }
        }, 300000)
      })

    } catch (error) {
      console.error('GitHub App installation initiation failed:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Failed to start GitHub App installation.')
    }
  }

  /**
   * Handle GitHub App installation callback
   */
  async handleInstallationCallback(installationId: string, setupAction: string, state: string): Promise<GitHubAppInstallation> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('github_installation_state')
      if (!storedState || storedState !== state) {
        throw new GitHubAuthError('Invalid state parameter. Possible CSRF attack.', 'INVALID_STATE')
      }

      sessionStorage.removeItem('github_installation_state')

      if (setupAction === 'install') {
        // Fetch installation details
        const installation = await this.fetchInstallationDetails(installationId)
        
        // Mark installation as successful
        sessionStorage.setItem('github_installation_success', 'true')
        
        return installation
      } else {
        throw new GitHubAuthError('App installation was not completed.', 'INSTALLATION_CANCELLED')
      }

    } catch (error) {
      console.error('GitHub App installation callback failed:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('App installation failed.')
    }
  }

  /**
   * Fetch GitHub App installation details
   */
  async fetchInstallationDetails(installationId: string): Promise<GitHubAppInstallation> {
    try {
      if (!this.isAuthenticated()) {
        throw new GitHubAuthError('Not authenticated. Please authenticate first.', 'NOT_AUTHENTICATED')
      }

      const response = await this.makeAuthenticatedRequest(`/user/installations/${installationId}`)
      
      if (!response.ok) {
        throw new GitHubAuthError('Failed to fetch installation details.', 'FETCH_INSTALLATION_FAILED', response.status)
      }

      const installation: GitHubAppInstallation = await response.json()
      return installation

    } catch (error) {
      console.error('Failed to fetch installation details:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Failed to fetch installation details.')
    }
  }

  /**
   * Fetch repositories accessible through GitHub App installation
   */
  async fetchInstallationRepositories(installationId: string): Promise<GitHubRepository[]> {
    try {
      if (!this.isAuthenticated()) {
        throw new GitHubAuthError('Not authenticated. Please authenticate first.', 'NOT_AUTHENTICATED')
      }

      const response = await this.makeAuthenticatedRequest(`/user/installations/${installationId}/repositories`)
      
      if (!response.ok) {
        throw new GitHubAuthError('Failed to fetch installation repositories.', 'FETCH_INSTALLATION_REPOS_FAILED', response.status)
      }

      const data = await response.json()
      return data.repositories || []

    } catch (error) {
      console.error('Failed to fetch installation repositories:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Failed to fetch installation repositories.')
    }
  }

  /**
   * List all GitHub App installations for the authenticated user
   */
  async fetchUserInstallations(): Promise<GitHubAppInstallation[]> {
    try {
      if (!this.isAuthenticated()) {
        throw new GitHubAuthError('Not authenticated. Please authenticate first.', 'NOT_AUTHENTICATED')
      }

      const response = await this.makeAuthenticatedRequest('/user/installations')
      
      if (!response.ok) {
        throw new GitHubAuthError('Failed to fetch user installations.', 'FETCH_INSTALLATIONS_FAILED', response.status)
      }

      const data = await response.json()
      return data.installations || []

    } catch (error) {
      console.error('Failed to fetch user installations:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Failed to fetch user installations.')
    }
  }
  async initiateOAuth(): Promise<void> {
    try {
      const state = this.generateState()
      sessionStorage.setItem('github_oauth_state', state)

      const params = new URLSearchParams({
        client_id: GITHUB_CONFIG.clientId,
        redirect_uri: GITHUB_CONFIG.redirectUri,
        scope: GITHUB_CONFIG.scope,
        state,
        allow_signup: 'true',
      })

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
      console.log('Opening GitHub OAuth URL:', authUrl)
      
      // Use popup window for better UX (like Vercel)
      const popup = window.open(
        authUrl,
        'github-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes,location=yes'
      )

      if (!popup) {
        throw new GitHubAuthError('Popup blocked. Please allow popups for GitHub authentication.')
      }

      // Clear any previous auth success flag
      localStorage.removeItem('github_auth_success')

      // Poll for popup completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          try {
            // Check if popup was closed
            if (popup.closed) {
              clearInterval(checkClosed)
              
              // Give a small delay for the callback to complete
              setTimeout(() => {
                // Check if auth was successful
                const authSuccess = localStorage.getItem('github_auth_success')
                if (authSuccess) {
                  localStorage.removeItem('github_auth_success')
                  resolve()
                } else {
                  reject(new GitHubAuthError('Authentication was cancelled or failed.'))
                }
              }, 500)
              return
            }

            // Check for successful auth flag while popup is still open
            const authSuccess = localStorage.getItem('github_auth_success')
            if (authSuccess) {
              clearInterval(checkClosed)
              localStorage.removeItem('github_auth_success')
              popup.close()
              resolve()
              return
            }

          } catch (error) {
            // Popup may be on different origin, ignore cross-origin errors
          }
        }, 1000)

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          if (!popup.closed) {
            popup.close()
            reject(new GitHubAuthError('Authentication timed out.'))
          }
        }, 300000)
      })

    } catch (error) {
      console.error('GitHub OAuth initiation failed:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Failed to start GitHub authentication.')
    }
  }

  /**
   * Handle OAuth callback (typically called from popup)
   */
  async handleCallback(code: string, state: string): Promise<GitHubAuthToken> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('github_oauth_state')
      if (!storedState || storedState !== state) {
        throw new GitHubAuthError('Invalid state parameter. Possible CSRF attack.', 'INVALID_STATE')
      }

      sessionStorage.removeItem('github_oauth_state')

      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CONFIG.clientId,
          client_secret: GITHUB_CONFIG.clientSecret,
          code,
          redirect_uri: GITHUB_CONFIG.redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        throw new GitHubAuthError('Failed to exchange code for token.', 'TOKEN_EXCHANGE_FAILED', tokenResponse.status)
      }

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        throw new GitHubAuthError(tokenData.error_description || tokenData.error, tokenData.error)
      }

      const token: GitHubAuthToken = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        created_at: Date.now(),
      }

      // Store token securely
      this.token = token
      this.storeAuth(token)

      // Fetch user data
      await this.fetchUserData()

      return token

    } catch (error) {
      console.error('GitHub OAuth callback failed:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Authentication failed.')
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.token && this.isTokenValid())
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.token?.access_token || null
  }

  /**
   * Get current user data
   */
  getCurrentUser(): GitHubUser | null {
    return this.user
  }

  /**
   * Fetch user's repositories with pagination support
   */
  async fetchRepositories(options: {
    type?: 'owner' | 'member' | 'public' | 'private'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
    affiliation?: string[]
  } = {}): Promise<GitHubRepository[]> {
    if (!this.isAuthenticated()) {
      throw new GitHubAuthError('Not authenticated. Please authenticate first.', 'NOT_AUTHENTICATED')
    }

    try {
      const {
        type = 'owner',
        sort = 'updated',
        direction = 'desc',
        per_page = 30,
        page = 1,
        affiliation = ['owner', 'collaborator']
      } = options

      const params = new URLSearchParams({
        type,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString(),
        affiliation: affiliation.join(','),
      })

      const response = await this.makeAuthenticatedRequest(`/user/repos?${params}`)
      
      if (!response.ok) {
        throw new GitHubAuthError('Failed to fetch repositories.', 'FETCH_REPOS_FAILED', response.status)
      }

      const repositories: GitHubRepository[] = await response.json()
      return repositories

    } catch (error) {
      console.error('Failed to fetch repositories:', error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError('Failed to fetch repositories.')
    }
  }

  /**
   * Fetch organization repositories
   */
  async fetchOrgRepositories(org: string, options: {
    type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}): Promise<GitHubRepository[]> {
    if (!this.isAuthenticated()) {
      throw new GitHubAuthError('Not authenticated. Please authenticate first.', 'NOT_AUTHENTICATED')
    }

    try {
      const {
        type = 'all',
        sort = 'updated',
        direction = 'desc',
        per_page = 30,
        page = 1
      } = options

      const params = new URLSearchParams({
        type,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString(),
      })

      const response = await this.makeAuthenticatedRequest(`/orgs/${org}/repos?${params}`)
      
      if (!response.ok) {
        throw new GitHubAuthError(`Failed to fetch repositories for ${org}.`, 'FETCH_ORG_REPOS_FAILED', response.status)
      }

      const repositories: GitHubRepository[] = await response.json()
      return repositories

    } catch (error) {
      console.error(`Failed to fetch repositories for ${org}:`, error)
      throw error instanceof GitHubAuthError ? error : new GitHubAuthError(`Failed to fetch repositories for ${org}.`)
    }
  }

  /**
   * Revoke access token and sign out
   */
  async signOut(): Promise<void> {
    try {
      if (this.token) {
        // Revoke token on GitHub (optional, but good practice)
        await fetch(`https://api.github.com/applications/${GITHUB_CONFIG.clientId}/grant`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${btoa(`${GITHUB_CONFIG.clientId}:${GITHUB_CONFIG.clientSecret}`)}`,
          },
          body: JSON.stringify({
            access_token: this.token.access_token,
          }),
        })
      }
    } catch (error) {
      console.warn('Failed to revoke GitHub token:', error)
    } finally {
      // Clear local storage and state
      this.clearAuth()
    }
  }

  /**
   * Private methods
   */

  private async makeAuthenticatedRequest(endpoint: string): Promise<Response> {
    if (!this.token) {
      throw new GitHubAuthError('No access token available.', 'NO_TOKEN')
    }

    return fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': GITHUB_CONFIG.appName,
      },
    })
  }

  private async fetchUserData(): Promise<void> {
    try {
      const response = await this.makeAuthenticatedRequest('/user')
      
      if (!response.ok) {
        throw new GitHubAuthError('Failed to fetch user data.', 'FETCH_USER_FAILED', response.status)
      }

      this.user = await response.json()
      
      // Store user data
      if (this.user) {
        localStorage.setItem('github_user', JSON.stringify(this.user))
      }

    } catch (error) {
      console.error('Failed to fetch user data:', error)
      throw error
    }
  }

  private isTokenValid(): boolean {
    if (!this.token) return false
    
    // Check if token is expired (if we have expiration info)
    if (this.token.expires_in) {
      const expiresAt = this.token.created_at + (this.token.expires_in * 1000)
      return Date.now() < expiresAt
    }

    // For GitHub personal access tokens, we can't easily check expiration
    // so we assume it's valid if we have it
    return true
  }

  private storeAuth(token: GitHubAuthToken): void {
    try {
      localStorage.setItem('github_access_token', JSON.stringify(token))
    } catch (error) {
      console.error('Failed to store GitHub token:', error)
      throw new GitHubAuthError('Failed to store authentication data.')
    }
  }

  private loadStoredAuth(): void {
    try {
      const storedToken = localStorage.getItem('github_access_token')
      const storedUser = localStorage.getItem('github_user')

      if (storedToken) {
        this.token = JSON.parse(storedToken)
        
        if (!this.isTokenValid()) {
          this.clearAuth()
          return
        }
      }

      if (storedUser) {
        this.user = JSON.parse(storedUser)
      }

    } catch (error) {
      console.error('Failed to load stored auth:', error)
      this.clearAuth()
    }
  }

  private clearAuth(): void {
    this.token = null
    this.user = null
    localStorage.removeItem('github_access_token')
    localStorage.removeItem('github_user')
  }
}

export const githubAuth = GitHubAuthService.getInstance()

// Helper function for components
export const useGitHubAuth = () => {
  const isAuthenticated = githubAuth.isAuthenticated()
  const user = githubAuth.getCurrentUser()
  
  return {
    isAuthenticated,
    user,
    // OAuth methods
    signIn: () => githubAuth.initiateOAuth(),
    signOut: () => githubAuth.signOut(),
    fetchRepositories: (options?: Parameters<typeof githubAuth.fetchRepositories>[0]) => 
      githubAuth.fetchRepositories(options),
    fetchOrgRepositories: (org: string, options?: Parameters<typeof githubAuth.fetchOrgRepositories>[1]) => 
      githubAuth.fetchOrgRepositories(org, options),
    // GitHub App installation methods
    installApp: () => githubAuth.initiateAppInstallation(),
    handleInstallationCallback: (installationId: string, setupAction: string, state: string) =>
      githubAuth.handleInstallationCallback(installationId, setupAction, state),
    fetchInstallationDetails: (installationId: string) =>
      githubAuth.fetchInstallationDetails(installationId),
    fetchInstallationRepositories: (installationId: string) =>
      githubAuth.fetchInstallationRepositories(installationId),
    fetchUserInstallations: () =>
      githubAuth.fetchUserInstallations(),
  }
}