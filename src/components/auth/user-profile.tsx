'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut, User } from 'lucide-react';

export default function UserProfile() {
  const { user, logout } = usePrivy();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
        <User className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">
          {user.email?.address || user.wallet?.address?.slice(0, 6) + '...' || 'Admin User'}
        </p>
        <p className="text-xs text-slate-500">
          ID: {user.id.slice(0, 8)}...
        </p>
      </div>
      <button
        onClick={logout}
        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        title="Sign Out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
