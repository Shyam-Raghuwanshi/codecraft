import { v } from 'convex/values'
import { query, mutation } from './_generated/api'

// Type definitions for our data structures
export interface CodeRabbitIssue {
  id: string
  repoUrl: string
  file: string
  line: number
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  createdAt: number
  userId: string
}

export interface SentryError {
  id: string
  repoUrl: string
  title: string
  count: number
  lastSeen: string
  status: 'resolved' | 'unresolved'
  level: 'error' | 'warning' | 'info'
  stackTrace?: string
  createdAt: number
  userId: string
}

export interface Repository {
  id: string
  name: string
  owner: string
  url: string
  description?: string
  language?: string
  stars?: number
  lastAnalyzed?: number
  userId: string
  createdAt: number
}

// Repository management functions
export const saveRepository = mutation({
  args: {
    name: v.string(),
    owner: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    language: v.optional(v.string()),
    stars: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error('Authentication required')
      }

      const userId = identity.subject

      // Check if repository already exists for this user
      const existingRepo = await ctx.db
        .query('repositories')
        .filter((q) => 
          q.and(
            q.eq(q.field('userId'), userId),
            q.eq(q.field('url'), args.url)
          )
        )
        .first()

      if (existingRepo) {
        // Update existing repository
        return await ctx.db.patch(existingRepo._id, {
          ...args,
          lastAnalyzed: Date.now(),
        })
      } else {
        // Create new repository
        return await ctx.db.insert('repositories', {
          ...args,
          userId,
          createdAt: Date.now(),
          lastAnalyzed: Date.now(),
        })
      }
    } catch (error) {
      console.error('Error saving repository:', error)
      throw new Error('Failed to save repository')
    }
  },
})

export const getUserRepositories = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        return []
      }

      const userId = identity.subject
      const repositories = await ctx.db
        .query('repositories')
        .filter((q) => q.eq(q.field('userId'), userId))
        .order('desc')
        .collect()

      return repositories
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw new Error('Failed to fetch repositories')
    }
  },
})

// CodeRabbit integration functions
export const saveCodeRabbitAnalysis = mutation({
  args: {
    repoUrl: v.string(),
    issues: v.array(v.object({
      file: v.string(),
      line: v.number(),
      severity: v.string(),
      message: v.string(),
      suggestion: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error('Authentication required')
      }

      const userId = identity.subject
      const createdAt = Date.now()

      // Save each issue
      const savedIssues = []
      for (const issue of args.issues) {
        const issueId = await ctx.db.insert('coderabbit_issues', {
          repoUrl: args.repoUrl,
          file: issue.file,
          line: issue.line,
          severity: issue.severity as 'low' | 'medium' | 'high',
          message: issue.message,
          suggestion: issue.suggestion,
          userId,
          createdAt,
        })
        savedIssues.push(issueId)
      }

      return savedIssues
    } catch (error) {
      console.error('Error saving CodeRabbit analysis:', error)
      throw new Error('Failed to save analysis')
    }
  },
})

export const getCodeRabbitIssues = query({
  args: {
    repoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        return []
      }

      const userId = identity.subject
      const issues = await ctx.db
        .query('coderabbit_issues')
        .filter((q) => 
          q.and(
            q.eq(q.field('userId'), userId),
            q.eq(q.field('repoUrl'), args.repoUrl)
          )
        )
        .order('desc')
        .collect()

      return issues
    } catch (error) {
      console.error('Error fetching CodeRabbit issues:', error)
      throw new Error('Failed to fetch issues')
    }
  },
})

// Sentry integration functions
export const saveSentryErrors = mutation({
  args: {
    repoUrl: v.string(),
    errors: v.array(v.object({
      title: v.string(),
      count: v.number(),
      lastSeen: v.string(),
      status: v.string(),
      level: v.string(),
      stackTrace: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        throw new Error('Authentication required')
      }

      const userId = identity.subject
      const createdAt = Date.now()

      // Save each error
      const savedErrors = []
      for (const error of args.errors) {
        const errorId = await ctx.db.insert('sentry_errors', {
          repoUrl: args.repoUrl,
          title: error.title,
          count: error.count,
          lastSeen: error.lastSeen,
          status: error.status as 'resolved' | 'unresolved',
          level: error.level as 'error' | 'warning' | 'info',
          stackTrace: error.stackTrace,
          userId,
          createdAt,
        })
        savedErrors.push(errorId)
      }

      return savedErrors
    } catch (error) {
      console.error('Error saving Sentry errors:', error)
      throw new Error('Failed to save errors')
    }
  },
})

export const getSentryErrors = query({
  args: {
    repoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        return []
      }

      const userId = identity.subject
      const errors = await ctx.db
        .query('sentry_errors')
        .filter((q) => 
          q.and(
            q.eq(q.field('userId'), userId),
            q.eq(q.field('repoUrl'), args.repoUrl)
          )
        )
        .order('desc')
        .collect()

      return errors
    } catch (error) {
      console.error('Error fetching Sentry errors:', error)
      throw new Error('Failed to fetch errors')
    }
  },
})

// Analytics and dashboard functions
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) {
        return {
          totalRepos: 0,
          totalIssues: 0,
          totalErrors: 0,
          resolvedErrors: 0,
        }
      }

      const userId = identity.subject

      const [repos, issues, errors] = await Promise.all([
        ctx.db
          .query('repositories')
          .filter((q) => q.eq(q.field('userId'), userId))
          .collect(),
        ctx.db
          .query('coderabbit_issues')
          .filter((q) => q.eq(q.field('userId'), userId))
          .collect(),
        ctx.db
          .query('sentry_errors')
          .filter((q) => q.eq(q.field('userId'), userId))
          .collect(),
      ])

      const resolvedErrors = errors.filter(error => error.status === 'resolved').length

      return {
        totalRepos: repos.length,
        totalIssues: issues.length,
        totalErrors: errors.length,
        resolvedErrors,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw new Error('Failed to fetch dashboard statistics')
    }
  },
})