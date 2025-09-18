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
    const { questId, proofId, proofUrl } = await request.json();

    if (!questId || !proofId || !proofUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: questId, proofId, or proofUrl.' },
        { status: 400 }
      );
    }

    // Step 1: Update the quest_proofs table to set the status to 'approved'
    const { error: proofUpdateError } = await supabaseAdmin
      .from('quest_proofs')
      .update({
        status: 'approved',
        verified_at: new Date().toISOString(),
        verified_by: 'admin', // Replace with actual admin user ID
      })
      .eq('id', proofId);

    if (proofUpdateError) {
      console.error('Error updating quest proof:', proofUpdateError);
      throw new Error(`Failed to update quest proof: ${proofUpdateError.message}`);
    }

    // Step 2: Update the quests table to set the proof_url
    const { error: questUpdateError } = await supabaseAdmin
      .from('quests')
      .update({ proof_url: proofUrl })
      .eq('id', questId);

    if (questUpdateError) {
      console.error('Error updating quest:', questUpdateError);
      throw new Error(`Failed to update quest: ${questUpdateError.message}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in approve-and-set-proof:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
