import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// === USER MANAGEMENT ===

/**
 * Save or update        } catch (error) {
      console.error("Error saving review:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to save review: ${errorMessage}`);
    }tch (error) {
      console.error("Error saving review:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to save review: ${errorMessage}`);
    }r information when they sign in with Clerk
 */
export const saveUserReview = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (existingUser) {
        // Update existing user's email if changed
        if (existingUser.email !== email) {
          await ctx.db.patch(existingUser._id, { email });
        }
        return existingUser._id;
      }

      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId,
        email,
        createdAt: Date.now(),
      });

      return userId;
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Failed to save user information");
    }
  },
});

// === REVIEW MANAGEMENT ===

/**
 * Save a new code review analysis result
 */
export const saveReview = mutation({
  args: {
    clerkId: v.string(),
    repoName: v.string(),
    repoUrl: v.string(),
    reviewData: v.object({
      summary: v.object({
        totalIssues: v.number(),
        criticalIssues: v.number(),
        majorIssues: v.number(),
        minorIssues: v.number(),
        codeQualityScore: v.optional(v.number()),
      }),
      issues: v.array(
        v.object({
          id: v.string(),
          file: v.string(),
          line: v.number(),
          severity: v.union(v.literal("critical"), v.literal("major"), v.literal("minor")),
          category: v.string(),
          title: v.string(),
          description: v.string(),
          suggestion: v.optional(v.string()),
        })
      ),
      sentryErrors: v.optional(
        v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            level: v.string(),
            count: v.number(),
            firstSeen: v.string(),
            lastSeen: v.string(),
            url: v.optional(v.string()),
          })
        )
      ),
      analysisTimestamp: v.number(),
      toolsUsed: v.array(v.string()),
    }),
  },
  handler: async (ctx, { clerkId, repoName, repoUrl, reviewData }) => {
    try {
      // Validate input
      if (!clerkId || !repoName || !reviewData) {
        throw new Error("Missing required fields");
      }

      // Find user by Clerk ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        throw new Error("User not found. Please sign in again.");
      }

      // Check if review already exists for this repo (prevent duplicates)
      const existingReview = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("repoName"), repoName))
        .first();

      if (existingReview) {
        // Update existing review with new data
        await ctx.db.patch(existingReview._id, {
          repoUrl,
          reviewData,
          createdAt: Date.now(), // Update timestamp
        });
        return existingReview._id;
      }

      // Create new review
      const reviewId = await ctx.db.insert("reviews", {
        userId: user._id,
        repoName,
        repoUrl,
        reviewData,
        createdAt: Date.now(),
      });

      return reviewId;
    } catch (error) {
      console.error("Error saving review:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to save review: ${errorMessage}`);
    }
  },
});

/**
 * Save a review to user's saved list
 */
export const saveUserReviewToList = mutation({
  args: {
    clerkId: v.string(),
    reviewId: v.id("reviews"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, reviewId, notes }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Check if already saved
      const existingSave = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("reviewId"), reviewId))
        .first();

      if (existingSave) {
        throw new Error("Review already saved");
      }

      // Save review
      const savedReviewId = await ctx.db.insert("savedReviews", {
        userId: user._id,
        reviewId,
        savedAt: Date.now(),
        notes,
      });

      return savedReviewId;
    } catch (error:any) {
      console.error("Error saving review to list:", error);
      throw new Error(`Failed to save review: ${error.message}`);
    }
  },
});

/**
 * Remove a review from user's saved list
 */
export const removeSavedReview = mutation({
  args: {
    clerkId: v.string(),
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, { clerkId, reviewId }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Find saved review
      const savedReview = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("reviewId"), reviewId))
        .first();

      if (!savedReview) {
        throw new Error("Saved review not found");
      }

      // Remove saved review
      await ctx.db.delete(savedReview._id);
      return { success: true };
    } catch (error) {
      console.error("Error removing saved review:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to remove saved review: ${errorMessage}`);
    }
  },
});

// === QUERIES ===

/**
 * Get all reviews for a user
 */
export const getUserReviews = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        return [];
      }

      // Get all reviews for user, sorted by most recent first
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      return reviews;
    } catch (error) {
      console.error("Error getting user reviews:", error);
      throw new Error("Failed to get user reviews");
    }
  },
});

/**
 * Get user's saved reviews with full review data
 */
export const getSavedReviews = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        return [];
      }

      // Get saved reviews
      const savedReviews = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      // Fetch full review data for each saved review
      const reviewsWithData = await Promise.all(
        savedReviews.map(async (saved) => {
          const review = await ctx.db.get(saved.reviewId);
          return {
            ...saved,
            review,
          };
        })
      );

      return reviewsWithData.filter((item) => item.review !== null);
    } catch (error) {
      console.error("Error getting saved reviews:", error);
      throw new Error("Failed to get saved reviews");
    }
  },
});

