import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'

const SignInPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: '/' })
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

  // Don't render anything if user is signed in (will redirect)
  if (isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">CodeCraft</h1>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="flex justify-center">
            {mode === 'signin' ? (
              <SignIn 
                routing="virtual"
                signUpUrl="/signin"
                afterSignInUrl="/"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border-none bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsIconButton: "border border-gray-300 hover:bg-gray-50",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-medium",
                    footerActionLink: "text-blue-600 hover:text-blue-500"
                  }
                }}
              />
            ) : (
              <SignUp 
                routing="virtual"
                signInUrl="/signin"
                afterSignUpUrl="/"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border-none bg-transparent", 
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsIconButton: "border border-gray-300 hover:bg-gray-50",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-medium",
                    footerActionLink: "text-blue-600 hover:text-blue-500"
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Benefits section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Why CodeCraft?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <p className="ml-3 text-sm text-gray-600">
                <span className="font-medium text-gray-900">AI-Powered Reviews:</span> Get intelligent code reviews with CodeRabbit integration
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <p className="ml-3 text-sm text-gray-600">
                <span className="font-medium text-gray-900">Error Tracking:</span> Monitor and track errors in real-time with Sentry
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <p className="ml-3 text-sm text-gray-600">
                <span className="font-medium text-gray-900">Dashboard Insights:</span> Get comprehensive analytics and metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create route without path parameter - TanStack Router auto-detects from filename
export const Route = createFileRoute('/signin')({
  component: SignInPage,
})