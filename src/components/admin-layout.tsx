'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users,
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'users' | 'settings';
  onPageChange: (page: 'dashboard' | 'users' | 'settings') => void;
}

export default function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
    { name: 'Users', icon: Users, key: 'users' as const },
    { name: 'Settings', icon: Settings, key: 'settings' as const },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold">Admin Hub</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Button
                key={item.key}
                variant={currentPage === item.key ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  onPageChange(item.key);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold">Admin Hub</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Button
                key={item.key}
                variant={currentPage === item.key ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onPageChange(item.key)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm lg:gap-x-6 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h2 className="text-lg font-semibold capitalize">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>
          </div>
        </div>
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
