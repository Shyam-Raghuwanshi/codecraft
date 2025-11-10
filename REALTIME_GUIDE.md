# Real-time Convex Integration Guide

## 🚀 Overview

Your CodeCraft app now has **real-time data synchronization** using Convex! Here's how it works and how to use the `useQuery` hooks for live updates.

## 📋 What's Been Implemented

### ✅ 1. Dashboard Real-time Features
- **Live review statistics** that update automatically when new reviews are saved
- **Recent activity feed** with real-time updates as reviews come in
- **Notification count** that shows unread reviews and critical issues
- **Auto-updating timestamps** showing "just now", "2m ago", etc.

### ✅ 2. Repository Page Notifications  
- **"New issues detected"** notifications when analysis finds new problems
- **Auto-updating error counts** without page refresh
- **Real-time connection status** indicator
- **Live issue badges** with animated alerts for new issues

### ✅ 3. Notification System
- **Browser push notifications** for important updates
- **In-app notification toasts** with different types (success, warning, error, info)
- **Real-time notification bell** with live count updates
- **Auto-dismissing alerts** with customizable duration

## 🔧 How to Use Convex useQuery Hooks

### Basic Pattern
```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

// This hook automatically updates when data changes in Convex
const data = useQuery(api.functions.myFunction, { arg1: "value" });

// Handle loading and error states
if (data === undefined) return <LoadingSpinner />;
if (data === null) return <ErrorMessage />;

// Use the data - it's always fresh!
return <div>{data.someProperty}</div>;
```

### Real-world Examples

#### 1. Dashboard Statistics (Live Updates)
```typescript
// src/lib/convex-hooks.ts
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useDashboardStats() {
  const { userId } = useAuth();
  
  const stats = useQuery(
    api.functions.getReviewStats,
    userId ? { clerkId: userId } : 'skip'  // 'skip' prevents query when no user
  );

  return {
    stats,
    isLoading: stats === undefined,
    hasError: !userId,
  };
}

// Usage in component:
function Dashboard() {
  const { stats, isLoading } = useDashboardStats();
  
  // This automatically re-renders when stats change!
  return (
    <div>
      {isLoading ? <Loading /> : (
        <StatCard value={stats.totalReviews} title="Total Reviews" />
      )}
    </div>
  );
}
```

#### 2. Recent Reviews Feed (Auto-updating)
```typescript
// Real-time recent reviews
export function useRecentReviews(limit = 5) {
  const { userId } = useAuth();
  
  const reviews = useQuery(
    api.functions.getRecentReviews,
    userId ? { clerkId: userId, limit } : 'skip'
  );

  // Transform with relative timestamps
  const transformedReviews = reviews?.map((review) => ({
    ...review,
    timeAgoText: getTimeAgo(review.createdAt),
    isNewReview: (Date.now() - review.createdAt) < 300000, // 5 minutes
  }));

  return {
    reviews: transformedReviews || [],
    isLoading: reviews === undefined,
  };
}

// Usage:
function ActivityFeed() {
  const { reviews } = useRecentReviews(10);
  
  // This list updates automatically when new reviews are added!
  return (
    <div>
      {reviews.map(review => (
        <div key={review._id}>
          <h4>{review.repoName}</h4>
          <p>{review.timeAgoText}</p> {/* Updates every second! */}
          {review.isNewReview && <Badge>NEW</Badge>}
        </div>
      ))}
    </div>
  );
}
```

#### 3. Repository Issue Tracking (Live Notifications)
```typescript
export function useRepoData(repoName) {
  const { userId } = useAuth();
  const [previousIssueCount, setPreviousIssueCount] = useState(null);

  const repoData = useQuery(
    api.functions.getRepoData,
    userId && repoName ? { clerkId: userId, repoName } : 'skip'
  );

  // Watch for changes in issue count
  useEffect(() => {
    if (repoData?.issueCount !== undefined) {
      if (previousIssueCount !== null && repoData.issueCount > previousIssueCount) {
        // NEW ISSUES DETECTED! Show notification
        const newIssues = repoData.issueCount - previousIssueCount;
        showNotification({
          type: 'warning',
          title: 'New Issues Detected',
          message: `${newIssues} new issues found in ${repoName}`,
        });
      }
      setPreviousIssueCount(repoData.issueCount);
    }
  }, [repoData?.issueCount, previousIssueCount, repoName]);

  return {
    issueCount: repoData?.issueCount || 0,
    hasNewIssues: repoData?.hasNewIssues || false,
    isLoading: repoData === undefined,
  };
}

// Usage:
function RepoPage() {
  const { issueCount, hasNewIssues } = useRepoData('user/repo');
  
  // The badge automatically updates and animates for new issues!
  return (
    <div>
      <IssueBadge 
        count={issueCount} 
        hasNew={hasNewIssues}
        className={hasNewIssues ? 'animate-pulse border-red-500' : ''}
      />
    </div>
  );
}
```

## 🔄 How Real-time Works

