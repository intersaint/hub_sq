import { NextResponse } from 'next/server';
import { supabaseAdmin, isAdminAvailable } from '@/lib/supabase';
import { Database } from '@/types/database';

export async function POST(request: Request) {
  if (!isAdminAvailable()) {
    return NextResponse.json({ error: 'Admin features are not available.' }, { status: 403 });
  }

  const { questId, proofUrl } = await request.json();

  if (!questId || !proofUrl) {
    return NextResponse.json({ error: 'Quest ID and Proof URL are required' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not initialized.' }, { status: 500 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('quests')
      .update({ proof_url: proofUrl })
      .eq('id', questId);

    if (error) {
      console.error('Error setting quest proof URL:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({ message: 'Quest proof URL updated successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: `Failed to set quest proof: ${errorMessage}` }, { status: 500 });
  }
}
