export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          notes: string | null
          payout_amount: number | null
          payout_status: string | null
          payout_tx_hash: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submission_url: string
          submitted_at: string
          submitter_id: string
          submitter_username: string
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payout_amount?: number | null
          payout_status?: string | null
          payout_tx_hash?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_url: string
          submitted_at?: string
          submitter_id: string
          submitter_username: string
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payout_amount?: number | null
          payout_status?: string | null
          payout_tx_hash?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_url?: string
          submitted_at?: string
          submitter_id?: string
          submitter_username?: string
          updated_at?: string
          wallet_address?: string | null
        }
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          creator_username: string
          deadline: string
          description: string
          id: string
          pool_amount: number
          pool_wallet: string | null
          requirements: Json
          status: string | null
          title: string
          updated_at: string
          winner_submission_id: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          twitter_handle: string | null
          updated_at: string
          user_id: string
          username: string | null
          wallet_address: string | null
        }
      }
      quest_proofs: {
        Row: {
          created_at: string
          downvotes: number | null
          id: string
          notes: string | null
          payout_amount: number | null
          payout_currency: string | null
          payout_tx_hash: string | null
          proof_url: string
          quest_id: string
          status: string | null
          submitted_at: string
          submitter_id: string
          updated_at: string
          upvotes: number | null
          verified_at: string | null
          verified_by: string | null
          vote_score: number | null
          wallet_address: string | null
        }
      }
      quests: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_id: string
          current_amount: number | null
          description: string | null
          expires_at: string | null
          id: string
          message: string
          pool_wallet_address: string | null
          reward_amount: number
          reward_currency: string | null
          status: 'active' | 'available' | 'completed' | 'cancelled' | null
          streamer_id: string
          target_amount: number
          title: string
          updated_at: string
        }
        Update: {
          proof_url?: string | null
        }
      }
      streamers: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          subscriber_count: number | null
          twitch_avatar: string | null
          twitch_username: string
          updated_at: string
          user_id: string
        }
      }
    }
  }
}

// Type aliases for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Quest = Database['public']['Tables']['quests']['Row']
export type QuestProof = Database['public']['Tables']['quest_proofs']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeSubmission = Database['public']['Tables']['challenge_submissions']['Row']
export type Streamer = Database['public']['Tables']['streamers']['Row']

// Extended types for admin interface with joined data
export interface QuestProofWithDetails extends QuestProof {
  quest?: Quest;
  submitter?: Profile;
}

export interface ChallengeSubmissionWithDetails extends ChallengeSubmission {
  challenge?: Challenge;
  submitter?: Profile;
}
