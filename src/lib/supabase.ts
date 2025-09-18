import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Get environment-specific credentials (matching your main project pattern)
const environment = process.env.VITE_ENVIRONMENT || process.env.NODE_ENV || 'prod';

const getSupabaseConfig = () => {
  // Debug: log all environment variables that start with SUPABASE
  console.log('All SUPABASE env vars:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    // Check alternative names
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'present' : 'missing'
  });

  if (environment === 'development') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    };
  } else {
    return {
      url: process.env.VITE_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY_PROD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    };
  }
};

const config = getSupabaseConfig();

// Debug logging
console.log('Environment:', environment);
console.log('Supabase config:', {
  url: config.url ? config.url.substring(0, 20) + '...' : 'undefined',
  key: config.key ? config.key.substring(0, 20) + '...' : 'undefined',
  serviceKey: config.serviceKey ? 'present' : 'missing',
  serviceKeyLength: config.serviceKey ? config.serviceKey.length : 0,
  serviceKeyStart: config.serviceKey ? config.serviceKey.substring(0, 10) + '...' : 'undefined'
});

// Check if we have valid configuration
const hasValidConfig = config.url && config.key && config.url !== 'https://demo.supabase.co';

console.log('Has valid config:', hasValidConfig);

export const supabase = hasValidConfig 
  ? createClient<Database>(config.url!, config.key!)
  : createClient<Database>('https://demo.supabase.co', 'demo-key');

// Admin client - only create on server side where service key is available
export const supabaseAdmin = typeof window === 'undefined' && hasValidConfig && config.serviceKey
  ? createClient<Database>(config.url!, config.serviceKey.trim())
  : null;

console.log('Supabase admin created:', !!supabaseAdmin, 'Server side:', typeof window === 'undefined');

// Helper function to check if admin client is available
export const isAdminAvailable = () => !!supabaseAdmin;

// Helper to check if we're in demo mode
export const isDemoMode = () => !hasValidConfig;
