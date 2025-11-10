# 🚀 Convex Setup Guide for CodeCraft

## ✅ What We've Created

### 📁 Convex Files Structure
```
convex/
├── schema.ts      # Database schema with users, reviews, savedReviews tables
├── functions.ts   # All mutations and queries for the app
└── (generated files will appear here after setup)
```

### 🗄️ Database Schema

#### **Users Table**
- `clerkId` - Clerk authentication ID (indexed)
- `email` - User email (indexed)
- `createdAt` - Registration timestamp

#### **Reviews Table**
- `userId` - Reference to users table
- `repoName` - GitHub repo name (e.g., "owner/repo")
- `repoUrl` - Full GitHub URL
- `reviewData` - Complete analysis data including:
  - Summary statistics (total, critical, major, minor issues)
  - Individual issues array with file, line, severity, category
  - Optional Sentry errors
  - Analysis metadata
- `createdAt` - Review creation timestamp

#### **SavedReviews Table**
- `userId` - Reference to users table
- `reviewId` - Reference to reviews table
- `savedAt` - Save timestamp
- `notes` - Optional user notes

### 🔧 Available Functions

#### **Mutations:**
- `saveUserReview(clerkId, email)` - Create/update user
- `saveReview(clerkId, repoName, repoUrl, reviewData)` - Save code review
- `saveUserReviewToList(clerkId, reviewId, notes)` - Bookmark review
- `removeSavedReview(clerkId, reviewId)` - Remove bookmark

#### **Queries:**
- `getUserReviews(clerkId)` - Get all user's reviews
- `getSavedReviews(clerkId)` - Get bookmarked reviews with full data
- `getReviewStats(clerkId)` - Dashboard statistics
- `getReview(reviewId, clerkId)` - Single review with save status

---

## 🚀 Deployment Instructions

### Step 1: Initialize Convex
```bash
# Navigate to your project
cd /home/shyam/Desktop/code/codecraft

# Initialize Convex (creates .env.local with CONVEX_URL)
npx convex dev
```

**What happens:**
- Creates `.env.local` with `VITE_CONVEX_URL`
- Generates `convex/_generated/` folder with TypeScript types
- Starts local development server
- Opens Convex dashboard in browser

### Step 2: Set Up Environment Variables
```bash
# Copy the example file
cp .env.local.example .env.local

# Your .env.local should look like:
# VITE_CONVEX_URL=https://your-convex-url.convex.cloud (auto-generated)
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (add your Clerk key)
# VITE_CODERABBIT_API_KEY=... (add when ready)
# VITE_SENTRY_DSN=... (add when ready)
```

### Step 3: Deploy to Production
```bash
# Deploy to Convex cloud (when ready for production)
npm run convex:deploy
```

---

## 🔗 Frontend Integration Example

### Setup Convex Provider
```typescript
// In your main App component or main.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

function App() {
  return (
    <ConvexProvider client={convex}>
      {/* Your app components */}
    </ConvexProvider>
  );
}
```

### Using Mutations in Components
```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function ReviewForm() {
  const saveReview = useMutation(api.functions.saveReview);
  
  const handleSubmit = async (repoData) => {
    try {
      const reviewId = await saveReview({
        clerkId: user.id, // from Clerk
        repoName: "owner/repo-name",
        repoUrl: "https://github.com/owner/repo-name",
        reviewData: {
          summary: {
            totalIssues: 15,
            criticalIssues: 2,
            majorIssues: 5,
            minorIssues: 8,
            codeQualityScore: 85
          },
          issues: [
            {
              id: "issue-1",
              file: "src/App.tsx",
              line: 42,
              severity: "critical",
              category: "security",
              title: "Potential XSS vulnerability",
              description: "User input not sanitized",
              suggestion: "Use a sanitization library"
            }
          ],
          analysisTimestamp: Date.now(),
          toolsUsed: ["coderabbit"]
        }
      });
      
      console.log("Review saved:", reviewId);
    } catch (error) {
      console.error("Failed to save review:", error);
    }
  };
}
```

