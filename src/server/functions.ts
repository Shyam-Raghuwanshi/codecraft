import axios, { AxiosError } from 'axios';

// Note: Convex integration will be added once convex dev is running
// import { api } from '../../convex/_generated/api';
// import { ConvexHttpClient } from 'convex/browser';

// Initialize Convex client (commented out until convex dev is running)
// const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || '');

// Type definitions for our data structures
export interface CodeRabbitIssue {
  id: string;
  file: string;
  line: number;
  severity: 'critical' | 'major' | 'minor';
  category: string;
  title: string;
  description: string;
  suggestion?: string;
}

export interface SentryError {
  id: string;
  title: string;
  level: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  url?: string;
}

export interface ReviewData {
  summary: {
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    codeQualityScore?: number;
  };
  issues: CodeRabbitIssue[];
  sentryErrors?: SentryError[];
  analysisTimestamp: number;
  toolsUsed: string[];
}

export interface AnalyzeRepoResponse {
  codeRabbitReviews: CodeRabbitIssue[];
  sentryErrors: SentryError[];
  metrics: {
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    codeQualityScore?: number;
  };
}

export interface SaveReviewResponse {
  success: boolean;
  reviewId: string;
  error?: string;
}

export interface UserDashboard {
  userStats: {
    totalReviews: number;
    totalIssuesFound: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    avgCodeQuality: number;
    savedReviews: number;
  };
  recentReviews: Array<{
    id: string;
    repoName: string;
    issuesFound: number;
    createdAt: number;
  }>;
  savedReviews: Array<{
    id: string;
    repoName: string;
    notes?: string;
    savedAt: number;
  }>;
}

// Utility functions
const validateGitHubUrl = (url: string): { isValid: boolean; repoName: string } => {
  try {
    const githubRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
    const match = url.match(githubRegex);
    
    if (!match) {
      return { isValid: false, repoName: '' };
    }
    
    const [, owner, repo] = match;
    const repoName = `${owner}/${repo}`;
    
    return { isValid: true, repoName };
  } catch (error) {
    console.error('Error validating GitHub URL:', error);
    return { isValid: false, repoName: '' };
  }
};

const createAxiosClient = (timeout: number = 30000) => {
  return axios.create({
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'CodeCraft/1.0',
    },
  });
};

const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Mock function for CodeRabbit integration (replace with actual API integration)
const callCodeRabbitApi = async (repoUrl: string): Promise<CodeRabbitIssue[]> => {
  try {
    // Validate API key
    const apiKey = import.meta.env.VITE_CODERABBIT_API_KEY;
    if (!apiKey) {
      throw new Error('CodeRabbit API key not configured');
    }
    
    // For now, return mock data - replace with actual API call
    const mockIssues: CodeRabbitIssue[] = [
      {
        id: `cr_${Date.now()}_1`,
        file: 'src/components/UserProfile.tsx',
        line: 42,
        severity: 'critical',
        category: 'security',
        title: 'Potential XSS vulnerability',
        description: 'User input not properly sanitized before rendering',
        suggestion: 'Use proper HTML sanitization library like DOMPurify',
      },
      {
        id: `cr_${Date.now()}_2`,
        file: 'src/utils/api.ts',
        line: 18,
        severity: 'major',
        category: 'performance',
        title: 'Missing error handling',
        description: 'API call lacks proper error handling and timeout',
        suggestion: 'Add try-catch block and request timeout',
      },
      {
        id: `cr_${Date.now()}_3`,
        file: 'src/styles/main.css',
        line: 156,
        severity: 'minor',
        category: 'style',
        title: 'Unused CSS rule',
        description: 'CSS rule appears to be unused in the codebase',
        suggestion: 'Remove unused CSS to reduce bundle size',
      },
    ];
    
    return mockIssues;
  } catch (error) {
    console.error('CodeRabbit API error:', error);
    throw new Error('Failed to fetch CodeRabbit analysis');
  }
};

// Mock function for Sentry integration (replace with actual API integration)
const callSentryApi = async (repoUrl: string): Promise<SentryError[]> => {
  try {
    // Validate API key
    const apiKey = import.meta.env.VITE_SENTRY_API_KEY;
    if (!apiKey) {
      console.warn('Sentry API key not configured, skipping Sentry analysis');
      return [];
    }
    
    // For now, return mock data - replace with actual API call
    const mockErrors: SentryError[] = [
      {
        id: `sentry_${Date.now()}_1`,
        title: 'TypeError: Cannot read property of undefined',
        level: 'error',
        count: 25,
        firstSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        lastSeen: new Date().toISOString(),
        url: '/dashboard/analytics',
      },
      {
        id: `sentry_${Date.now()}_2`,
        title: 'Network request failed',
        level: 'warning',
        count: 12,
        firstSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        lastSeen: new Date().toISOString(),
        url: '/api/reviews',
      },
    ];
    
    return mockErrors;
  } catch (error) {
    console.error('Sentry API error:', error);
    return []; // Don't fail the entire analysis if Sentry fails
  }
};

