/**
 * Mock data for CodeCraft - GitHub repositories, CodeRabbit reviews, and Sentry errors
 * Following CodeCraft rules: TypeScript types, error handling, realistic data
 */

// Types for our mock data
export interface MockRepository {
  id: string
  name: string
  owner: string
  url: string
  language: string
  stars: number
  description: string
  lastUpdated: string
  isPrivate: boolean
  defaultBranch: string
}

export interface CodeRabbitReview {
  reviewId: string
  repoName: string
  fileName: string
  issueType: 'bug' | 'style' | 'performance' | 'security' | 'maintainability'
  severity: 'high' | 'medium' | 'low'
  line: number
  message: string
  suggestion: string
  codeSnippet: string
  createdAt: string
  status: 'open' | 'resolved' | 'dismissed'
}

export interface SentryError {
  errorId: string
  repoName: string
  errorMessage: string
  errorType: string
  severity: 'fatal' | 'error' | 'warning' | 'info'
  occurredAt: string
  affectedUsers: number
  totalOccurrences: number
  stackTrace: string
  environment: 'production' | 'staging' | 'development'
  browser?: string
  os?: string
  url: string
}

export interface MockMetrics {
  repoName: string
  totalIssues: number
  criticalBugs: number
  securityVulnerabilities: number
  codeQualityScore: number
  testCoverage: number
  technicalDebt: number
  lastScanDate: string
  trends: {
    issuesResolved: number
    newIssuesFound: number
    performanceImprovement: number
  }
}

// Legacy interfaces for backward compatibility
export interface MockCodeRabbitIssue {
  id: string
  file: string
  line: number
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  category: 'security' | 'performance' | 'code-style' | 'bug' | 'maintainability'
}

export interface MockSentryError {
  id: string
  title: string
  count: number
  lastSeen: string
  status: 'resolved' | 'unresolved'
  level: 'error' | 'warning' | 'info'
  stackTrace?: string
  url?: string
  userAgent?: string
  tags: Record<string, string>
}

// Mock GitHub Repositories
const mockRepositories: MockRepository[] = [
  {
    id: "1",
    name: "e-commerce-platform",
    owner: "techcorp",
    url: "https://github.com/techcorp/e-commerce-platform",
    language: "TypeScript",
    stars: 1247,
    description: "Modern e-commerce platform built with React, Node.js, and PostgreSQL",
    lastUpdated: "2024-11-09T14:30:00Z",
    isPrivate: false,
    defaultBranch: "main"
  },
  {
    id: "2",
    name: "analytics-dashboard",
    owner: "datateam",
    url: "https://github.com/datateam/analytics-dashboard",
    language: "Python",
    stars: 892,
    description: "Real-time analytics dashboard with machine learning insights",
    lastUpdated: "2024-11-08T09:15:00Z",
    isPrivate: false,
    defaultBranch: "main"
  },
  {
    id: "3",
    name: "mobile-banking-app",
    owner: "fintech-solutions",
    url: "https://github.com/fintech-solutions/mobile-banking-app",
    language: "React Native",
    stars: 2103,
    description: "Secure mobile banking application with biometric authentication",
    lastUpdated: "2024-11-10T11:45:00Z",
    isPrivate: true,
    defaultBranch: "develop"
  },
  {
    id: "4",
    name: "microservices-api",
    owner: "cloudnative",
    url: "https://github.com/cloudnative/microservices-api",
    language: "Java",
    stars: 756,
    description: "Microservices architecture with Spring Boot and Docker",
    lastUpdated: "2024-11-07T16:20:00Z",
    isPrivate: false,
    defaultBranch: "master"
  },
  {
    id: "5",
    name: "ai-chatbot-platform",
    owner: "ailab",
    url: "https://github.com/ailab/ai-chatbot-platform",
    language: "Python",
    stars: 3421,
    description: "AI-powered chatbot platform with natural language processing",
    lastUpdated: "2024-11-10T08:30:00Z",
    isPrivate: false,
    defaultBranch: "main"
  }
]

