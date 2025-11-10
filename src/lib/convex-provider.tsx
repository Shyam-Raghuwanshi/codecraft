/**
 * Convex Provider Setup for Real-time Data
 * CodeCraft - Hackathon Project
 * 
 * This file sets up the Convex client and provider for real-time subscriptions
 * Follow the rules: Always include error handling, proper authentication checks
 */

import type { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';

// Initialize Convex client with environment variables
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

interface ConvexWrapperProps {
  children: ReactNode;
}

/**
 * Main Convex Provider Wrapper
 * Handles authentication with Clerk and provides Convex context
 */
export function ConvexWrapper({ children }: ConvexWrapperProps) {
  // Get Clerk publishable key from environment
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey) {
    console.error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 text-sm">
            Please check your environment variables and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

/**
 * Hook to get Convex client instance
 * Use this for direct database operations when needed
 */
export function useConvexClient() {
  return convex;
}

export default ConvexWrapper;