# CodeCraft - Copilot Rules & Guidelines

## GOLDEN RULES (MUST FOLLOW)

### Rule 1: Code Quality First
- **ALWAYS** include error handling in every function
- **NEVER** leave console.logs in production code (use proper logging)
- **ALWAYS** add TypeScript types (no `any` types unless absolutely necessary)
- **ALWAYS** validate user input before processing
- **ALWAYS** handle null/undefined cases

### Rule 2: API Safety
- **NEVER** expose API keys in code (use environment variables only)
- **ALWAYS** add rate limiting for API calls
- **ALWAYS** add timeout for API requests (max 30 seconds)
- **ALWAYS** implement retry logic with exponential backoff
- **ALWAYS** handle API errors gracefully

### Rule 3: File Structure
```
codecraft/
├── src/
│   ├── routes/              (TanStack Start pages)
│   ├── server/              (Server functions)
│   ├── components/          (React components)
│   ├── lib/                 (Utilities, helpers)
│   └── styles/              (CSS/Tailwind)
├── convex/                  (Convex backend)
│   ├── schema.ts
│   ├── reviews.ts
│   ├── queries.ts
│   └── mutations.ts
└── .env.local               (Never commit this)
```

### Rule 4: Naming Conventions
- **Files**: kebab-case (`review-card.tsx`, `get-errors.ts`)
- **Functions**: camelCase (`analyzeRepository`, `saveReview`)
- **Components**: PascalCase (`ReviewCard`, `ErrorList`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`ReviewData`, `ErrorItem`)

### Rule 5: When Asking Claude Sonnet 4
- **Always specify:** "This is for the CodeCraft hackathon project"
- **Always include:** File path and what this file does
- **Always ask for:** Full working code, not snippets
- **Always request:** Error handling included
- **Always mention:** "Production-ready code"

---

## API INTEGRATION RULES

### CodeRabbit Integration
```typescript
// ALWAYS include:
- API key validation
- Repository URL validation (format check)
- Request timeout (20 seconds max)
- Retry logic (max 3 attempts)
- Error categorization (invalid repo, rate limit, network error)
- Response type checking

// NEVER:
- Hardcode API keys
- Skip validation
- Send raw repo URLs without sanitizing
- Ignore rate limit responses
```

### Sentry Integration
```typescript
// ALWAYS include:
- Sentry project existence check
- Error filtering (only last 30 days)
- Pagination handling (if 100+ errors)
- Error deduplication
- Timeout for large error lists (15 seconds)

// NEVER:
- Fetch all-time errors (too much data)
- Miss authentication errors
- Assume project exists
- Ignore rate limits
```

### Convex Integration
```typescript
// ALWAYS include:
- User authentication check
- Data validation before saving
- Duplicate prevention
- Real-time subscription setup
- Error callbacks

// NEVER:
- Save data without validation
- Skip user ID checks
- Forget to handle connection errors
- Leave subscriptions uncleanyzed
```

---

## FRONTEND RULES

### Component Development
```typescript
// ALWAYS:
- Use React hooks (useState, useEffect, useContext)
- Add loading states
- Add error boundaries
- Handle empty states
- Show loading spinners during API calls
- Make components responsive

// NEVER:
- Use class components
- Forget to cleanup useEffect
- Leave hardcoded strings (use constants)
- Forget accessibility (alt text, aria labels)
- Make components wider than container
```

### Styling with Tailwind
```css
/* ALWAYS:
- Use Tailwind utility classes only
- Create responsive designs (mobile-first)
- Use consistent spacing (gap-4, p-6, etc.)
- Color-code by severity (red, yellow, green)

NEVER:
- Use custom CSS in component files
- Mix inline styles with Tailwind
- Use px/py hardcoded values
- Forget dark mode support
*/
```

### State Management
```typescript
// ALWAYS:
- Keep state as close to component as possible
- Use Convex for persistent data (not useState)
- Use useState for UI state only (loading, modal open)
- Use Context API for shared state across routes

// NEVER:
- Overuse Context
- Store API responses in multiple places
- Forget to sync with Convex
```

---

## SERVER FUNCTION RULES

### Creating Server Functions
```typescript
// ALWAYS include:
- Input validation with type checking
- Try-catch blocks
- Proper error messages (helpful for frontend)
- Logging of important events
- Request/response typing
- Authentication check

// NEVER:
- Log sensitive data (API keys, tokens)
- Send raw error messages to frontend
- Assume inputs are valid
- Skip timeout handling
```

### Example Structure
```typescript
export const myServerFunction = async (input: MyInput): Promise<MyOutput> => {
  try {
    // Validate input
    if (!input.repoUrl) throw new Error("Repository URL required");
    
    // Execute logic
    const result = await someApi.call(input);
    
    // Return result
    return result;
  } catch (error) {
    console.error("Function error:", error);
    throw new Error("User-friendly error message");
  }
};
```

---

## TESTING & DEBUGGING RULES

### Before Asking Claude
- ✅ Read error messages carefully
- ✅ Check network tab (DevTools) for API calls
- ✅ Verify environment variables are set
- ✅ Check if API keys are valid
- ✅ Test with small data first

### When Asking Claude to Debug
- **Always include:** Full error message
- **Always include:** Code snippet that's failing
- **Always include:** What you expected vs what happened
- **Always include:** Steps to reproduce

