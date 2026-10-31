'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Search, AlertCircle, Sparkles, Flame, ShieldAlert } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState({
    mode: 'live',
    scope: 'all_teams',
    leaderboard: [],
    updatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [search, setSearch] = useState('');
  const [lastSynced, setLastSynced] = useState(null);

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

  // Filtered leaderboard for mobile participant search
  const filteredLeaderboard = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leaderboard;
    return leaderboard.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamId.toLowerCase().includes(q)
    );
  }, [leaderboard, search]);

  return (
    <main className="min-h-screen bg-[#060606] text-white flex flex-col justify-between selection:bg-[#ff7a1a]/30 relative overflow-x-hidden">
      {/* Ambient Atmospheric Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-[#ff7a1a]/15 via-[#ff7a1a]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-[#ff7a1a]/5 blur-3xl pointer-events-none -z-10" />

      {/* Top Banner / Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0c]/80 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Event Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 flex items-center justify-center font-black text-[#ff7a1a] text-lg sm:text-xl shadow-lg shadow-[#ff7a1a]/10">
              {'{V}'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                  <span>HACK-O-LANTERN 2026</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ff7a1a]/15 border border-[#ff7a1a]/40 text-[#ff7a1a]">
                  Official
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
                31 Oct - 1 Nov 2026 • Mirai Floor • Vulcan Club
              </p>
            </div>
          </div>

          {/* Status Indicators & Search Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
            {mode === 'frozen' && (
              <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 shadow-sm shadow-cyan-950">
                Frozen
              </span>
            )}
            {scope === 'finalists_only' && (
              <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300">
                Finals
              </span>
            )}

            {/* Live Pulse Dot */}
            <div className="flex items-center space-x-1.5 text-[11px] text-neutral-300 bg-neutral-900/90 border border-white/10 px-2.5 py-1 rounded-lg">
              <span className="relative flex h-2 w-2">
                {isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLive ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
              </span>
              <span className="font-semibold tracking-wide">{isLive ? 'Live Sync' : 'Reconnecting'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full mx-auto px-4 py-6 flex-1">
        {/* Quick Search & Summary Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-2 text-xs text-neutral-400 font-medium">
            <span className="text-white font-bold">{leaderboard.length}</span>
            <span>Teams Tabulated</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400 text-[11px]">Rank updates dynamically</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by team or ID..."
              className="w-full bg-[#111111]/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] focus:ring-1 focus:ring-[#ff7a1a]/30 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs text-neutral-400 font-medium">Fetching live standings...</div>
          </div>
        ) : mode === 'hidden' ? (
          <div className="py-24 text-center space-y-3 bg-[#0d0d0d] border border-white/5 rounded-2xl p-8">
            <AlertCircle className="w-9 h-9 text-[#ff7a1a] mx-auto opacity-80" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Leaderboard Paused</h2>
            <p className="text-xs text-neutral-400">Scores are currently hidden. Tabulation in progress.</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-[#0d0d0d] border border-white/5 rounded-2xl p-8">
            <Trophy className="w-9 h-9 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">
              {search ? 'No teams match your search.' : 'Scores are currently being tabulated by evaluators.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header for Tablet/Desktop */}
            <div className="hidden sm:grid sm:grid-cols-12 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-white/[0.06]">
              <div className="col-span-2 md:col-span-1">Rank</div>
              <div className="col-span-3 md:col-span-2">Team ID</div>
              <div className="col-span-7 md:col-span-9">Team Name</div>
            </div>

            {/* List of Teams */}
            <div className="space-y-2 sm:space-y-1.5">
              {filteredLeaderboard.map((team, idx) => {
                const rankNum = team.rank;
                const isTop1 = rankNum === 1;
                const isTop2 = rankNum === 2;
                const isTop3 = rankNum === 3;
                const isPodium = isTop1 || isTop2 || isTop3;
                const isAdvancementZone = rankNum !== null && rankNum <= 10 && !isPodium;

                return (
                  <div
                    key={team.teamId}
                    className={`rank-row flex items-center justify-between sm:grid sm:grid-cols-12 gap-3 px-3.5 sm:px-4 py-3 rounded-xl border transition-all ${
                      isTop1
                        ? 'bg-gradient-to-r from-[#ff7a1a]/15 via-[#ff7a1a]/10 to-transparent border-[#ff7a1a]/50 text-white shadow-[0_0_20px_rgba(255,122,26,0.12)]'
                        : isTop2
                        ? 'bg-gradient-to-r from-neutral-800/40 to-transparent border-neutral-700/80 text-white'
                        : isTop3
                        ? 'bg-gradient-to-r from-amber-900/20 to-transparent border-amber-800/60 text-white'
                        : isAdvancementZone
                        ? 'bg-[#101010] border-white/[0.08] hover:border-white/20 text-neutral-100'
                        : 'bg-[#0d0d0d] border-white/[0.05] hover:border-white/10 text-neutral-300'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 sm:col-span-2 md:col-span-1 font-mono font-bold">
                      {rankNum !== null ? (
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-lg text-xs font-black shadow-sm ${
                            isTop1
                              ? 'bg-[#ff7a1a] text-black shadow-[#ff7a1a]/30'
                              : isTop2
                              ? 'bg-neutral-200 text-black shadow-neutral-700'
                              : isTop3
                              ? 'bg-amber-700 text-white shadow-amber-900'
                              : isAdvancementZone
                              ? 'bg-neutral-800/80 border border-white/10 text-neutral-200'
                              : 'bg-neutral-900 border border-white/5 text-neutral-500'
                          }`}
                        >
                          {rankNum}
                        </span>
                      ) : (
                        <span className="text-neutral-600 text-sm font-semibold pl-2">—</span>
                      )}
                    </div>

                    {/* Team ID (Visible in its own column on sm+) */}
                    <div className="hidden sm:block sm:col-span-3 md:col-span-2 font-mono text-xs font-bold text-[#ff7a1a]">
                      {team.teamId}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1 sm:col-span-7 md:col-span-9 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold tracking-tight text-white text-sm sm:text-base leading-snug break-words">
                            {team.teamName}
                          </span>
                          {isTop1 && (
                            <span className="text-[#ff7a1a] text-xs" title="1st Place Leader">
                              ★
                            </span>
                          )}
                        </div>

                        {/* Mobile ID Tag */}
                        <div className="flex items-center space-x-2 sm:hidden">
                          <span className="font-mono text-[11px] font-bold text-[#ff7a1a]">
                            {team.teamId}
                          </span>
                          {rankNum !== null && rankNum <= 10 && (
                            <span className="text-[9px] font-semibold text-neutral-400 bg-neutral-900 border border-white/5 px-1.5 py-0.2 rounded">
                              Top 10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090909] px-4 py-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">HACK-O-LANTERN 2026</span>
            <span>•</span>
            <span>Mirai Floor</span>
            <span>•</span>
            <span>Vulcan Club</span>
          </div>
          <div>{lastSynced ? `Synced at ${lastSynced.toLocaleTimeString()}` : ''}</div>
        </div>
      </footer>
    </main>
  );
}
