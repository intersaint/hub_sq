'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Trophy, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// Helper functions to detect media types
const isVideoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.endsWith(ext));
};

const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.endsWith(ext));
};

const isTwitchClip = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.includes('twitch.tv/') && url.includes('/clip/');
};

const getTwitchEmbedUrl = (url: string | null | undefined, hostname: string): string => {
  if (!url) return '';
  const clipMatch = url.match(/\/clip\/([^?]+)/);
  if (clipMatch) {
    return `https://clips.twitch.tv/embed?clip=${clipMatch[1]}&parent=${hostname}`;
  }
  return '';
};

interface DashboardStats {
  recentActivity: Array<{
    id: string;
    type: 'quest_proof' | 'challenge_submission';
    title: string;
    submitter: string;
    status: string;
    submitted_at: string;
    streamer_name?: string | null;
    proof_url?: string | null;
    quest_id?: string;
    payout_amount?: number | null;
    payout_currency?: string | null;
    payout_tx_hash?: string | null;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [hostname, setHostname] = useState('');
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [editingPayout, setEditingPayout] = useState<Record<string, boolean>>({});
  const [payoutData, setPayoutData] = useState<Record<string, {
    amount: string;
    currency: string;
    txHash: string;
  }>>({});

  useEffect(() => {
    fetchDashboardStats();
    setHostname(window.location.hostname);
  }, []);

  const updateProofStatus = async (proofId: string, status: 'approved' | 'rejected') => {
    setUpdating(prev => ({ ...prev, [proofId]: true }));
    try {
      const response = await fetch('/api/admin/update-proof-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId, status }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      await fetchDashboardStats(); // Refresh data
    } catch (error) {
      console.error('Error updating proof status:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [proofId]: false }));
    }
  };

  const setQuestProof = async (questId: string, proofUrl: string, proofId: string) => {
    setUpdating(prev => ({ ...prev, [proofId]: true }));
    try {
      const response = await fetch('/api/admin/set-quest-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId, proofUrl }),
      });

      if (!response.ok) throw new Error('Failed to set quest proof');
      // Optionally, show a success message
      alert('Quest proof has been set!');
    } catch (error) {
      console.error('Error setting quest proof:', error);
      alert('Failed to set quest proof.');
    } finally {
      setUpdating(prev => ({ ...prev, [proofId]: false }));
    }
  };

  const updatePayoutDetails = async (proofId: string) => {
    setUpdating(prev => ({ ...prev, [proofId]: true }));
    try {
      const data = payoutData[proofId];
      const response = await fetch('/api/admin/update-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId,
          payoutAmount: data?.amount || null,
          payoutCurrency: data?.currency || null,
          payoutTxHash: data?.txHash || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update payout details');
      await fetchDashboardStats(); // Refresh data
      setEditingPayout(prev => ({ ...prev, [proofId]: false }));
    } catch (error) {
      console.error('Error updating payout details:', error);
      alert('Failed to update payout details.');
    } finally {
      setUpdating(prev => ({ ...prev, [proofId]: false }));
    }
  };

  const initializePayoutData = (activity: DashboardStats['recentActivity'][0]) => {
    if (!payoutData[activity.id]) {
      setPayoutData(prev => ({
        ...prev,
        [activity.id]: {
          amount: activity.payout_amount?.toString() || '',
          currency: activity.payout_currency || 'SOL',
          txHash: activity.payout_tx_hash || ''
        }
      }));
    }
  };

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats from API...');
      
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>

        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <p className="text-sm text-slate-400 mt-1">Latest quest submissions and proofs</p>
        </div>
        <div className="">
          <div className="">
            {stats.recentActivity.map((activity) => {
              initializePayoutData(activity);
              return (
                <div key={`${activity.type}-${activity.id}`} className="bg-slate-800/80 border border-slate-700 p-4 hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.type === 'quest_proof' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {activity.type === 'quest_proof' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <Trophy className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{activity.title}</h3>
                      {activity.streamer_name && (
                        <p className="text-sm text-blue-400 mb-1">
                          Streamer: {activity.streamer_name}
                        </p>
                      )}
                      <p className="text-sm text-slate-400">
                        by {activity.submitter} • {new Date(activity.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(activity.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      activity.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      activity.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>

                {/* Payout Information Section */}
                {activity.type === 'quest_proof' && (
                  <div className="mb-3 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Payout Details
                      </h4>
                      <button
                        onClick={() => setEditingPayout(prev => ({ ...prev, [activity.id]: !prev[activity.id] }))}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {editingPayout[activity.id] ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    
                    {editingPayout[activity.id] ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Amount</label>
                            <input
                              type="number"
                              step="0.01"
                              value={payoutData[activity.id]?.amount || ''}
                              onChange={(e) => setPayoutData(prev => ({
                                ...prev,
                                [activity.id]: { ...prev[activity.id], amount: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Currency</label>
                            <select
                              value={payoutData[activity.id]?.currency || 'SOL'}
                              onChange={(e) => setPayoutData(prev => ({
                                ...prev,
                                [activity.id]: { ...prev[activity.id], currency: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                            >
                              <option value="SOL">SOL</option>
                              <option value="USDC">USDC</option>
                              <option value="USD">USD</option>
                            </select>
                          </div>
                          <div className="sm:col-span-1">
                            <label className="block text-xs text-slate-400 mb-1">TX Hash</label>
                            <input
                              type="text"
                              value={payoutData[activity.id]?.txHash || ''}
                              onChange={(e) => setPayoutData(prev => ({
                                ...prev,
                                [activity.id]: { ...prev[activity.id], txHash: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                              placeholder="Transaction hash"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePayoutDetails(activity.id)}
                            disabled={updating[activity.id]}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {updating[activity.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                            ) : (
                              <DollarSign className="h-4 w-4" />
                            )}
                            Save Payout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Amount:</span>
                          <span>{activity.payout_amount ? `${activity.payout_amount} ${activity.payout_currency || 'SOL'}` : 'Not set'}</span>
                        </div>
                        {activity.payout_tx_hash && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">TX Hash:</span>
                            <span className="font-mono text-xs text-indigo-400 truncate max-w-32" title={activity.payout_tx_hash}>
                              {activity.payout_tx_hash.slice(0, 8)}...{activity.payout_tx_hash.slice(-8)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activity.proof_url && hostname && (
                  <div className="pt-3 border-t border-slate-700">
                    {isTwitchClip(activity.proof_url) ? (
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-900">
                        <iframe
                          src={getTwitchEmbedUrl(activity.proof_url, hostname)}
                          className="w-full h-full"
                          allowFullScreen
                          frameBorder="0"
                          scrolling="no"
                        />
                      </div>
                    ) : isVideoUrl(activity.proof_url) ? (
                      <video controls className="w-full max-h-80 rounded-lg bg-slate-900" preload="metadata">
                        <source src={activity.proof_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : isImageUrl(activity.proof_url) ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={activity.proof_url} 
                          alt="Quest proof" 
                          className="w-full max-h-80 object-contain rounded-lg bg-slate-900 border border-slate-700" 
                        />
                      </>
                    ) : (
                      <a 
                        href={activity.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Proof
                      </a>
                    )}
                  </div>
                )}

                {activity.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700">
                    <button
                      onClick={() => updateProofStatus(activity.id, 'approved')}
                      disabled={updating[activity.id]}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {updating[activity.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => updateProofStatus(activity.id, 'rejected')}
                      disabled={updating[activity.id]}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {updating[activity.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                    {activity.type === 'quest_proof' && activity.proof_url && activity.quest_id && (
                      <button
                        onClick={() => setQuestProof(activity.quest_id!, activity.proof_url!, activity.id)}
                        disabled={updating[activity.id]}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {updating[activity.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                        ) : (
                          <Trophy className="h-4 w-4" />
                        )}
                        Set as Quest Proof
                      </button>
                    )}
                  </div>
                )}
              </div>
              );
            })}
            
            {stats.recentActivity.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No recent activity</h3>
                <p className="text-slate-400">Quest submissions will appear here when available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
