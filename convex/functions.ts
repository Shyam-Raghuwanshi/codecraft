import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// === USER MANAGEMENT ===

/**
 * Save or update user information when they sign in with Clerk
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
      throw new Error(`Failed to save review: ${error.message}`);
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
    } catch (error) {
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
      throw new Error(`Failed to remove saved review: ${error.message}`);
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
 * Get review statistics for user dashboard
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
      };
    } catch (error) {
      console.error("Error getting review stats:", error);
      throw new Error("Failed to get review statistics");
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
      throw new Error(`Failed to get review: ${error.message}`);
    }
  },
});