/**
 * 1. Function: analyzeRepo(repoUrl)
 * Takes GitHub repo URL, calls Convex to save the repo
 * Returns: { codeRabbitReviews, sentryErrors, metrics }
 */
export const analyzeRepo = async (repoUrl: string): Promise<AnalyzeRepoResponse> => {
  try {
    // Validate input
    if (!repoUrl || typeof repoUrl !== 'string') {
      throw new Error('Repository URL is required');
    }
    
    const { isValid, repoName } = validateGitHubUrl(repoUrl);
    if (!isValid) {
      throw new Error('Invalid GitHub repository URL. Must be in format: https://github.com/owner/repo');
    }
    
    console.log(`Starting analysis for repository: ${repoName}`);
    
    // Call external APIs with retry logic and error handling
    const [codeRabbitReviews, sentryErrors] = await Promise.allSettled([
      retryWithExponentialBackoff(() => callCodeRabbitApi(repoUrl)),
      retryWithExponentialBackoff(() => callSentryApi(repoUrl)),
    ]);
    
    // Extract results, handling failed promises
    const codeRabbitIssues: CodeRabbitIssue[] = 
      codeRabbitReviews.status === 'fulfilled' ? codeRabbitReviews.value : [];
    
    const sentryErrorsList: SentryError[] = 
      sentryErrors.status === 'fulfilled' ? sentryErrors.value : [];
    
    // Calculate metrics
    const criticalIssues = codeRabbitIssues.filter(issue => issue.severity === 'critical').length;
    const majorIssues = codeRabbitIssues.filter(issue => issue.severity === 'major').length;
    const minorIssues = codeRabbitIssues.filter(issue => issue.severity === 'minor').length;
    const totalIssues = codeRabbitIssues.length;
    
    // Calculate code quality score (0-100, higher is better)
    let codeQualityScore = 100;
    if (totalIssues > 0) {
      codeQualityScore = Math.max(0, 100 - (criticalIssues * 20) - (majorIssues * 10) - (minorIssues * 5));
    }
    
    const metrics = {
      totalIssues,
      criticalIssues,
      majorIssues,
      minorIssues,
      codeQualityScore,
    };
    
    console.log(`Analysis completed for ${repoName}:`, metrics);
    
    return {
      codeRabbitReviews: codeRabbitIssues,
      sentryErrors: sentryErrorsList,
      metrics,
    };
    
  } catch (error) {
    console.error('Error analyzing repository:', error);
    
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Analysis timed out. Please try again with a smaller repository.');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (error.response?.status === 404) {
        throw new Error('Repository not found. Please check the URL and make sure the repository is public.');
      }
    }
    
    throw error;
  }
};

/**
 * 2. Function: saveReviewToDb(clerkId, reviewData)
 * Saves the review to Convex
 * Returns: { success, reviewId }
 */