// Mock CodeRabbit Reviews
const mockCodeRabbitReviews: CodeRabbitReview[] = [
  // E-commerce Platform Reviews
  {
    reviewId: "cr-001",
    repoName: "e-commerce-platform",
    fileName: "src/components/PaymentForm.tsx",
    issueType: "security",
    severity: "high",
    line: 45,
    message: "Potential security vulnerability: Credit card data transmitted without encryption",
    suggestion: "Implement client-side encryption before transmitting sensitive payment data. Consider using a secure payment processor like Stripe Elements.",
    codeSnippet: `const submitPayment = async (cardData: CardData) => {
  // ❌ Insecure: sending raw card data
  const response = await fetch('/api/payment', {
    method: 'POST',
    body: JSON.stringify(cardData)
  });
};`,
    createdAt: "2024-11-09T10:15:00Z",
    status: "open"
  },
  {
    reviewId: "cr-002",
    repoName: "e-commerce-platform",
    fileName: "src/utils/validation.ts",
    issueType: "bug",
    severity: "medium",
    line: 23,
    message: "Email validation regex allows invalid email formats",
    suggestion: "Use a more robust email validation pattern or a dedicated email validation library like validator.js",
    codeSnippet: `// ❌ Weak email validation
const isValidEmail = (email: string) => {
  return /^[^@]+@[^@]+$/.test(email);
};`,
    createdAt: "2024-11-09T09:30:00Z",
    status: "resolved"
  },
  {
    reviewId: "cr-003",
    repoName: "e-commerce-platform",
    fileName: "src/pages/ProductList.tsx",
    issueType: "performance",
    severity: "medium",
    line: 67,
    message: "Inefficient re-rendering: Component re-renders on every prop change",
    suggestion: "Wrap component with React.memo() and use useMemo() for expensive calculations",
    codeSnippet: `const ProductList = ({ products, filters }) => {
  // ❌ Expensive calculation on every render
  const filteredProducts = products.filter(p => 
    filters.category === 'all' || p.category === filters.category
  );
  return <div>{/* render products */}</div>;
};`,
    createdAt: "2024-11-08T14:45:00Z",
    status: "open"
  },
  
  // Analytics Dashboard Reviews
  {
    reviewId: "cr-004",
    repoName: "analytics-dashboard",
    fileName: "src/data/database.py",
    issueType: "security",
    severity: "high",
    line: 89,
    message: "SQL injection vulnerability: User input not sanitized",
    suggestion: "Use parameterized queries or ORM to prevent SQL injection attacks",
    codeSnippet: `def get_user_data(user_id):
    # ❌ Vulnerable to SQL injection
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query)`,
    createdAt: "2024-11-08T11:20:00Z",
    status: "open"
  },
  {
    reviewId: "cr-005",
    repoName: "analytics-dashboard",
    fileName: "src/visualizations/charts.py",
    issueType: "performance",
    severity: "low",
    line: 156,
    message: "Memory inefficient: Large datasets loaded entirely into memory",
    suggestion: "Implement pagination or streaming for large datasets to reduce memory usage",
    codeSnippet: `def generate_chart_data():
    # ❌ Loading entire dataset into memory
    all_data = pd.read_sql("SELECT * FROM analytics_data", conn)
    return process_data(all_data)`,
    createdAt: "2024-11-07T16:10:00Z",
    status: "dismissed"
  },
  
  // Mobile Banking App Reviews
  {
    reviewId: "cr-006",
    repoName: "mobile-banking-app",
    fileName: "src/auth/BiometricAuth.ts",
    issueType: "security",
    severity: "high",
    line: 78,
    message: "Insecure biometric data storage",
    suggestion: "Store biometric templates in secure hardware enclave or use platform-specific secure storage APIs",
    codeSnippet: `// ❌ Insecure storage of biometric data
const storeBiometricTemplate = (template: string) => {
  localStorage.setItem('biometric_template', template);
};`,
    createdAt: "2024-11-10T09:25:00Z",
    status: "open"
  },
  
  // Microservices API Reviews
  {
    reviewId: "cr-007",
    repoName: "microservices-api",
    fileName: "src/main/java/UserController.java",
    issueType: "bug",
    severity: "medium",
    line: 134,
    message: "Null pointer exception possible when accessing user data",
    suggestion: "Add null checks or use Optional<> to handle potential null values safely",
    codeSnippet: `@GetMapping("/user/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findById(id);
    // ❌ No null check - potential NPE
    return ResponseEntity.ok(user.getProfile());
}`,
    createdAt: "2024-11-07T13:40:00Z",
    status: "resolved"
  },
  
  // AI Chatbot Platform Reviews
  {
    reviewId: "cr-008",
    repoName: "ai-chatbot-platform",
    fileName: "src/nlp/text_processor.py",
    issueType: "performance",
    severity: "high",
    line: 203,
    message: "Blocking I/O operations in async function",
    suggestion: "Use async/await patterns with aiohttp or asyncio for non-blocking operations",
    codeSnippet: `async def process_text(text: str):
    # ❌ Blocking operation in async function
    response = requests.post('http://api.nlp.com/process', json={'text': text})
    return response.json()`,
    createdAt: "2024-11-10T07:15:00Z",
    status: "open"
  }
]