/**
 * Get review statistics for user dashboard (Real-time enabled)
 */
export const getReviewStats = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        return {
          totalReviews: 0,
          totalIssuesFound: 0,
          criticalIssues: 0,
          majorIssues: 0,
          minorIssues: 0,
          avgCodeQuality: 0,
          savedReviews: 0,
          recentActivity: [],
          lastUpdated: Date.now(),
        };
      }

      // Get all reviews
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      // Get saved reviews count
      const savedReviews = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      // Calculate aggregated statistics
      let totalIssuesFound = 0;
      let criticalIssues = 0;
      let majorIssues = 0;
      let minorIssues = 0;
      let qualityScores: number[] = [];

      reviews.forEach((review) => {
        const summary = review.reviewData.summary;
        totalIssuesFound += summary.totalIssues;
        criticalIssues += summary.criticalIssues;
        majorIssues += summary.majorIssues;
        minorIssues += summary.minorIssues;
        
        if (summary.codeQualityScore) {
          qualityScores.push(summary.codeQualityScore);
        }
      });

      const avgCodeQuality = qualityScores.length > 0 
        ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
        : 0;

      // Get recent activity (last 5 reviews)
      const recentActivity = reviews
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((review) => ({
          id: review._id,
          repoName: review.repoName,
          issuesFound: review.reviewData.summary.totalIssues,
          createdAt: review.createdAt,
        }));

      return {
        totalReviews: reviews.length,
        totalIssuesFound,
        criticalIssues,
        majorIssues,
        minorIssues,
        avgCodeQuality,
        savedReviews: savedReviews.length,
        recentActivity,
        lastUpdated: Date.now(), // Add timestamp for real-time tracking
      };
    } catch (error) {
      console.error("Error getting review stats:", error);
      throw new Error("Failed to get review statistics");
    }
  },
});

/**
 * Get recent reviews for dashboard (Real-time enabled)
 */
export const getRecentReviews = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { clerkId, limit = 10 }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        return [];
      }

      // Get recent reviews with limit
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(limit);

      return reviews.map((review) => ({
        ...review,
        timeAgo: Date.now() - review.createdAt, // For relative time calculations
      }));
    } catch (error) {
      console.error("Error getting recent reviews:", error);
      throw new Error("Failed to get recent reviews");
    }
  },
});

/**
 * Get repository specific data for real-time updates
 */
export const getRepoData = query({
  args: {
    clerkId: v.string(),
    repoName: v.string(),
  },
  handler: async (ctx, { clerkId, repoName }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        return null;
      }

      // Get latest review for this repository
      const latestReview = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("repoName"), repoName))
        .order("desc")
        .first();

      if (!latestReview) {
        return null;
      }

      return {
        ...latestReview,
        hasNewIssues: (Date.now() - latestReview.createdAt) < 300000, // New if within 5 minutes
        issueCount: latestReview.reviewData.summary.totalIssues,
        criticalCount: latestReview.reviewData.summary.criticalIssues,
        lastAnalysis: latestReview.createdAt,
      };
    } catch (error) {
      console.error("Error getting repo data:", error);
      throw new Error("Failed to get repository data");
    }
  },
});

/**
 * Get notification count for user (unread issues, new reviews etc.)
 */
export const getNotificationCount = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        return { newReviews: 0, criticalIssues: 0, totalNotifications: 0 };
      }

      // Get reviews from last 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentReviews = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.gt(q.field("createdAt"), oneDayAgo))
        .collect();

      // Count critical issues from recent reviews
      const criticalIssues = recentReviews.reduce((count, review) => {
        return count + review.reviewData.summary.criticalIssues;
      }, 0);

      return {
        newReviews: recentReviews.length,
        criticalIssues,
        totalNotifications: recentReviews.length + criticalIssues,
      };
    } catch (error) {
      console.error("Error getting notification count:", error);
      return { newReviews: 0, criticalIssues: 0, totalNotifications: 0 };
    }
  },
});

/**
 * Get a single review by ID
 */
export const getReview = query({
  args: {
    reviewId: v.id("reviews"),
    clerkId: v.string(),
  },
  handler: async (ctx, { reviewId, clerkId }) => {
    try {
      // Find user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Get review
      const review = await ctx.db.get(reviewId);

      if (!review) {
        throw new Error("Review not found");
      }

      // Check if user owns this review
      if (review.userId !== user._id) {
        throw new Error("Access denied");
      }

      // Check if review is saved by user
      const savedReview = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("reviewId"), reviewId))
        .first();

      return {
        ...review,
        isSaved: !!savedReview,
        savedNotes: savedReview?.notes,
      };
    } catch (error) {
      console.error("Error getting review:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to get review: ${errorMessage}`);
    }
  },
});