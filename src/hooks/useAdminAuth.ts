import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const { user, getAccessToken, authenticated, ready } = usePrivy();
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkAdminStatus() {
      if (!ready || !authenticated || !user) {
        setAuthState({ isAdmin: false, isLoading: false, error: null });
        return;
      }

      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const accessToken = await getAccessToken();
        
        const response = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify admin status');
        }

        const { isAdmin } = await response.json();
        
        setAuthState({
          isAdmin,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setAuthState({
          isAdmin: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    checkAdminStatus();
  }, [user, authenticated, ready, getAccessToken]);

  return authState;
}
