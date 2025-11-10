# CodeCraft 🚀

CodeCraft is a powerful web application that analyzes GitHub repositories and provides real-time insights about code quality, errors, and reviews. Built with modern React, TypeScript, Convex, and Clerk authentication.

![CodeCraft Logo](public/vite.svg)

## 🌟 Features

- **GitHub Repository Analysis**: Analyze any public GitHub repository for code quality issues
- **Real-time Error Tracking**: Integration with Sentry and other error tracking services
- **Code Review Integration**: Connect with CodeRabbit for automated code reviews
- **Real-time Updates**: Live data updates using Convex real-time database
- **User Authentication**: Secure authentication powered by Clerk
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Built with TypeScript for better developer experience

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: TanStack Router
- **Backend**: Convex (Real-time database & serverless functions)
- **Authentication**: Clerk
- **Build Tool**: Vite
- **Deployment**: Netlify

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Shyam-Raghuwanshi/codecraft.git
cd codecraft
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys:

```bash
# Convex Backend
CONVEX_DEPLOYMENT=your_convex_deployment_url
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key

# Application Configuration
VITE_APP_NAME=CodeCraft
VITE_APP_VERSION=1.0.0
```

### 4. Set Up Convex Database

```bash
npm run convex:dev
```

This will:
- Create a new Convex project (if needed)
- Set up the database schema
- Start the Convex development server

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔑 Getting API Keys

### Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Choose your preferred sign-in methods (Email, GitHub, etc.)
4. Copy the **Publishable Key** from the API Keys section
5. Add it to your `.env.local` as `VITE_CLERK_PUBLISHABLE_KEY`

**Clerk Setup Steps:**
- Enable sign-in methods: Email + GitHub (recommended)
- Configure redirect URLs:
  - Sign-in: `http://localhost:5173/signin`
  - Sign-up: `http://localhost:5173/signup`
  - After sign-in: `http://localhost:5173/`

### Convex Database

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a new project
3. Run `npx convex deploy` to deploy your schema
4. Copy the deployment URL and add it to `.env.local`

**Convex Setup Steps:**
- Run `npx convex dev` for development
- Run `npx convex deploy` for production deployment
- Schema is automatically synced from `convex/schema.ts`

### Optional: External API Integrations

For advanced features, you may want to add:

- **CodeRabbit API**: For automated code reviews
- **Sentry API**: For error tracking integration
- **GitHub API**: For repository metadata

## 📁 Project Structure

```
codecraft/
├── src/
│   ├── routes/              # TanStack Router pages
│   │   ├── index.tsx        # Home page
│   │   ├── repo.tsx         # Repository analysis
│   │   ├── signin.tsx       # Authentication
│   │   └── __root.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── Badge.tsx
│   │   ├── ErrorCard.tsx
│   │   ├── ReviewCard.tsx
│   │   └── StatCard.tsx
│   ├── lib/                 # Utilities & helpers
│   │   ├── convex-hooks.ts  # Convex React hooks
│   │   ├── convex-provider.tsx
│   │   └── icons.tsx
│   └── styles/              # CSS & styling
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema
│   ├── functions.ts         # Server functions
│   └── _generated/          # Auto-generated files
├── public/                  # Static assets
└── .env.local              # Environment variables
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run convex:dev       # Start Convex development

# Build & Deploy
npm run build            # Build for production
npm run deploy           # Build + Deploy Convex
npm run convex:deploy    # Deploy Convex only

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Check TypeScript
npm run format           # Format code with Prettier

# Preview
npm run preview          # Preview production build
```

## 🚀 Deployment

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy Convex backend:**
   ```bash
   npm run convex:deploy
   ```

3. **Update environment variables:**
   - Update `CONVEX_DEPLOYMENT` with your production deployment URL
   - Update `VITE_CONVEX_URL` with your production Convex URL

4. **Deploy to Netlify:**
   
   **Option A: Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

   **Option B: Git Integration**
   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

5. **Configure Clerk redirect URLs:**
   - Update Clerk dashboard with your production URLs
   - Add your Netlify domain to allowed origins

### Environment Variables for Production

In your Netlify dashboard, add these environment variables:

```
CONVEX_DEPLOYMENT=prod:your-production-deployment
VITE_CONVEX_URL=https://your-production.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_key
VITE_APP_NAME=CodeCraft
VITE_APP_VERSION=1.0.0
```

## 🔍 How It Works

1. **Authentication**: Users sign in via Clerk
2. **Repository Input**: Users enter a GitHub repository URL
3. **Analysis**: Backend functions analyze the repository
4. **Real-time Updates**: Results stream live via Convex
5. **Visualization**: Data displayed in responsive components

## 🔒 Security Features

- ✅ API keys stored in environment variables only
- ✅ User authentication required for all actions
- ✅ Input validation on all forms
- ✅ Rate limiting on API calls
- ✅ Secure error handling (no sensitive data exposure)

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Convex connection issues:**
```bash
npx convex dev --once
# Then restart your dev server
```

**Clerk authentication errors:**
- Check your publishable key is correct
- Verify redirect URLs in Clerk dashboard
- Make sure you're using the right environment (dev/prod)

**Build errors:**
```bash
npm run typecheck  # Check for TypeScript errors
npm run lint       # Check for linting issues
```

### Getting Help

- Check the browser console for errors
- Look at the Network tab for failed API calls
- Verify all environment variables are set correctly
- Check Convex dashboard for backend errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Use TypeScript (no `any` types)
- Follow the rules in `rules.md`
- Add error handling to all functions
- Write responsive components
- Include loading states

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shyam Raghuwanshi**
- GitHub: [@Shyam-Raghuwanshi](https://github.com/Shyam-Raghuwanshi)
- LinkedIn: [shyam-raghuwanshi](https://linkedin.com/in/shyam-raghuwanshi)

## 🙏 Acknowledgments

- [Convex](https://convex.dev/) for the amazing real-time database
- [Clerk](https://clerk.dev/) for seamless authentication
- [Vite](https://vitejs.dev/) for blazing fast development
- [TanStack Router](https://tanstack.com/router) for type-safe routing

---

**Happy Coding! 🎉**

If you found this project helpful, please ⭐ star it on GitHub!
