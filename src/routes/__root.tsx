import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { ClerkProvider, UserButton, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">CodeCraft</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <>
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/signin"
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/signin">
                    <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
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