### Example Debug Request
```
"I'm getting 'Cannot read property of undefined' error.
Here's my code: [paste code]
Expected: Should display review results
Actually happening: App crashes on line 45
I've verified the API response is valid.
Can you help me fix this?"
```

---

## CONVEX DATABASE RULES

### Schema Design
```typescript
// ALWAYS:
- Define all fields with types
- Use timestamps (createdAt, updatedAt)
- Index fields you'll query by
- Name fields descriptively
- Include userId for user-specific data

// NEVER:
- Use overly nested structures
- Create fields you won't query
- Forget relationships between tables
- Use string when number would work
```

### Queries & Mutations
```typescript
// ALWAYS:
- Add user authentication check
- Validate input parameters
- Return only needed fields (security)
- Use indexes for lookups
- Set pagination for large result sets

// NEVER:
- Return all fields from database
- Skip user ID validation
- Create unbounded queries
- Trust client-sent IDs
```

---

## SECURITY RULES (CRITICAL)

### Authentication
- **NEVER** expose user tokens in frontend code
- **ALWAYS** validate user on every server function
- **ALWAYS** check userId matches authenticated user
- **NEVER** trust client-sent user IDs

### API Keys
- **ALWAYS** store in `.env.local` (never in code)
- **ALWAYS** add to `.gitignore`
- **NEVER** log API keys
- **NEVER** send API keys to frontend
- **ALWAYS** rotate keys if exposed

### Data Validation
- **ALWAYS** validate on server side (client validation is cosmetic)
- **ALWAYS** check URL format before API calls
- **ALWAYS** sanitize string inputs
- **NEVER** execute user input as code

---

## PERFORMANCE RULES

### API Calls
- **Max 3 concurrent requests** (don't overwhelm APIs)
- **Cache results** for 5 minutes (Convex does this)
- **Abort stale requests** if user navigates away
- **Show loading states** (users know something is happening)

### Frontend
- **Keep bundle < 500KB** (gzip)
- **Lazy load heavy components** (e.g., charts)
- **Don't fetch on every keystroke** (use debounce)
- **Clean up subscriptions** in useEffect

### Database
- **Index frequently queried fields**
- **Limit results** (don't fetch 1000 items if showing 10)
- **Batch updates** (don't save one item per request)

---

## GIT COMMIT RULES

### Commit Messages Format
```
[FEATURE/FIX/REFACTOR] Brief description

Optional detailed explanation

Example:
[FEATURE] Add CodeRabbit integration
- Implemented API client
- Added error handling
- Created ReviewCard component
```

### What to Commit
- ✅ Code changes
- ✅ Test files
- ✅ Documentation updates

### What NOT to Commit
- ❌ `.env.local` (add to .gitignore)
- ❌ `node_modules/`
- ❌ `.DS_Store`
- ❌ Console.logs
- ❌ Commented-out code

---

## ASKING CLAUDE SONNET 4 EFFECTIVELY

### Good Request
```
"I'm building CodeCraft. I need a React component for displaying CodeRabbit errors.

Requirements:
- Show error details (file, line, severity)
- Color-code by severity (red=critical, yellow=warning)
- Make it responsive
- Include loading state

File path: src/components/error-list.tsx

Please give me production-ready code with TypeScript and Tailwind CSS."
```

### Bad Request
```
"Make me an error component"
```

### Template for Requests
```
"I'm building CodeCraft [PART X: describe what part].

I need: [what you need]
File path: [where it goes]
Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]

Give me [format: full code, code snippet, explanation]
Include: [error handling, types, comments, etc.]"
```

---

## DEBUGGING WITH CLAUDE

### When Code Doesn't Work
1. **Copy full error message**
2. **Paste the failing code**
3. **Explain what should happen**
4. **Say what you've already tried**
5. **Ask for specific help** (not "fix this")

### Example
```
"CodeCraft - ReviewCard component not rendering errors.

Error: "Cannot read property 'map' of undefined" on line 23

My code: [paste full component]

Expected: Should display list of 5 errors
Actually: Shows undefined error

I've checked:
- API response is valid (logged it)
- Data is being passed as prop
- Component mounts correctly

What's wrong with my code?"
```

---

## FINAL CHECKLIST BEFORE SUBMISSION

- [ ] All environment variables set in `.env.local`
- [ ] No API keys in committed code
- [ ] No console.logs left in production code
- [ ] All functions have error handling
- [ ] TypeScript has no `any` types
- [ ] App works on mobile (responsive)
- [ ] Loading states show while APIs load
- [ ] Error messages are user-friendly
- [ ] Demo works with real GitHub repo
- [ ] Convex backend is deployed
- [ ] Netlify deployment working
- [ ] README has setup instructions
- [ ] Code is committed to GitHub

---

## QUICK REFERENCE COMMANDS

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start Convex dev
npx convex dev

# Deploy to Netlify
netlify deploy

# Check TypeScript errors
npm run typecheck

# Format code
npm run format
```

---

## WHEN TO ASK CLAUDE AGAIN

Ask Claude Sonnet 4 for help when:
- ✅ You get an error you don't understand
- ✅ You need to implement a new feature
- ✅ Performance is slow
- ✅ You're stuck on a bug
- ✅ You need code review before committing

DON'T ask Claude for:
- ❌ Debugging without sharing error message
- ❌ Vague requests ("make it better")
- ❌ Things not related to CodeCraft
- ❌ The same question twice (check previous answers)

---

**GOOD LUCK. YOU'VE GOT THIS. 🚀**