// Mock Sentry Errors
const mockSentryErrors: SentryError[] = [
  // E-commerce Platform Errors
  {
    errorId: "sentry-001",
    repoName: "e-commerce-platform",
    errorMessage: "TypeError: Cannot read property 'map' of undefined",
    errorType: "TypeError",
    severity: "error",
    occurredAt: "2024-11-09T15:30:22Z",
    affectedUsers: 47,
    totalOccurrences: 123,
    environment: "production",
    browser: "Chrome 119.0",
    os: "Windows 10",
    url: "/products/category/electronics",
    stackTrace: `TypeError: Cannot read property 'map' of undefined
    at ProductList.render (ProductList.tsx:45:23)
    at finishClassComponent (react-dom.production.min.js:14:20)
    at updateClassComponent (react-dom.production.min.js:17:31)`
  },
  {
    errorId: "sentry-002",
    repoName: "e-commerce-platform",
    errorMessage: "Payment processing failed: Card declined",
    errorType: "PaymentError",
    severity: "warning",
    occurredAt: "2024-11-09T14:15:11Z",
    affectedUsers: 12,
    totalOccurrences: 34,
    environment: "production",
    browser: "Safari 17.1",
    os: "macOS 14.0",
    url: "/checkout/payment",
    stackTrace: `PaymentError: Card declined
    at processPayment (PaymentService.ts:67:12)
    at StripePaymentHandler.charge (StripeHandler.ts:23:8)
    at PaymentForm.handleSubmit (PaymentForm.tsx:89:15)`
  },
  {
    errorId: "sentry-003",
    repoName: "e-commerce-platform",
    errorMessage: "Network Error: Failed to fetch product data",
    errorType: "NetworkError",
    severity: "error",
    occurredAt: "2024-11-09T13:45:33Z",
    affectedUsers: 89,
    totalOccurrences: 267,
    environment: "production",
    browser: "Firefox 119.0",
    os: "Ubuntu 22.04",
    url: "/api/products",
    stackTrace: `NetworkError: Failed to fetch
    at fetch (native)
    at ApiClient.get (ApiClient.ts:45:12)
    at ProductService.getProducts (ProductService.ts:28:19)`
  },
  
  // Analytics Dashboard Errors
  {
    errorId: "sentry-004",
    repoName: "analytics-dashboard",
    errorMessage: "MemoryError: Unable to allocate array with shape (1000000, 1000)",
    errorType: "MemoryError",
    severity: "fatal",
    occurredAt: "2024-11-08T16:20:45Z",
    affectedUsers: 5,
    totalOccurrences: 8,
    environment: "production",
    url: "/dashboard/reports/large-dataset",
    stackTrace: `MemoryError: Unable to allocate 7.45 GiB for an array with shape (1000000, 1000) and data type float64
    at numpy.core._exceptions.MemoryError
    at pandas.DataFrame.__init__ (pandas/core/frame.py:636)
    at generate_report (reports.py:145)`
  },
  {
    errorId: "sentry-005",
    repoName: "analytics-dashboard",
    errorMessage: "ValueError: could not convert string to float: 'N/A'",
    errorType: "ValueError",
    severity: "error",
    occurredAt: "2024-11-08T12:10:17Z",
    affectedUsers: 23,
    totalOccurrences: 56,
    environment: "production",
    url: "/api/metrics/conversion-rate",
    stackTrace: `ValueError: could not convert string to float: 'N/A'
    at float() builtin
    at calculate_metrics (metrics.py:89)
    at MetricsProcessor.process (processor.py:34)`
  },
  
  // Mobile Banking App Errors
  {
    errorId: "sentry-006",
    repoName: "mobile-banking-app",
    errorMessage: "SecurityError: Biometric authentication failed",
    errorType: "SecurityError",
    severity: "warning",
    occurredAt: "2024-11-10T10:35:28Z",
    affectedUsers: 156,
    totalOccurrences: 423,
    environment: "production",
    os: "iOS 17.1",
    url: "/auth/biometric",
    stackTrace: `SecurityError: Biometric authentication failed
    at BiometricAuth.authenticate (BiometricAuth.ts:45)
    at LoginScreen.handleBiometricLogin (LoginScreen.tsx:78)
    at TouchableOpacity.onPress (react-native:2847)`
  },
  
  // Microservices API Errors
  {
    errorId: "sentry-007",
    repoName: "microservices-api",
    errorMessage: "NullPointerException: User not found",
    errorType: "NullPointerException", 
    severity: "error",
    occurredAt: "2024-11-07T18:22:14Z",
    affectedUsers: 31,
    totalOccurrences: 78,
    environment: "production",
    url: "/api/v1/users/profile",
    stackTrace: `java.lang.NullPointerException: User not found
    at UserService.getUserProfile(UserService.java:67)
    at UserController.getProfile(UserController.java:134)
    at java.base/java.lang.reflect.Method.invoke(Method.java:568)`
  },
  
  // AI Chatbot Platform Errors
  {
    errorId: "sentry-008",
    repoName: "ai-chatbot-platform",
    errorMessage: "TimeoutError: NLP processing timeout after 30 seconds",
    errorType: "TimeoutError",
    severity: "error",
    occurredAt: "2024-11-10T09:45:52Z",
    affectedUsers: 67,
    totalOccurrences: 134,
    environment: "production",
    url: "/api/chat/process",
    stackTrace: `TimeoutError: NLP processing timeout after 30 seconds
    at asyncio.wait_for (asyncio/tasks.py:442)
    at NLPProcessor.process_text (nlp_processor.py:203)
    at ChatHandler.handle_message (chat_handler.py:89)`
  }
]

