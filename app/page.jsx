'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Search, AlertCircle, Sparkles, Flame, ShieldAlert, Layers } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState({
    mode: 'live',
    scope: 'all_teams',
    rounds: [],
    leaderboard: [],
    updatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoundTab, setSelectedRoundTab] = useState('all'); // 'all' | 1 | 2 | 3 | 4
  const [lastSynced, setLastSynced] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      // Use timestamp cache-buster and no-store to prevent edge/browser caching glitches
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

  const { mode, scope, rounds, leaderboard } = data;

  // Sorted and filtered leaderboard
  const processedLeaderboard = useMemo(() => {
    let list = [...leaderboard];

    // If filtering/sorting by a specific round
    if (selectedRoundTab !== 'all') {
      const rNum = Number(selectedRoundTab);
      list.sort((a, b) => {
        const scoreA = a.roundScores?.[rNum] !== null && a.roundScores?.[rNum] !== undefined ? Number(a.roundScores[rNum]) : -1;
        const scoreB = b.roundScores?.[rNum] !== null && b.roundScores?.[rNum] !== undefined ? Number(b.roundScores[rNum]) : -1;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.score || 0) - (a.score || 0);
      });
      // Re-rank for this specific round view
      let rRank = 1;
      list = list.map((t, idx) => {
        const hasScore = t.roundScores?.[rNum] !== null && t.roundScores?.[rNum] !== undefined;
        return {
          ...t,
          displayRank: hasScore ? rRank++ : '—',
        };
      });
    } else {
      list = list.map((t) => ({
        ...t,
        displayRank: t.rank !== null ? t.rank : '—',
      }));
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
  }, [leaderboard, selectedRoundTab, search]);

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
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ff7a1a]/15 border border-[#ff7a1a]/40 text-[#ff7a1a]">
                  Live Standings
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
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
              <span className="font-semibold tracking-wide">{isLive ? 'Real-Time Sync' : 'Reconnecting'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full mx-auto px-4 py-6 flex-1">
        {/* Controls: Round Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Round View Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#121212] p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedRoundTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedRoundTab === 'all'
                  ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Overall Score
            </button>
            {[1, 2, 3].map((rNum) => (
              <button
                key={rNum}
                onClick={() => setSelectedRoundTab(rNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedRoundTab === rNum
                    ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/25'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Round {rNum}
              </button>
            ))}
            {rounds?.some((r) => r.round_number === 4 && r.status !== 'not_started') && (
              <button
                onClick={() => setSelectedRoundTab(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedRoundTab === 4
                    ? 'bg-[#ff7a1a] text-black shadow-md shadow-[#ff7a1a]/25'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Final
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team ID, name, track..."
              className="w-full bg-[#111111]/90 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff7a1a] focus:ring-1 focus:ring-[#ff7a1a]/30 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs text-neutral-400 font-medium">Fetching real-time rankings & scores...</div>
          </div>
        ) : mode === 'hidden' ? (
          <div className="py-24 text-center space-y-3 bg-[#0d0d0d] border border-white/5 rounded-2xl p-8">
            <AlertCircle className="w-9 h-9 text-[#ff7a1a] mx-auto opacity-80" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Leaderboard Paused</h2>
            <p className="text-xs text-neutral-400">Scores are currently hidden. Tabulation in progress.</p>
          </div>
        ) : processedLeaderboard.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-[#0d0d0d] border border-white/5 rounded-2xl p-8">
            <Trophy className="w-9 h-9 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">
              {search ? 'No teams match your search.' : 'Scores are currently being tabulated by evaluators.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header for Tablet/Desktop */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.08] bg-[#0d0d0d]/40 rounded-xl">
              <div className="col-span-1">Rank</div>
              <div className="col-span-2">Team ID</div>
              <div className="col-span-4">Team & Track</div>
              <div className="col-span-3 text-center">Round Marks</div>
              <div className="col-span-2 text-right">
                {selectedRoundTab === 'all' ? 'Total Score' : `Round ${selectedRoundTab} Mark`}
              </div>
            </div>

            {/* List of Teams */}
            <div className="space-y-2 sm:space-y-1.5">
              {processedLeaderboard.map((team) => {
                const rankNum = team.displayRank;
                const isTop1 = rankNum === 1;
                const isTop2 = rankNum === 2;
                const isTop3 = rankNum === 3;
                const isPodium = isTop1 || isTop2 || isTop3;
                const isAdvancementZone = typeof rankNum === 'number' && rankNum <= 10 && !isPodium;

                // Active display score
                const displayScore =
                  selectedRoundTab === 'all'
                    ? (team.score !== null && team.score !== undefined ? team.score : '0.00')
                    : (team.roundScores?.[selectedRoundTab] !== null && team.roundScores?.[selectedRoundTab] !== undefined
                        ? team.roundScores[selectedRoundTab]
                        : '—');

                return (
                  <div
                    key={team.teamId}
                    className={`rank-row flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 px-3.5 sm:px-4 py-3 rounded-xl border transition-all ${
                      isTop1
                        ? 'bg-gradient-to-r from-[#ff7a1a]/20 via-[#ff7a1a]/10 to-transparent border-[#ff7a1a]/60 text-white shadow-[0_0_25px_rgba(255,122,26,0.18)]'
                        : isTop2
                        ? 'bg-gradient-to-r from-neutral-800/60 to-transparent border-neutral-600/80 text-white'
                        : isTop3
                        ? 'bg-gradient-to-r from-amber-900/30 to-transparent border-amber-700/60 text-white'
                        : isAdvancementZone
                        ? 'bg-[#121212] border-white/[0.09] hover:border-white/20 text-neutral-100'
                        : 'bg-[#0d0d0d] border-white/[0.05] hover:border-white/10 text-neutral-300'
                    }`}
                  >
                    {/* Top Row on Mobile / Left Columns on Desktop */}
                    <div className="flex items-center justify-between sm:contents">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0 sm:col-span-1 font-mono font-bold">
                        {typeof rankNum === 'number' ? (
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 sm:w-7 sm:h-7 rounded-lg text-xs font-black shadow-sm ${
                              isTop1
                                ? 'bg-[#ff7a1a] text-black shadow-[#ff7a1a]/40 ring-1 ring-[#ff7a1a]'
                                : isTop2
                                ? 'bg-neutral-200 text-black shadow-neutral-700'
                                : isTop3
                                ? 'bg-amber-600 text-white shadow-amber-900'
                                : isAdvancementZone
                                ? 'bg-neutral-800 border border-white/15 text-neutral-200'
                                : 'bg-neutral-900 border border-white/5 text-neutral-500'
                            }`}
                          >
                            {rankNum}
                          </span>
                        ) : (
                          <span className="text-neutral-600 text-xs font-semibold pl-2">—</span>
                        )}
                      </div>

                      {/* Team ID (Visible on sm+ in its own column) */}
                      <div className="hidden sm:block sm:col-span-2 font-mono text-xs font-bold text-[#ff7a1a]">
                        {team.teamId}
                      </div>

                      {/* Team Name & Track */}
                      <div className="flex-1 sm:col-span-4 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold tracking-tight text-white text-sm sm:text-base leading-snug truncate">
                            {team.teamName}
                          </span>
                          {isTop1 && (
                            <span className="text-[#ff7a1a] text-xs flex-shrink-0" title="1st Place Leader">
                              ★
                            </span>
                          )}
                        </div>

                        {team.problemStatement ? (
                          <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                            {team.problemStatement}
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-600 italic mt-0.5">
                            No track submitted
                          </div>
                        )}
                      </div>

                      {/* Round Scores Breakdown Chips */}
                      <div className="hidden sm:flex sm:col-span-3 items-center justify-center space-x-1.5 font-mono text-[11px]">
                        {[1, 2, 3].map((rNum) => {
                          const rScore = team.roundScores?.[rNum];
                          const hasScore = rScore !== null && rScore !== undefined;
                          const isCurrentTab = selectedRoundTab === rNum;
                          return (
                            <span
                              key={rNum}
                              className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                                isCurrentTab
                                  ? 'bg-[#ff7a1a]/20 border-[#ff7a1a] text-[#ffa95c]'
                                  : hasScore
                                  ? 'bg-white/5 border-white/10 text-neutral-200'
                                  : 'bg-transparent border-white/5 text-neutral-600'
                              }`}
                              title={`Round ${rNum} score`}
                            >
                              R{rNum}: {hasScore ? Number(rScore).toFixed(2).replace(/\.00$/, '') : '—'}
                            </span>
                          );
                        })}
                      </div>

                      {/* Final Score Badge */}
                      <div className="sm:col-span-2 sm:text-right flex items-center justify-end space-x-1 font-mono">
                        <span
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isTop1
                              ? 'text-[#ff7a1a]'
                              : isTop2
                              ? 'text-neutral-100'
                              : isTop3
                              ? 'text-amber-400'
                              : 'text-neutral-200'
                          }`}
                        >
                          {typeof displayScore === 'number'
                            ? Number(displayScore).toFixed(2).replace(/\.00$/, '')
                            : displayScore}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">pts</span>
                      </div>
                    </div>

                    {/* Mobile Secondary Row: Team ID & Round Chips */}
                    <div className="flex sm:hidden items-center justify-between pt-1 border-t border-white/5 font-mono text-[10px]">
                      <span className="font-bold text-[#ff7a1a]">{team.teamId}</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3].map((rNum) => {
                          const rScore = team.roundScores?.[rNum];
                          const hasScore = rScore !== null && rScore !== undefined;
                          return (
                            <span
                              key={rNum}
                              className={`px-1.5 py-0.2 rounded border ${
                                hasScore
                                  ? 'bg-white/5 border-white/10 text-neutral-300 font-bold'
                                  : 'border-transparent text-neutral-600'
                              }`}
                            >
                              R{rNum}:{hasScore ? Number(rScore).toFixed(1) : '—'}
                            </span>
                          );
                        })}
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
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">HACK-O-LANTERN 2026</span>
            <span>•</span>
            <span>Mirai Floor</span>
            <span>•</span>
            <span>Live Scoring Desk</span>
          </div>
          <div>{lastSynced ? `Synced at ${lastSynced.toLocaleTimeString()}` : ''}</div>
        </div>
      </footer>
    </main>
  );
}
