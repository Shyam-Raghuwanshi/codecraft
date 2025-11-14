/**
 * UserSync Component - Automatically sync Clerk user to Convex database
 * CodeCraft - Dynamic Functionality
 * 
 * This component handles user synchronization between Clerk and Convex
 * when users sign in for the first time
 */

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function UserSync() {
  const { isSignedIn, userId } = useAuth();
  const { user, isLoaded } = useUser();
  const saveUser = useMutation(api.functions.saveUserReview);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      // Only sync once per session and when all conditions are met
      if (
        isSignedIn && 
        isLoaded && 
        user && 
        userId && 
        !hasSyncedRef.current
      ) {
        try {
          hasSyncedRef.current = true; // Mark as synced before the call
          await saveUser({
            clerkId: userId,
            email: user.primaryEmailAddress?.emailAddress || '',
          });
          console.log('User synced to Convex database');
        } catch (error) {
          console.error('Failed to sync user to database:', error);
          hasSyncedRef.current = false; // Reset on error to allow retry
        }
      }
    };

    syncUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, user, userId]);

  // This component doesn't render anything
  return null;
}

export default UserSync;