/**
 * Get all mock repositories
 * @returns Array of mock repository data
 */
export const getMockRepos = (): MockRepository[] => {
  try {
    return mockRepositories
  } catch (error) {
    console.error('Error fetching mock repositories:', error)
    return []
  }
}

/**
 * Get CodeRabbit reviews for a specific repository
 * @param repoName - Name of the repository
 * @returns Array of CodeRabbit reviews for the repository
 */
export const getMockCodeRabbitReviews = (repoName: string): CodeRabbitReview[] => {
  try {
    if (!repoName) {
      throw new Error('Repository name is required')
    }
    
    return mockCodeRabbitReviews.filter(review => 
      review.repoName.toLowerCase() === repoName.toLowerCase()
    )
  } catch (error) {
    console.error(`Error fetching CodeRabbit reviews for ${repoName}:`, error)
    return []
  }
}

/**
 * Get Sentry errors for a specific repository
 * @param repoName - Name of the repository
 * @returns Array of Sentry errors for the repository
 */
export const getMockSentryErrors = (repoName: string): SentryError[] => {
  try {
    if (!repoName) {
      throw new Error('Repository name is required')
    }
    
    return mockSentryErrors.filter(error => 
      error.repoName.toLowerCase() === repoName.toLowerCase()
    )
  } catch (error) {
    console.error(`Error fetching Sentry errors for ${repoName}:`, error)
    return []
  }
}

