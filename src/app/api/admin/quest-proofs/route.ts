import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    return null;
  }
  
  return createClient<Database>(url, serviceKey);
};

export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      // Return demo data
      return NextResponse.json([
        {
          id: '1',
          user_id: 'demo_user_1',
          quest_id: 'demo_quest_1',
          proof_data: { description: 'Completed tutorial successfully', screenshot: 'demo.jpg' },
          status: 'pending',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          payout_amount: 50,
          payout_currency: 'USDC',
          quests: { title: 'Complete Tutorial', description: 'Learn the basics' }
        },
        {
          id: '2',
          user_id: 'demo_user_2',
          quest_id: 'demo_quest_2',
          proof_data: { description: 'Gaming session completed', hours: 5 },
          status: 'approved',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          payout_amount: 100,
          payout_currency: 'USDC',
          quests: { title: 'Gaming Marathon', description: 'Play for 5 hours' }
        }
      ]);
    }

    // First get quest proofs
    const { data: questProofs, error: proofsError } = await supabaseAdmin
      .from('quest_proofs')
      .select('*')
      .order('created_at', { ascending: false });

    if (proofsError) throw proofsError;

    // Then get quest details for each proof
    const enrichedProofs = await Promise.all(
      (questProofs || []).map(async (proof: {
        id: string;
        quest_id: string;
        submitter_id: string;
        status: string;
        created_at: string;
        proof_url?: string;
        payout_amount?: number | null;
        payout_currency?: string | null;
        payout_tx_hash?: string | null;
        [key: string]: unknown;
      }) => {
        const { data: questData } = await supabaseAdmin
          .from('quests')
          .select('title, streamer_id')
          .eq('id', proof.quest_id)
          .single<{
            title: string;
            streamer_id: string;
          }>();

        let streamerName: string | null = null;
        if (questData && questData.streamer_id) {
          const { data: streamerData } = await supabaseAdmin
            .from('streamers')
            .select('twitch_username')
            .eq('id', questData.streamer_id)
            .single<{
              twitch_username: string;
            }>();
          if (streamerData) {
            streamerName = streamerData.twitch_username;
          }
        }

        return {
          ...proof,
          quest: {
            title: questData?.title,
            streamer: streamerName
          }
        };
      })
    );

    // Debug: log the actual data structure
    console.log('Quest proofs API data:', JSON.stringify(enrichedProofs?.[0], null, 2));

    return NextResponse.json(enrichedProofs || []);
  } catch (error) {
    console.error('Error fetching quest proofs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quest proofs' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not available' },
        { status: 503 }
      );
    }

    const { id, status, payout_amount, payout_currency } = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('quest_proofs')
      .update({
        status,
        payout_amount,
        payout_currency,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating quest proof:', error);
    return NextResponse.json(
      { error: 'Failed to update quest proof' },
      { status: 500 }
    );
  }
}
