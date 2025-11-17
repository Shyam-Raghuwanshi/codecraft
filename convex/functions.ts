import { createSign } from "node:crypto";
import { v } from "convex/values";
import { action, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

type WithDatabase = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

type GitHubInstallationRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  owner: {
    login: string;
    id: number;
  };
  permissions?: Record<string, boolean>;
  updated_at?: string;
  pushed_at?: string;
  default_branch?: string;
};

const API_TIMEOUT_MS = 30_000;
const MAX_API_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;
const API_RATE_LIMIT_DELAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const wrapError = (message: string, error: unknown) => {
  const detail = error instanceof Error ? error.message : "Unknown error";
  return new Error(`${message}: ${detail}`);
};

const findUserByClerkId = async (
  ctx: WithDatabase,
  clerkId: string
): Promise<Doc<"users"> | null> =>
  ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).first();

const getUserOrThrow = async (ctx: WithDatabase, clerkId: string) => {
  const user = await findUserByClerkId(ctx, clerkId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const fetchWithTimeout = async (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${API_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const retryWithBackoff = async <T>(fn: () => Promise<T>, attempt = 0): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= MAX_API_RETRIES - 1) {
      throw error;
    }

    const status = error instanceof Response ? error.status : null;
    const shouldRetry = status === null || status === 429 || status >= 500;

    if (!shouldRetry) {
      throw error;
    }

    const delay =
      status === 429
        ? API_RATE_LIMIT_DELAY_MS * (attempt + 1)
        : RETRY_BASE_DELAY_MS * 2 ** attempt;

    await wait(delay);
    return retryWithBackoff(fn, attempt + 1);
  }
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetchWithTimeout(url, init);

  if (response.status === 429) {
    throw response;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API request failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

const normalizePrivateKey = (key: string) => {
  if (key.includes("BEGIN") && key.includes("END")) {
    return key.replace(/\\n/g, "\n");
  }

  const normalized = key.replace(/\\n/g, "\n");
  return `-----BEGIN PRIVATE KEY-----\n${normalized}\n-----END PRIVATE KEY-----`;
};

const getGitHubAppConfig = () => {
  const appId = process.env.GITHUB_APP_ID || process.env.VITE_GITHUB_APP_ID;
  const rawPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY || process.env.VITE_GITHUB_APP_PRIVATE_KEY;

  if (!appId || !rawPrivateKey) {
    throw new Error("GitHub App credentials are not configured on the server.");
  }

  return {
    appId,
    privateKey: normalizePrivateKey(rawPrivateKey),
  };
};

const createAppJwt = () => {
  const { appId, privateKey } = getGitHubAppConfig();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  };

  const header = { alg: "RS256", typ: "JWT" };
  const encode = (value: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  const signingInput = `${encode(header)}.${encode(payload)}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(privateKey, "base64url");
  return `${signingInput}.${signature}`;
};

const createInstallationAccessToken = async (installationId: number): Promise<string> => {
  const jwt = createAppJwt();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "CodeCraft-App",
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create installation access token: ${response.status} ${errorBody}`
    );
  }

  const data = await response.json();
  return data.token;
};

export const saveInstallation = mutation({
  args: {
    clerkId: v.string(),
    installationId: v.number(),
    accountLogin: v.string(),
    accountId: v.number(),
    accountType: v.string(),
    repositorySelection: v.union(v.literal("all"), v.literal("selected")),
    appSlug: v.string(),
    targetType: v.string(),
    permissions: v.record(v.string(), v.string()),
    installationCreatedAt: v.optional(v.string()),
    installationUpdatedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUserOrThrow(ctx, args.clerkId);
      const now = Date.now();

      const existing = await ctx.db
        .query("installations")
        .withIndex("by_installation", (q) => q.eq("installationId", args.installationId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          userId: user._id,
          accountLogin: args.accountLogin,
          accountId: args.accountId,
          accountType: args.accountType,
          repositorySelection: args.repositorySelection,
          appSlug: args.appSlug,
          targetType: args.targetType,
          permissions: args.permissions,
          updatedAt: now,
          installationUpdatedAt: args.installationUpdatedAt,
        });
        return existing._id;
      }

      return ctx.db.insert("installations", {
        userId: user._id,
        installationId: args.installationId,
        accountLogin: args.accountLogin,
        accountId: args.accountId,
        accountType: args.accountType,
        repositorySelection: args.repositorySelection,
        appSlug: args.appSlug,
        targetType: args.targetType,
        permissions: args.permissions,
        createdAt: now,
        updatedAt: now,
        installationCreatedAt: args.installationCreatedAt,
        installationUpdatedAt: args.installationUpdatedAt,
      });
    } catch (error) {
      throw wrapError("Failed to save installation", error);
    }
  },
});

export const getInstallations = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    try {
      const user = await findUserByClerkId(ctx, clerkId);
      if (!user) {
        return [];
      }

      return ctx.db
        .query("installations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
    } catch (error) {
      throw wrapError("Failed to fetch installations", error);
    }
  },
});

export const removeInstallation = mutation({
  args: {
    clerkId: v.string(),
    installationId: v.number(),
  },
  handler: async (ctx, { clerkId, installationId }) => {
    try {
      const user = await getUserOrThrow(ctx, clerkId);
      const installation = await ctx.db
        .query("installations")
        .withIndex("by_installation", (q) => q.eq("installationId", installationId))
        .first();

      if (!installation || installation.userId !== user._id) {
        throw new Error("Installation not found or access denied");
      }

      await ctx.db.delete(installation._id);
      return { success: true };
    } catch (error) {
      throw wrapError("Failed to remove installation", error);
    }
  },
});

