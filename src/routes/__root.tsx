import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { ClerkProvider, UserButton, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { HomeIcon, UserIcon } from '../lib/icons'
import '../styles/globals.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function AuthenticatedApp() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  
  // Redirect unauthenticated users to signin page
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const currentPath = window.location.pathname
      // Don't redirect if already on signin page
      if (currentPath !== '/signin') {
        navigate({ to: '/signin' })
      }
    }
  }, [isLoaded, isSignedIn, navigate])
  
  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="loading-spinner w-12 h-12"></div>
          <div className="text-slate-300 text-sm">Loading CodeCraft...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Navigation */}
      <nav className="glass-strong border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="heading-1 text-xl">CodeCraft</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              {isSignedIn ? (
                <>
                  <Link 
                    to="/" 
                    className="nav-link flex items-center gap-2"
                    activeProps={{
                      className: "nav-link-active"
                    }}
                  >
                    <HomeIcon size="sm" />
                    Dashboard
                  </Link>
                  
                  <div className="relative">
                    <UserButton 
                      afterSignOutUrl="/signin"
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8 ring-2 ring-blue-500/30 hover:ring-blue-400 transition-all",
                          userButtonPopoverCard: "bg-slate-800 border-slate-700",
                          userButtonPopoverFooter: "bg-slate-800",
                          userButtonPopoverActionButton: "text-slate-200 hover:bg-slate-700"
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <button className="btn btn-primary btn-md">
                      <UserIcon size="sm" />
                      Sign In
                    </button>
                  </Link>
                  <Link to="/signin">
                    <button className="btn btn-secondary btn-md">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-slate-400 text-sm">
                © 2024 CodeCraft. Built with 💙 for developers.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                About
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                Documentation
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthenticatedApp />
    </ClerkProvider>
  )
})