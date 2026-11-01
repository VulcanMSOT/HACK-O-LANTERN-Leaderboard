'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Search, AlertCircle, Sparkles, Flame, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

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
  const [filter, setFilter] = useState('all'); // 'all' | 'top10' | 'evaluated'
  const [lastSynced, setLastSynced] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

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
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, []);

  const { mode, scope, leaderboard } = data;

  // Filtered leaderboard
  const processedLeaderboard = useMemo(() => {
    let list = [...leaderboard];

    if (filter === 'top10') {
      list = list.filter((t) => t.rank !== null && t.rank <= 10);
    } else if (filter === 'evaluated') {
      list = list.filter((t) => t.hasAnyMarks);
    }

    // Text search filter
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamId.toLowerCase().includes(q) ||
        (t.problemStatement && t.problemStatement.toLowerCase().includes(q))
    );
  }, [leaderboard, filter, search]);

  return (
    <main className="min-h-screen bg-[#060606] text-white flex flex-col justify-between selection:bg-[#ff7a1a]/30 relative overflow-x-hidden">
      {/* Ambient Atmospheric Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-[#ff7a1a]/15 via-[#ff7a1a]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-[#ff7a1a]/5 blur-3xl pointer-events-none -z-10" />

      {/* Top Banner / Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0c0c]/85 backdrop-blur-xl sticky top-0 z-30 px-4 py-3 sm:py-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Event Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#ff7a1a]/30 flex items-center justify-center font-black text-[#ff7a1a] text-lg sm:text-xl shadow-lg shadow-[#ff7a1a]/15">
              &#123;V&#125;
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                  <span>HACK-O-LANTERN 2026</span>
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ff7a1a]/15 border border-[#ff7a1a]/40 text-[#ff7a1a]">
                  Official Standings
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-medium font-mono">
                31 Oct - 1 Nov 2026 • Mirai Floor • Vulcan Club
              </p>
            </div>
          </div>

          {/* Status Indicators */}
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
              <span className="font-semibold tracking-wide font-mono">
                {isLive ? 'Real-Time Sync' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto px-4 py-6 flex-1">
        {/* Controls: Search and Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-1.5 bg-[#121212] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Teams ({leaderboard.length})
            </button>
            <button
              onClick={() => setFilter('top10')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'top10'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Top 10 Finalists
            </button>
            <button
              onClick={() => setFilter('evaluated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'evaluated'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Evaluated Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search team ID, name, track..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111]/90 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] focus:ring-1 focus:ring-[#ff7a1a]/30 transition-all font-mono"
            />
          </div>
        </div>

        {/* 1. Hidden State */}
        {mode === 'hidden' ? (
          <div className="border border-white/10 bg-[#121212]/80 backdrop-blur-md rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl my-12">
            <div className="w-12 h-12 rounded-full bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 flex items-center justify-center mx-auto mb-4 text-[#ff7a1a]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Leaderboard is Currently Hidden
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Standings are undergoing verification by the MSOT evaluation committee. Check back soon for the official update.
            </p>
          </div>
        ) : loading && leaderboard.length === 0 ? (
          /* Loading State */
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs text-neutral-400 font-medium font-mono">
              Fetching real-time rankings...
            </div>
          </div>
        ) : (
          /* 2. Leaderboard Roster */
          <div className="space-y-2.5">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 border-b border-white/5">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-2">Team ID</div>
              <div className="col-span-7">Team Name & Problem Statement</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {processedLeaderboard.map((team) => {
              const displayRank = team.rank !== null ? team.rank : '—';
              const isTop1 = displayRank === 1;
              const isTop2 = displayRank === 2;
              const isTop3 = displayRank === 3;
              const isTop10 = typeof displayRank === 'number' && displayRank <= 10;

              return (
                <div
                  key={team.teamId}
                  className={`relative p-3.5 sm:px-4 sm:py-3 rounded-2xl border transition-all duration-200 group ${
                    isTop1
                      ? 'bg-gradient-to-r from-[#ff7a1a]/15 via-[#1a1410] to-[#121118] border-[#ff7a1a]/40 shadow-lg shadow-[#ff7a1a]/10'
                      : isTop2
                      ? 'bg-gradient-to-r from-white/[0.08] via-[#161616] to-[#121118] border-white/20'
                      : isTop3
                      ? 'bg-gradient-to-r from-amber-600/[0.12] via-[#161412] to-[#121118] border-amber-600/30'
                      : isTop10
                      ? 'bg-[#100f16] border-white/10 hover:border-[#ff7a1a]/30 hover:bg-[#14121c]'
                      : 'bg-[#0d0c12]/80 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between sm:grid sm:grid-cols-12 sm:gap-3 sm:items-center">
                    {/* Rank Badge */}
                    <div className="sm:col-span-1 flex items-center justify-start sm:justify-center flex-shrink-0">
                      <span
                        className={`inline-flex items-center justify-center font-mono font-black rounded-xl text-xs sm:text-sm ${
                          isTop1
                            ? 'w-8 h-8 sm:w-9 sm:h-9 bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/30'
                            : isTop2
                            ? 'w-8 h-8 sm:w-9 sm:h-9 bg-neutral-200 text-black'
                            : isTop3
                            ? 'w-8 h-8 sm:w-9 sm:h-9 bg-amber-600 text-white'
                            : isTop10
                            ? 'w-7 h-7 sm:w-8 sm:h-8 bg-white/10 text-[#ff7a1a] border border-[#ff7a1a]/30'
                            : 'w-7 h-7 sm:w-8 sm:h-8 bg-white/5 text-neutral-400 border border-white/5'
                        }`}
                      >
                        {typeof displayRank === 'number' ? `#${displayRank}` : displayRank}
                      </span>
                    </div>

                    {/* Team ID */}
                    <div className="hidden sm:block sm:col-span-2 font-mono text-xs font-bold text-[#ff7a1a]">
                      {team.teamId}
                    </div>

                    {/* Team Name & Track */}
                    <div className="sm:col-span-7 flex-1 min-w-0 px-2 sm:px-0">
                      <div className="flex items-center space-x-2">
                        <span className="sm:hidden font-mono text-xs font-bold text-[#ff7a1a]">
                          {team.teamId}
                        </span>
                        <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight truncate group-hover:text-[#ff7a1a] transition-colors">
                          {team.teamName}
                        </h3>
                        {isTop1 && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ff7a1a] text-black">
                            <Flame className="w-2.5 h-2.5 fill-black" />
                            Leader
                          </span>
                        )}
                        {isTop10 && !isTop1 && (
                          <span className="hidden md:inline-flex text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-white/5 text-neutral-400 border border-white/10">
                            Finalist
                          </span>
                        )}
                      </div>

                      {/* Problem Statement Subtitle */}
                      <p className="text-[11px] sm:text-xs text-neutral-400 truncate mt-0.5 font-normal">
                        {team.problemStatement ? (
                          <span>{team.problemStatement}</span>
                        ) : team.trackNumber ? (
                          <span className="text-neutral-500">Track {team.trackNumber}</span>
                        ) : (
                          <span className="text-neutral-600 italic">Track unselected</span>
                        )}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="sm:col-span-2 text-right flex items-center justify-end font-mono">
                      {team.hasAnyMarks ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Evaluated</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-neutral-500 text-[10px]">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {processedLeaderboard.length === 0 && (
              <div className="text-center py-16 border border-white/10 rounded-2xl bg-[#0f0e15] space-y-2">
                <p className="text-xs text-neutral-400 font-mono">
                  No teams found matching "{search}".
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090909] px-4 py-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2 font-mono">
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
