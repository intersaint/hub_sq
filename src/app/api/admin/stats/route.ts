import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      // Return demo data when admin client isn't available
      return NextResponse.json({
        questProofs: {
          total: 25,
          pending: 8,
          approved: 15,
          rejected: 2,
          totalPayout: 1250.50
        },
        challengeSubmissions: {
          total: 12,
          pending: 4,
          approved: 7,
          rejected: 1
        },
        recentActivity: [
          {
            id: '1',
            type: 'quest_proof',
            title: 'Demo Quest: Complete Tutorial',
            submitter: 'demo_user_1',
            status: 'pending',
            submitted_at: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: '2',
            type: 'challenge_submission',
            title: 'Demo Challenge: Gaming Marathon',
            submitter: 'demo_user_2',
            status: 'approved',
            submitted_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      });
    }

    // Fetch real data from Supabase
    const [questProofsResult, challengeSubmissionsResult, recentActivityResult] = await Promise.all([
      // Quest proof stats
      supabaseAdmin
        .from('quest_proofs')
        .select('status, payout_amount, payout_currency'),
      
      // Challenge submission stats  
      supabaseAdmin
        .from('challenge_submissions')
        .select('status'),
        
      // Recent activity (last 10 items) - first check what columns exist
      supabaseAdmin
        .from('quest_proofs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    if (questProofsResult.error) throw questProofsResult.error;
    if (challengeSubmissionsResult.error) throw challengeSubmissionsResult.error;
    if (recentActivityResult.error) throw recentActivityResult.error;

    // Process quest proof stats
    const questProofs = questProofsResult.data || [];
    const questStats = {
      total: questProofs.length,
      pending: questProofs.filter((q: any) => q.status === 'pending').length,
      approved: questProofs.filter((q: any) => q.status === 'approved').length,
      rejected: questProofs.filter((q: any) => q.status === 'rejected').length,
      totalPayout: questProofs.length > 0 
        ? questProofs
            .filter((q: any) => q.status === 'approved')
            .reduce((sum: number, q: any) => sum + (Number(q.payout_amount) || 0), 0)
        : 0
    };

    // Process challenge submission stats
    const challengeSubmissions = challengeSubmissionsResult.data || [];
    const challengeStats = {
      total: challengeSubmissions.length,
      pending: challengeSubmissions.filter((c: any) => c.status === 'pending').length,
      approved: challengeSubmissions.filter((c: any) => c.status === 'approved').length,
      rejected: challengeSubmissions.filter((c: any) => c.status === 'rejected').length
    };

    // Process recent activity - enrich with quest details
    console.log('Quest proofs data structure:', JSON.stringify(recentActivityResult.data?.[0], null, 2));
    
    const recentActivity = await Promise.all(
      (recentActivityResult.data || []).map(async (item: any) => {
        // Fetch quest details for each proof
        const { data: questData, error: questError } = await supabaseAdmin
          .from('quests')
          .select('title, streamer_id')
          .eq('id', item.quest_id)
          .single<{
            title: string;
            streamer_id: string;
          }>();

        let streamerName: string | null = null;
        if (questData && questData.streamer_id) {
          const { data: streamerData, error: streamerError } = await supabaseAdmin
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

        if (questError) {
          console.warn(`Failed to fetch quest ${item.quest_id}:`, questError);
        }

        return {
          id: item.id,
          quest_id: item.quest_id,
          type: 'quest_proof' as const,
          title: questData?.title || `Quest Proof ${item.id}`,
          submitter: item.wallet_address || item.user_wallet || item.submitter_id || 'Unknown User',
          status: item.status,
          submitted_at: item.created_at,
          streamer_name: streamerName,
          proof_url: item.proof_url,
          payout_amount: item.payout_amount,
          payout_currency: item.payout_currency,
          payout_tx_hash: item.payout_tx_hash
        };
      })
    );

    return NextResponse.json({
      questProofs: questStats,
      challengeSubmissions: challengeStats,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
