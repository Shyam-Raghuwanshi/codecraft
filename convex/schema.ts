import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store user information from Clerk
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(), // User email
    createdAt: v.number(), // Timestamp
  })
    .index("by_clerk_id", ["clerkId"]) // Index for fast lookups by Clerk ID
    .index("by_email", ["email"]), // Index for lookups by email

  // Reviews table to store code review analysis results
  reviews: defineTable({
    userId: v.id("users"), // Reference to users table
    repoName: v.string(), // GitHub repository name (e.g., "owner/repo")
    repoUrl: v.string(), // Full GitHub repository URL
    reviewData: v.object({
      // CodeRabbit review data structure
      summary: v.object({
        totalIssues: v.number(),
        criticalIssues: v.number(),
        majorIssues: v.number(),
        minorIssues: v.number(),
        codeQualityScore: v.optional(v.number()), // 0-100 score
      }),
      issues: v.array(
        v.object({
          id: v.string(),
          file: v.string(),
          line: v.number(),
          severity: v.union(v.literal("critical"), v.literal("major"), v.literal("minor")),
          category: v.string(), // e.g., "security", "performance", "style"
          title: v.string(),
          description: v.string(),
          suggestion: v.optional(v.string()),
        })
      ),
      // Sentry error data (if integrated)
      sentryErrors: v.optional(
        v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            level: v.string(), // error, warning, info
            count: v.number(),
            firstSeen: v.string(),
            lastSeen: v.string(),
            url: v.optional(v.string()),
          })
        )
      ),
      // Additional metadata
      analysisTimestamp: v.number(),
      toolsUsed: v.array(v.string()), // ["coderabbit", "sentry", etc.]
    }),
    createdAt: v.number(), // Timestamp when review was created
  })
    .index("by_user", ["userId"]) // Index for getting user's reviews
    .index("by_repo", ["repoName"]) // Index for getting reviews by repo
    .index("by_created_at", ["createdAt"]), // Index for sorting by date

  // Saved reviews table for users to bookmark important reviews
  savedReviews: defineTable({
    userId: v.id("users"), // Reference to users table
    reviewId: v.id("reviews"), // Reference to reviews table
    savedAt: v.number(), // Timestamp when review was saved
    notes: v.optional(v.string()), // Optional user notes
  })
    .index("by_user", ["userId"]) // Index for getting user's saved reviews
    .index("by_review", ["reviewId"]) // Index for checking if review is saved
    .index("by_saved_at", ["savedAt"]), // Index for sorting by save date
});