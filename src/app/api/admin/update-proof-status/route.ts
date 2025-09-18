import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Supabase admin client is not available.' },
      { status: 500 }
    );
  }

  try {
    const { proofId, status } = await request.json();

    if (!proofId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters: proofId and status are required.' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('quest_proofs')
      .update({
        status,
        verified_at: new Date().toISOString(),
        verified_by: 'admin', // Replace with actual admin user ID
      })
      .eq('id', proofId)
      .select();

    if (error) {
      console.error('Error updating quest proof status:', error);
      throw new Error(`Failed to update quest proof status: ${error.message}`);
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Error in update-proof-status:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
