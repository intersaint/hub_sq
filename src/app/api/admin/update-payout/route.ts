import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Server-side admin client with service role key
const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    return null;
  }
  
  return createClient<Database>(url, serviceKey);
};

export async function POST(request: NextRequest) {
  try {
    const { proofId, payoutAmount, payoutCurrency, payoutTxHash } = await request.json();

    if (!proofId) {
      return NextResponse.json({ error: 'Proof ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin access not available' }, { status: 500 });
    }

    // Update the quest proof with payout details
    // Using type assertion to bypass strict TypeScript checking for dynamic updates
    const updatePayload: Record<string, string | number | null> = {};
    
    if (payoutAmount !== undefined) {
      updatePayload.payout_amount = payoutAmount ? parseFloat(payoutAmount) : null;
    }
    if (payoutCurrency !== undefined) {
      updatePayload.payout_currency = payoutCurrency;
    }
    if (payoutTxHash !== undefined) {
      updatePayload.payout_tx_hash = payoutTxHash;
    }
    updatePayload.updated_at = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('quest_proofs')
      .update(updatePayload)
      .eq('id', proofId)
      .select();

    if (error) {
      console.error('Error updating payout details:', error);
      return NextResponse.json({ error: 'Failed to update payout details' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error in update-payout API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
