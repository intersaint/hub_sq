'use client';

import { usePrivy } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { Shield, LogIn, Loader2 } from 'lucide-react';

const ALLOWED_ADMIN_IDS = [
  'did:privy:cmfmv71p900e4le0brzlpo7xu',
];

interface SecureAuthGuardProps {
  children: ReactNode;
}

export default function SecureAuthGuard({ children }: SecureAuthGuardProps) {
  const { ready, authenticated, login, user } = usePrivy();

  // Check if user is admin directly using Privy's authenticated user data
  const isAdmin = user && ALLOWED_ADMIN_IDS.includes(user.id);

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-400">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-indigo-500 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
            <p className="text-slate-400 mb-8">
              Please authenticate to access the admin dashboard.
            </p>
            <button
              onClick={login}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin privileges (server-verified)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-red-500 mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 mb-8">
              You are not authorized to access this admin dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Try Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized (server-verified)
  return <>{children}</>;
}