### Using Queries in Components
```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function Dashboard() {
  const stats = useQuery(api.functions.getReviewStats, { 
    clerkId: user.id 
  });
  const reviews = useQuery(api.functions.getUserReviews, { 
    clerkId: user.id 
  });

  if (stats === undefined || reviews === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Your Stats</h2>
      <p>Total Reviews: {stats.totalReviews}</p>
      <p>Issues Found: {stats.totalIssuesFound}</p>
      <p>Average Quality Score: {stats.avgCodeQuality}</p>
      
      <h3>Recent Reviews</h3>
      {reviews.map(review => (
        <div key={review._id}>
          <h4>{review.repoName}</h4>
          <p>Issues: {review.reviewData.summary.totalIssues}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛠️ Development Workflow

### Local Development
```bash
# Terminal 1: Start Convex dev server
npm run convex:dev

# Terminal 2: Start Vite dev server
npm run dev
```

### Making Schema Changes
1. Update `convex/schema.ts`
2. Convex will automatically sync changes
3. TypeScript types will regenerate

### Testing Functions
- Use Convex dashboard to test mutations/queries
- Access dashboard at: `https://dashboard.convex.dev`
- Navigate to your project → Functions tab

---

## 🔒 Security Best Practices

### ✅ Implemented Security Features
- **User Authentication**: All functions validate Clerk user ID
- **Data Isolation**: Users can only access their own data
- **Input Validation**: All mutations validate required fields
- **Error Handling**: Safe error messages (no sensitive data leaked)
- **Type Safety**: Full TypeScript coverage

### 🚨 Production Checklist
- [ ] Set up production Convex deployment
- [ ] Configure proper CORS settings
- [ ] Set up monitoring/logging
- [ ] Add rate limiting (Convex handles this)
- [ ] Review data access patterns
- [ ] Test error scenarios

---

## 📊 Sample Data for Testing

### Test User Creation
```typescript
// This will be called when user signs in with Clerk
await saveUserReview({
  clerkId: "user_2abc123def",
  email: "test@example.com"
});
```

### Test Review Data
```typescript
const sampleReviewData = {
  summary: {
    totalIssues: 12,
    criticalIssues: 1,
    majorIssues: 4,
    minorIssues: 7,
    codeQualityScore: 78
  },
  issues: [
    {
      id: "CR-001",
      file: "src/utils/api.ts",
      line: 25,
      severity: "critical",
      category: "security",
      title: "API key exposed in client code",
      description: "API key is hardcoded in the client-side code",
      suggestion: "Move API key to environment variables"
    },
    {
      id: "CR-002", 
      file: "src/components/ReviewCard.tsx",
      line: 15,
      severity: "major",
      category: "performance",
      title: "Unnecessary re-renders",
      description: "Component re-renders on every prop change",
      suggestion: "Use React.memo() to optimize rendering"
    }
  ],
  analysisTimestamp: Date.now(),
  toolsUsed: ["coderabbit"]
};
```

---

## 🆘 Troubleshooting

### Common Issues

1. **"Cannot find module '_generated'" error**
   - Solution: Run `npx convex dev` to generate types

2. **Authentication errors**
   - Verify `VITE_CONVEX_URL` in `.env.local`
   - Check Clerk integration

3. **Schema changes not reflecting**
   - Restart `npx convex dev`
   - Clear browser cache

4. **Build errors in production**
   - Run `npm run convex:deploy` before deploying frontend
   - Ensure environment variables are set in production

### Need Help?
- Check Convex logs in dashboard
- Use Convex Discord community
- Review Convex documentation: https://docs.convex.dev

---

## 🎯 Next Steps

1. **Initialize Convex**: Run `npx convex dev`
2. **Add Clerk Integration**: Set up user authentication
3. **Create UI Components**: Build review display components
4. **Integrate APIs**: Connect CodeRabbit and Sentry
5. **Test Everything**: Use sample data to verify functionality

**Your Convex backend is now ready for the CodeCraft hackathon! 🚀**