export const fetchInstallationRepositories = action({
  args: {
    clerkId: v.string(),
    installationId: v.number(),
    perPage: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { clerkId, installationId, perPage = 100, page = 1 }
  ): Promise<{
    installation: Doc<"installations">;
    repositories: GitHubInstallationRepository[];
    totalCount: number;
    page: number;
    perPage: number;
  }> => {
    "use node";

    try {
      const installations = await ctx.runQuery(api.functions.getInstallations, { clerkId });
      const installation = installations.find((entry) => entry.installationId === installationId);

      if (!installation) {
        throw new Error("Installation not found for this user");
      }

      const token = await createInstallationAccessToken(installationId);
      const data = await retryWithBackoff(() =>
        fetchJson<{ total_count?: number; repositories?: GitHubInstallationRepository[] }>(
          `https://api.github.com/installation/repositories?per_page=${perPage}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "User-Agent": "CodeCraft-App",
            },
          }
        )
      );

      return {
        installation,
        repositories: data.repositories ?? [],
        totalCount: data.total_count ?? data.repositories?.length ?? 0,
        page,
        perPage,
      };
    } catch (error) {
      throw wrapError("Failed to fetch installation repositories", error);
    }
  },
});

/**
 * Save or update base user information when they sign in with Clerk
 */
export const saveUserReview = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clerkId, email }) => {
    try {
      const existingUser = await findUserByClerkId(ctx, clerkId);

      if (existingUser) {
        if (existingUser.email !== email) {
          await ctx.db.patch(existingUser._id, { email });
        }
        return existingUser._id;
      }

      return ctx.db.insert("users", {
        clerkId,
        email,
        createdAt: Date.now(),
      });
    } catch (error) {
      throw wrapError("Failed to save user", error);
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
      if (!repoName.trim() || !repoUrl.trim()) {
        throw new Error("Repository information is required");
      }

      const user = await getUserOrThrow(ctx, clerkId);

      return ctx.db.insert("reviews", {
        userId: user._id,
        repoName,
        repoUrl,
        reviewData,
        createdAt: Date.now(),
      });
    } catch (error) {
      throw wrapError("Failed to save review", error);
    }
  },
});

export const saveReviewForLater = mutation({
  args: {
    clerkId: v.string(),
    reviewId: v.id("reviews"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, reviewId, notes }) => {
    try {
      const user = await getUserOrThrow(ctx, clerkId);
      const review = await ctx.db.get(reviewId);

      if (!review || review.userId !== user._id) {
        throw new Error("Review not found or access denied");
      }

      const existing = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("reviewId"), reviewId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          notes,
          savedAt: Date.now(),
        });
        return existing._id;
      }

      return ctx.db.insert("savedReviews", {
        userId: user._id,
        reviewId,
        savedAt: Date.now(),
        notes,
      });
    } catch (error) {
      throw wrapError("Failed to save review", error);
    }
  },
});

export const removeSavedReview = mutation({
  args: {
    clerkId: v.string(),
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, { clerkId, reviewId }) => {
    try {
      const user = await getUserOrThrow(ctx, clerkId);

      const savedReview = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("reviewId"), reviewId))
        .first();

      if (!savedReview) {
        throw new Error("Saved review not found");
      }

      await ctx.db.delete(savedReview._id);
      return { success: true };
    } catch (error) {
      throw wrapError("Failed to remove saved review", error);
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
      throw wrapError("Failed to fetch user reviews", error);
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
      const user = await findUserByClerkId(ctx, clerkId);
      if (!user) {
        return [];
      }

      const savedReviews = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      const reviewsWithData = await Promise.all(
        savedReviews.map(async (saved) => ({
          ...saved,
          review: await ctx.db.get(saved.reviewId),
        }))
      );

      return reviewsWithData.filter((item) => item.review !== null);
    } catch (error) {
      throw wrapError("Failed to fetch saved reviews", error);
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
      const user = await findUserByClerkId(ctx, clerkId);
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

      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const savedReviews = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const totals = reviews.reduce(
        (acc, review) => {
          const summary = review.reviewData.summary;
          acc.totalIssuesFound += summary.totalIssues;
          acc.criticalIssues += summary.criticalIssues;
          acc.majorIssues += summary.majorIssues;
          acc.minorIssues += summary.minorIssues;

          if (typeof summary.codeQualityScore === "number") {
            acc.qualityScores.push(summary.codeQualityScore);
          }

          return acc;
        },
        {
          totalIssuesFound: 0,
          criticalIssues: 0,
          majorIssues: 0,
          minorIssues: 0,
          qualityScores: [] as number[],
        }
      );

      const avgCodeQuality = totals.qualityScores.length
        ? Math.round(
            totals.qualityScores.reduce((sum, score) => sum + score, 0) /
              totals.qualityScores.length
          )
        : 0;

      const recentActivity = reviews
        .slice()
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
        totalIssuesFound: totals.totalIssuesFound,
        criticalIssues: totals.criticalIssues,
        majorIssues: totals.majorIssues,
        minorIssues: totals.minorIssues,
        avgCodeQuality,
        savedReviews: savedReviews.length,
        recentActivity,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      throw wrapError("Failed to fetch review statistics", error);
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
      const user = await getUserOrThrow(ctx, clerkId);
      const review = await ctx.db.get(reviewId);

      if (!review || review.userId !== user._id) {
        throw new Error("Review not found or access denied");
      }

      const savedReview = await ctx.db
        .query("savedReviews")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("reviewId"), reviewId))
        .first();

      return {
        ...review,
        isSaved: Boolean(savedReview),
        savedNotes: savedReview?.notes,
      };
    } catch (error) {
      throw wrapError("Failed to fetch review", error);
    }
  },
});
