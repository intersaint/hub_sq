'use client';

import { useState } from 'react';
import Image from 'next/image';
import AdminDashboard from '@/components/admin-dashboard';
import SecureAuthGuard from '@/components/auth/secure-auth-guard';
import UserProfile from '@/components/auth/user-profile';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';

// User ID is now securely validated server-side

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
    { name: 'Users', icon: Users, key: 'users' as const },
    { name: 'Settings', icon: Settings, key: 'settings' as const },
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
            <p className="text-slate-400">User management interface coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
            <p className="text-slate-400">Settings interface coming soon...</p>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <SecureAuthGuard>
      <div className="min-h-screen bg-slate-900 text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Image
                  src="https://www.stream.quest/assets/logo-D1a0BalI.png"
                  width={24}
                  height={24}
                  alt="StreamQuest Logo"
                  className="rounded"
                />
                <span className="text-lg font-bold">Admin Panel</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCurrentPage(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.key
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-800/50 backdrop-blur-xl border-r border-slate-700">
          <div className="flex h-16 items-center px-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Image
                src="https://www.stream.quest/assets/logo-D1a0BalI.png"
                width={24}
                height={24}
                alt="StreamQuest Logo"
                className="rounded"
              />
              <span className="text-lg font-bold">Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="p-2.5 text-slate-400 lg:hidden hover:bg-slate-700 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-lg font-semibold text-white capitalize">
                {currentPage === 'dashboard' ? 'Dashboard Overview' : currentPage.replace('-', ' ')}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
      </div>
    </SecureAuthGuard>
  );
}