/**
 * Generate mock metrics for a repository
 * @param repoName - Name of the repository
 * @returns Mock metrics data for the repository
 */
export const generateMockMetrics = (repoName: string): MockMetrics => {
  try {
    if (!repoName) {
      throw new Error('Repository name is required')
    }
    
    const reviews = getMockCodeRabbitReviews(repoName)
    const errors = getMockSentryErrors(repoName)
    
    // Calculate metrics based on mock data
    const totalIssues = reviews.length + errors.filter(e => e.severity === 'error' || e.severity === 'fatal').length
    const criticalBugs = reviews.filter(r => r.severity === 'high' && r.issueType === 'bug').length +
                        errors.filter(e => e.severity === 'fatal').length
    const securityVulnerabilities = reviews.filter(r => r.issueType === 'security').length
    
    // Generate realistic metrics with some randomization
    const baseScore = Math.max(0, 100 - (totalIssues * 5) - (criticalBugs * 10))
    const codeQualityScore = Math.min(100, baseScore + (Math.random() * 20 - 10))
    
    return {
      repoName,
      totalIssues,
      criticalBugs,
      securityVulnerabilities,
      codeQualityScore: Math.round(codeQualityScore),
      testCoverage: Math.round(60 + Math.random() * 35), // 60-95%
      technicalDebt: Math.round(totalIssues * 0.5 + Math.random() * 10), // hours
      lastScanDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      trends: {
        issuesResolved: Math.round(Math.random() * 15 + 5), // 5-20
        newIssuesFound: Math.round(Math.random() * 10 + 2), // 2-12
        performanceImprovement: Math.round(Math.random() * 20 + 5) // 5-25%
      }
    }
  } catch (error) {
    console.error(`Error generating metrics for ${repoName}:`, error)
    
    // Return default metrics on error
    return {
      repoName: repoName || 'unknown',
      totalIssues: 0,
      criticalBugs: 0,
      securityVulnerabilities: 0,
      codeQualityScore: 85,
      testCoverage: 75,
      technicalDebt: 5,
      lastScanDate: new Date().toISOString(),
      trends: {
        issuesResolved: 10,
        newIssuesFound: 3,
        performanceImprovement: 15
      }
    }
  }
}

/**
 * Get a specific repository by name
 * @param repoName - Name of the repository
 * @returns Repository data or undefined if not found
 */
export const getMockRepoByName = (repoName: string): MockRepository | undefined => {
  try {
    if (!repoName) {
      throw new Error('Repository name is required')
    }
    
    return mockRepositories.find(repo => 
      repo.name.toLowerCase() === repoName.toLowerCase()
    )
  } catch (error) {
    console.error(`Error fetching repository ${repoName}:`, error)
    return undefined
  }
}

/**
 * Get recent activity across all repositories
 * @returns Array of recent reviews and errors combined
 */