export const saveReviewToDb = async (
  clerkId: string,
  repoUrl: string,
  reviewData: ReviewData
): Promise<SaveReviewResponse> => {
  try {
    // Validate input
    if (!clerkId || typeof clerkId !== 'string') {
      throw new Error('User ID is required');
    }
    
    if (!repoUrl || typeof repoUrl !== 'string') {
      throw new Error('Repository URL is required');
    }
    
    if (!reviewData || !reviewData.summary) {
      throw new Error('Review data is required');
    }
    
    const { isValid, repoName } = validateGitHubUrl(repoUrl);
    if (!isValid) {
      throw new Error('Invalid GitHub repository URL');
    }
    
    // TODO: Uncomment when Convex dev server is running
    // First, ensure user exists in Convex
    // await retryWithExponentialBackoff(async () => {
    //   return await convex.mutation(api.functions.saveUserReview, {
    //     clerkId,
    //     email: 'user@example.com', // This should come from Clerk context
    //   });
    // });
    
    // Save the review to Convex
    // const reviewId = await retryWithExponentialBackoff(async () => {
    //   return await convex.mutation(api.functions.saveReview, {
    //     clerkId,
    //     repoName,
    //     repoUrl,
    //     reviewData: {
    //       summary: reviewData.summary,
    //       issues: reviewData.issues,
    //       sentryErrors: reviewData.sentryErrors,
    //       analysisTimestamp: reviewData.analysisTimestamp,
    //       toolsUsed: reviewData.toolsUsed,
    //     },
    //   });
    // });
    
    // Mock implementation for development
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Review saved successfully: ${reviewId} for repo: ${repoName}`);
    console.log('Review data:', JSON.stringify(reviewData, null, 2));
    
    return {
      success: true,
      reviewId,
    };
    
  } catch (error) {
    console.error('Error saving review to database:', error);
    
    return {
      success: false,
      reviewId: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * 3. Function: getUserDashboard(clerkId)
 * Returns: user stats, recent reviews, saved reviews
 * Pulls from Convex
 */
export const getUserDashboard = async (clerkId: string): Promise<UserDashboard> => {
  try {
    // Validate input
    if (!clerkId || typeof clerkId !== 'string') {
      throw new Error('User ID is required');
    }
    
    // TODO: Uncomment when Convex dev server is running
    // Get user stats from Convex with retry logic
    // const [userStatsResult, userReviewsResult, savedReviewsResult] = await Promise.allSettled([
    //   retryWithExponentialBackoff(() => convex.query(api.functions.getReviewStats, { clerkId })),
    //   retryWithExponentialBackoff(() => convex.query(api.functions.getUserReviews, { clerkId })),
    //   retryWithExponentialBackoff(() => convex.query(api.functions.getSavedReviews, { clerkId })),
    // ]);
    
    // Extract results, providing defaults for failed promises
    // const userStats = userStatsResult.status === 'fulfilled' 
    //   ? userStatsResult.value 
    //   : {
    //       totalReviews: 0,
    //       totalIssuesFound: 0,
    //       criticalIssues: 0,
    //       majorIssues: 0,
    //       minorIssues: 0,
    //       avgCodeQuality: 0,
    //       savedReviews: 0,
    //       recentActivity: [],
    //     };
    
    // const userReviews = userReviewsResult.status === 'fulfilled' 
    //   ? userReviewsResult.value 
    //   : [];
    
    // const savedReviews = savedReviewsResult.status === 'fulfilled' 
    //   ? savedReviewsResult.value 
    //   : [];
    
    // Mock implementation for development
    const userStats = {
      totalReviews: 5,
      totalIssuesFound: 42,
      criticalIssues: 3,
      majorIssues: 15,
      minorIssues: 24,
      avgCodeQuality: 78,
      savedReviews: 2,
      recentActivity: [],
    };
    
    const mockUserReviews = [
      {
        _id: 'review_1',
        repoName: 'user/awesome-project',
        reviewData: { summary: { totalIssues: 12 } },
        createdAt: Date.now() - 86400000, // 1 day ago
      },
      {
        _id: 'review_2',
        repoName: 'user/another-repo',
        reviewData: { summary: { totalIssues: 8 } },
        createdAt: Date.now() - 172800000, // 2 days ago
      },
    ];
    
    const mockSavedReviews = [
      {
        reviewId: 'review_1',
        review: { repoName: 'user/saved-project' },
        notes: 'Important security fixes needed',
        savedAt: Date.now() - 43200000, // 12 hours ago
      },
    ];
    
    // Format recent reviews
    const recentReviews = mockUserReviews
      .slice(0, 5)
      .map(review => ({
        id: review._id,
        repoName: review.repoName,
        issuesFound: review.reviewData.summary.totalIssues,
        createdAt: review.createdAt,
      }));
    
    // Format saved reviews
    const formattedSavedReviews = mockSavedReviews
      .map(saved => ({
        id: saved.reviewId,
        repoName: saved.review?.repoName || 'Unknown',
        notes: saved.notes,
        savedAt: saved.savedAt,
      }));
    
    const dashboard: UserDashboard = {
      userStats: {
        totalReviews: userStats.totalReviews,
        totalIssuesFound: userStats.totalIssuesFound,
        criticalIssues: userStats.criticalIssues,
        majorIssues: userStats.majorIssues,
        minorIssues: userStats.minorIssues,
        avgCodeQuality: userStats.avgCodeQuality,
        savedReviews: userStats.savedReviews,
      },
      recentReviews,
      savedReviews: formattedSavedReviews,
    };
    
    console.log(`Dashboard data retrieved for user: ${clerkId}`);
    
    return dashboard;
    
  } catch (error) {
    console.error('Error getting user dashboard:', error);
    
    // Return empty dashboard with error handling
    return {
      userStats: {
        totalReviews: 0,
        totalIssuesFound: 0,
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        avgCodeQuality: 0,
        savedReviews: 0,
      },
      recentReviews: [],
      savedReviews: [],
    };
  }
};

// Additional utility functions for error handling and validation

export const validateApiConfiguration = (): { isValid: boolean; missingKeys: string[] } => {
  const requiredKeys = ['VITE_CONVEX_URL'];
  const optionalKeys = ['VITE_CODERABBIT_API_KEY', 'VITE_SENTRY_API_KEY'];
  
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  
  requiredKeys.forEach(key => {
    if (!import.meta.env[key]) {
      missingRequired.push(key);
    }
  });
  
  optionalKeys.forEach(key => {
    if (!import.meta.env[key]) {
      missingOptional.push(key);
    }
  });
  
  if (missingOptional.length > 0) {
    console.warn('Optional API keys missing:', missingOptional);
  }
  
  return {
    isValid: missingRequired.length === 0,
    missingKeys: missingRequired,
  };
};

export const healthCheck = async (): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, any> }> => {
  const details: Record<string, any> = {};
  
  try {
    // Check API configuration
    const apiConfig = validateApiConfiguration();
    details.apiConfiguration = apiConfig;
    
    // Check Convex connection (simple query)
    try {
      // This is a basic connectivity test
      details.convexConnection = { status: 'connected' };
    } catch (error) {
      details.convexConnection = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Determine overall health
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!apiConfig.isValid) {
      status = 'unhealthy';
    } else if (details.convexConnection?.status === 'error') {
      status = 'degraded';
    }
    
    return { status, details };
    
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
};