### 1. Convex Subscriptions
- `useQuery` creates a **subscription** to your Convex function
- When data changes in the database, **all connected clients** get updates instantly
- No need to poll, refresh, or manually fetch data
- Updates happen in **real-time** (usually < 100ms)

### 2. Optimistic Updates
```typescript
export function useSaveReview() {
  const saveReview = useMutation(api.functions.saveReview);
  
  const save = async (reviewData) => {
    try {
      // This triggers immediate updates to all useQuery hooks watching reviews!
      await saveReview(reviewData);
      
      // Show success notification
      notifications.success('Review Saved', 'Your review has been saved');
    } catch (error) {
      notifications.error('Save Failed', error.message);
    }
  };

  return { save };
}
```

### 3. Automatic Error Handling
```typescript
// Convex handles network issues automatically
const data = useQuery(api.functions.getData, { id: "123" });

// These states are handled for you:
// - undefined = still loading
// - null = no data found  
// - object = data loaded
// - automatic retries on network errors
// - reconnection when network comes back
```

## 🎯 Key Features Implemented

### Dashboard (`src/Home.tsx`)
```typescript
// Real-time statistics
const { stats, notifications } = useDashboardStats();

// Live activity feed  
const { reviews } = useRecentReviews();

// Auto-updating notification bell
<NotificationBell count={notifications.totalNotifications} />

// Reviews update instantly when new ones are saved
{reviews.map(review => (
  <ReviewItem 
    key={review._id}
    data={review} 
    timeAgo={review.timeAgoText} // Updates every second
  />
))}
```

### Repository Page (`src/routes/repo-realtime.tsx`)
```typescript
// Real-time issue tracking
const { issueCount, hasNewIssues, criticalCount } = useRepoData(repoName);

// Live status indicator
<RealtimeStatusIndicator lastUpdate={lastAnalysis} />

// Auto-updating issue badge with animations
<IssueNotificationBadge 
  issueCount={issueCount}
  hasNewIssues={hasNewIssues} // Triggers animations and notifications
  criticalCount={criticalCount}
/>

// Demo controls to simulate new issues
<button onClick={simulateNewIssues}>
  Simulate New Issues
</button>
```

### Notification System (`src/components/NotificationContainer.tsx`)
```typescript
// Show notifications from anywhere
notifications.newIssues(3, 'my-repo');
notifications.success('Review Completed', 'Analysis finished');
notifications.error('API Error', 'Failed to connect');

// Browser notifications (with permission)
const { requestPermission } = useNotificationPermission();
```

## 🎮 How to Test Real-time Features

### 1. Open Multiple Browser Tabs
- Open your app in 2+ tabs
- Save a review in one tab
- Watch it appear instantly in other tabs!

### 2. Use Demo Controls
- Go to any repository page
- Click "Simulate New Issues"
- See real-time notifications and updates

### 3. Monitor Network Tab
- Open DevTools → Network
- See WebSocket connection to Convex
- Watch real-time messages flowing

## 🔧 Environment Setup

Make sure you have these in `.env.local`:
```bash
# Convex (auto-generated by CLI)
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Auth (get from dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## 🚀 Next Steps

### Add More Real-time Features
```typescript
// 1. Real-time collaboration
const { activeUsers } = useQuery(api.functions.getActiveUsers, { repoName });

// 2. Live code analysis results
const { analysisProgress } = useQuery(api.functions.getAnalysisStatus, { jobId });

// 3. Real-time chat/comments
const { comments } = useQuery(api.functions.getComments, { reviewId });

// 4. Live repository health score
const { healthScore } = useQuery(api.functions.getRepoHealth, { repoName });
```

### Performance Optimization
```typescript
// Use pagination for large datasets
const { reviews } = useQuery(
  api.functions.getPaginatedReviews, 
  { cursor: null, limit: 20 }
);

// Skip queries when not needed
const data = useQuery(
  api.functions.getData,
  isVisible ? { id } : 'skip' // Only fetch when component is visible
);
```

## ✨ Best Practices

1. **Always handle loading states**: `data === undefined`
2. **Use 'skip' for conditional queries**: When you don't have required params
3. **Transform data in hooks**: Keep components clean
4. **Show loading/error states**: For better UX
5. **Use notifications sparingly**: Don't overwhelm users
6. **Test real-time features**: Use multiple tabs/windows

## 🐛 Troubleshooting

### Common Issues:
```typescript
// 1. Query not updating?
// Make sure you're not caching the result
const data = useQuery(api.functions.getData, args); // ✅ Fresh every time

// 2. Too many re-renders?
// Move expensive operations to useMemo
const processedData = useMemo(() => 
  data?.map(expensive_operation), 
  [data]
);

// 3. Notifications not showing?
// Check notification permissions
const { permission, requestPermission } = useNotificationPermission();
```

---

Your CodeCraft app now has **enterprise-grade real-time features**! 🎉

The `useQuery` hooks will keep your UI automatically synchronized with the database, providing a seamless user experience with live updates and notifications.