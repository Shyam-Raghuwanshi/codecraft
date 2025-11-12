/**
 * UserSync Component - Automatically sync Clerk user to Convex database
 * CodeCraft - Dynamic Functionality
 * 
 * This component handles user synchronization between Clerk and Convex
 * when users sign in for the first time
 */

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function UserSync() {
  const { isSignedIn, userId } = useAuth();
  const { user, isLoaded } = useUser();
  const saveUser = useMutation(api.functions.saveUserReview);

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && isLoaded && user && userId) {
        try {
          await saveUser({
            clerkId: userId,
            email: user.primaryEmailAddress?.emailAddress || '',
          });
          console.log('User synced to Convex database');
        } catch (error) {
          console.error('Failed to sync user to database:', error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, isLoaded, user, userId, saveUser]);

  // This component doesn't render anything
  return null;
}

export default UserSync;