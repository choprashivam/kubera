import { useCallback } from 'react';
import { signOut } from 'next-auth/react';

export const useSignOut = () => {
  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      // You can add any additional cleanup logic here if needed
    } catch (error) {
      console.error('Error signing out:', error);
      throw error; // Rethrow the error so it can be caught in the component
    }
  }, []);

  return { handleSignOut };
};