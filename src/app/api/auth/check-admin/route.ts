import { NextRequest, NextResponse } from 'next/server';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Store allowed admin user IDs securely on the server
const ALLOWED_ADMIN_IDS = [
  'did:privy:cmfmv71p900e4le0brzlpo7xu',
  // Add more admin IDs here as needed
];

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      console.error('No access token provided');
      return NextResponse.json({ error: 'No access token provided' }, { status: 401 });
    }

    console.log('Verifying token with Privy API...');

    // Verify the token with Privy API
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
    };
    
    if (PRIVY_APP_ID) {
      headers['privy-app-id'] = PRIVY_APP_ID;
    }

    const response = await fetch('https://auth.privy.io/api/v1/users/me', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('Privy API error:', response.status, await response.text());
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await response.json();
    
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }

    // Check if user is in the allowed admin list
    const isAdmin = ALLOWED_ADMIN_IDS.includes(user.id);

    return NextResponse.json({ 
      isAdmin,
      userId: user.id,
      verified: true 
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
