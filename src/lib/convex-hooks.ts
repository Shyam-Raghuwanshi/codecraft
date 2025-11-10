/**
 * Custom Hooks for Convex Real-time Data
 * CodeCraft - Hackathon Project
 * 
 * These hooks provide easy access to real-time Convex data with error handling
 * Follow the rules: Always include error handling, proper TypeScript types
 */

import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { useState, useEffect } from 'react';

/**
 * Hook to get real-time dashboard statistics
 * Automatically updates when data changes in Convex
 */
export function useDashboardStats() {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const stats = useQuery(
    api.functions.getReviewStats,
    userId ? { clerkId: userId } : 'skip'
  );

  const notifications = useQuery(
    api.functions.getNotificationCount,
    userId ? { clerkId: userId } : 'skip'
  );

  // Handle loading and error states
  const isLoading = stats === undefined || notifications === undefined;
  const hasError = !userId || error !== null;

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
    } else {
      setError(null);
    }
  }, [userId]);

  return {
    stats,
    notifications,
    isLoading: isLoading && userId !== null,
    hasError,
    error,
    retry: () => {
      setError(null);
      // Convex automatically retries on network issues
    }
  };
}

/**
 * Hook to get real-time recent reviews for dashboard
 * Updates live as new reviews are saved
 */
export function useRecentReviews(limit: number = 5) {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const reviews = useQuery(
    api.functions.getRecentReviews,
    userId ? { clerkId: userId, limit } : 'skip'
  );

  const isLoading = reviews === undefined;
  const hasError = !userId || error !== null;

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
    } else {
      setError(null);
    }
  }, [userId]);

  // Transform data to include relative timestamps
  const transformedReviews = reviews?.map((review) => ({
    ...review,
    timeAgoText: getTimeAgo(review.createdAt),
    isNewReview: (Date.now() - review.createdAt) < 300000, // New if within 5 minutes
  }));

  return {
    reviews: transformedReviews || [],
    isLoading: isLoading && userId !== null,
    hasError,
    error,
    retry: () => {
      setError(null);
    }
  };
}

/**
 * Hook to get real-time repository data
 * Shows notifications for new issues detected
 */
export function useRepoData(repoName: string) {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [previousIssueCount, setPreviousIssueCount] = useState<number | null>(null);

  const repoData = useQuery(
    api.functions.getRepoData,
    userId && repoName ? { clerkId: userId, repoName } : 'skip'
  );

  const isLoading = repoData === undefined;
  const hasError = !userId || !repoName || error !== null;

  // Track changes in issue count for notifications
  useEffect(() => {
    if (repoData?.issueCount !== undefined) {
      if (previousIssueCount !== null && repoData.issueCount > previousIssueCount) {
        // New issues detected!
        const newIssuesCount = repoData.issueCount - previousIssueCount;
        showNewIssuesNotification(newIssuesCount, repoName);
      }
      setPreviousIssueCount(repoData.issueCount);
    }
  }, [repoData?.issueCount, previousIssueCount, repoName]);

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
    } else if (!repoName) {
      setError('Repository name required');
    } else {
      setError(null);
    }
  }, [userId, repoName]);

  return {
    repoData,
    hasNewIssues: repoData?.hasNewIssues || false,
    issueCount: repoData?.issueCount || 0,
    criticalCount: repoData?.criticalCount || 0,
    lastAnalysis: repoData?.lastAnalysis,
    isLoading: isLoading && userId !== null && repoName !== '',
    hasError,
    error,
    retry: () => {
      setError(null);
    }
  };
}

/**
 * Hook to get all user reviews with real-time updates
 */
export function useUserReviews() {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const reviews = useQuery(
    api.functions.getUserReviews,
    userId ? { clerkId: userId } : 'skip'
  );

  const isLoading = reviews === undefined;
  const hasError = !userId || error !== null;

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
    } else {
      setError(null);
    }
  }, [userId]);

  return {
    reviews: reviews || [],
    isLoading: isLoading && userId !== null,
    hasError,
    error,
    retry: () => {
      setError(null);
    }
  };
}

/**
 * Hook to save a review with optimistic updates
 */
export function useSaveReview() {
  const saveReview = useMutation(api.functions.saveReview);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (reviewData: {
    clerkId: string;
    repoName: string;
    repoUrl: string;
    reviewData: any;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await saveReview(reviewData);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save review';
      setError(errorMessage);
      console.error('Error saving review:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    save,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Utility function to get human-readable time ago string
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays}d ago`;
  }
}

/**
 * Show browser notification for new issues
 */
function showNewIssuesNotification(count: number, repoName: string) {
  if ('Notification' in window) {
    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(`CodeCraft: New Issues Detected`, {
        body: `${count} new issue${count > 1 ? 's' : ''} found in ${repoName}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: `codecraft-${repoName}`, // Prevent duplicate notifications
        requireInteraction: false,
      });
      
      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }
}

/**
 * Hook to manage browser notification permissions
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'default';
  };

  return {
    permission,
    requestPermission,
    isSupported: 'Notification' in window,
  };
}