export const getRecentActivity = () => {
  try {
    const recentReviews = mockCodeRabbitReviews
      .filter(review => review.status === 'open')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(review => ({ ...review, type: 'review' as const }))
    
    const recentErrors = mockSentryErrors
      .filter(error => error.severity === 'error' || error.severity === 'fatal')
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 5)
      .map(error => ({ ...error, type: 'error' as const }))
    
    return [...recentReviews, ...recentErrors]
      .sort((a, b) => {
        const dateA = new Date('type' in a && a.type === 'review' ? a.createdAt : a.occurredAt)
        const dateB = new Date('type' in b && b.type === 'review' ? b.createdAt : b.occurredAt)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 10)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

// Legacy compatibility functions
export const mockCodeRabbitIssues: MockCodeRabbitIssue[] = [
  {
    id: '1',
    file: 'src/components/UserProfile.tsx',
    line: 45,
    severity: 'high',
    message: 'Potential XSS vulnerability: User input rendered without sanitization',
    suggestion: 'Use DOMPurify.sanitize() or React\'s built-in escaping mechanisms before rendering user-generated content',
    category: 'security'
  },
  {
    id: '2',
    file: 'src/utils/api.ts',
    line: 23,
    severity: 'high',
    message: 'API key exposed in client-side code',
    suggestion: 'Move API keys to environment variables and access them only from server-side code',
    category: 'security'
  },
  {
    id: '3',
    file: 'src/hooks/useAuth.ts',
    line: 67,
    severity: 'medium',
    message: 'Missing error handling for authentication API call',
    suggestion: 'Add try-catch block and provide user-friendly error messages for failed authentication attempts',
    category: 'bug'
  }
]

// Legacy Sentry errors for backward compatibility
export const mockSentryErrors_Legacy: MockSentryError[] = [
  {
    id: '1',
    title: 'TypeError: Cannot read property \'map\' of undefined',
    count: 47,
    lastSeen: '2024-11-10T14:30:22.123Z',
    status: 'unresolved',
    level: 'error',
    url: '/dashboard',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    stackTrace: `TypeError: Cannot read property 'map' of undefined
    at Dashboard.render (Dashboard.tsx:45:23)
    at React.createElement (react.js:123:45)
    at App.render (App.tsx:67:89)`,
    tags: {
      environment: 'production',
      release: '1.2.3',
      user_id: 'user_123',
      component: 'Dashboard'
    }
  }
]

// Legacy compatibility functions
export const getMockIssuesByRepo = (_repoUrl: string): MockCodeRabbitIssue[] => {
  // For backward compatibility, return legacy format
  return mockCodeRabbitIssues
}

export const getMockErrorsByRepo = (_repoUrl: string): MockSentryError[] => {
  // For backward compatibility, return legacy format
  return mockSentryErrors_Legacy
}

export const getMockRepoByUrl = (url: string): MockRepository | undefined => {
  return mockRepositories.find(repo => repo.url === url)
}

export const getMockDashboardStats = () => {
  const reviews = mockCodeRabbitReviews
  const errors = mockSentryErrors
  
  const totalIssues = reviews.length + errors.filter(e => e.severity === 'error' || e.severity === 'fatal').length
  const totalErrors = errors.length
  const resolvedErrors = errors.filter(error => error.severity === 'warning' || error.severity === 'info').length

  return {
    totalRepos: mockRepositories.length,
    totalIssues,
    totalErrors,
    resolvedErrors,
    criticalIssues: reviews.filter(review => review.severity === 'high').length,
    warningIssues: reviews.filter(review => review.severity === 'medium').length,
    infoIssues: reviews.filter(review => review.severity === 'low').length
  }
}

// API simulation functions with realistic delays
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const simulateCodeRabbitAnalysis = async (repoUrl: string): Promise<MockCodeRabbitIssue[]> => {
  await simulateApiDelay(2000) // Simulate API call delay
  return getMockIssuesByRepo(repoUrl)
}

export const simulateSentryErrorFetch = async (repoUrl: string): Promise<MockSentryError[]> => {
  await simulateApiDelay(1500) // Simulate API call delay
  return getMockErrorsByRepo(repoUrl)
}

// Default export for backward compatibility
export default {
  mockCodeRabbitIssues,
  mockSentryErrors: mockSentryErrors_Legacy,
  mockRepositories,
  getMockIssuesByRepo,
  getMockErrorsByRepo,
  getMockRepoByUrl,
  getMockDashboardStats,
  simulateCodeRabbitAnalysis,
  simulateSentryErrorFetch
}