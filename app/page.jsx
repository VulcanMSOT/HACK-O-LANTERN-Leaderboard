'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, Radio, RefreshCw, AlertCircle } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState({
    mode: 'live',
    scope: 'all_teams',
    leaderboard: [],
    updatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const previousPositionsRef = useRef(new Map());

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsLive(true);
        setLastSynced(new Date());
      } else {
        setIsLive(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const { mode, scope, leaderboard } = data;

  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col justify-between selection:bg-[#ff7a1a]/30 p-4 md:p-8">
      {/* Top Banner / Header */}
      <header className="max-w-5xl w-full mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#222222] gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-xl font-bold text-[#ff7a1a] shadow-inner">
              {'{V}'}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                <span>HACK-O-LANTERN 2026</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                31 Oct to 1 Nov 2026 • Mirai Floor • Hosted by Vulcan Club
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            {mode === 'frozen' && (
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                Leaderboard Frozen
              </span>
            )}
            {scope === 'finalists_only' && (
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300">
                Finals Round
              </span>
            )}
            <div className="flex items-center space-x-2 text-xs text-neutral-400 bg-[#121212] border border-[#222222] px-3 py-1.5 rounded-xl">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span>{isLive ? 'Live' : 'Reconnecting...'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="max-w-5xl w-full mx-auto flex-1">
        {loading ? (
          <div className="py-24 text-center text-neutral-500 text-sm">Loading standings...</div>
        ) : mode === 'hidden' ? (
          <div className="py-24 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#ff7a1a] mx-auto opacity-80" />
            <h2 className="text-lg font-bold text-white">Leaderboard Paused</h2>
            <p className="text-xs text-neutral-400">Leaderboard is currently paused. Check back shortly.</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-24 text-center space-y-2">
            <Trophy className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm text-neutral-400">Scores are currently being tabulated by evaluators.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-[#1c1c1c]">
              <div className="col-span-2 md:col-span-1">Rank</div>
              <div className="col-span-3 md:col-span-2">Team ID</div>
              <div className="col-span-7 md:col-span-9">Team Name</div>
            </div>

            {/* Rows */}
            <div className="space-y-1.5">
              {leaderboard.map((team, idx) => {
                const rankNum = team.rank;
                const isTop1 = rankNum === 1;
                const isTop2 = rankNum === 2;
                const isTop3 = rankNum === 3;
                const isPodium = isTop1 || isTop2 || isTop3;

                return (
                  <div
                    key={team.teamId}
                    className={`rank-row grid grid-cols-12 items-center px-4 py-3 rounded-xl border text-sm transition-all ${
                      isTop1
                        ? 'bg-[#ff7a1a]/10 border-[#ff7a1a]/40 text-white shadow-sm shadow-[#ff7a1a]/10'
                        : isTop2
                        ? 'bg-neutral-800/40 border-neutral-700 text-white'
                        : isTop3
                        ? 'bg-neutral-900/60 border-neutral-800 text-white'
                        : 'bg-[#121212] border-[#222222] text-neutral-200'
                    }`}
                  >
                    <div className="col-span-2 md:col-span-1 font-mono font-bold">
                      {rankNum !== null ? (
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                            isTop1
                              ? 'bg-[#ff7a1a] text-black'
                              : isTop2
                              ? 'bg-neutral-300 text-black'
                              : isTop3
                              ? 'bg-amber-700 text-white'
                              : 'text-neutral-400 bg-neutral-900'
                          }`}
                        >
                          {rankNum}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </div>

                    <div className="col-span-3 md:col-span-2 font-mono text-xs font-semibold text-[#ff7a1a]">
                      {team.teamId}
                    </div>

                    <div className="col-span-7 md:col-span-9 font-bold tracking-tight text-white truncate text-base">
                      {team.teamName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto mt-8 pt-4 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
        <div>HACK-O-LANTERN 2026 • Official Leaderboard</div>
        <div>{lastSynced ? `Last updated: ${lastSynced.toLocaleTimeString()}` : ''}</div>
      </footer>
    </main>
  );
}
