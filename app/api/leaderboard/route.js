import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { calculateStandings } from '@/lib/ranking';

export const revalidate = 3; // Cache for 3 seconds on edge / server

export async function GET() {
  try {
    const [settingsRes, teamsRes, marksRes, roundsRes] = await Promise.all([
      pool.query('SELECT leaderboard_mode, leaderboard_scope, final_ranking_rule, final_weight, round_weights, tie_break_order, frozen_snapshot FROM settings WHERE id = 1'),
      pool.query('SELECT id, name, status FROM teams ORDER BY id ASC'),
      pool.query('SELECT team_id, round_number, value FROM marks WHERE removed = FALSE'),
      pool.query('SELECT round_number, label, max_marks, evaluators_per_team, status FROM rounds ORDER BY round_number ASC'),
    ]);

    const settings = settingsRes.rows[0] || {
      leaderboard_mode: 'live',
      leaderboard_scope: 'all_teams',
    };

    const mode = settings.leaderboard_mode || 'live';
    const scope = settings.leaderboard_scope || 'all_teams';

    // 1. Hidden Mode
    if (mode === 'hidden') {
      return NextResponse.json(
        {
          mode: 'hidden',
          scope,
          leaderboard: [],
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=2',
          },
        }
      );
    }

    // 2. Frozen Mode
    if (mode === 'frozen') {
      let frozenList = [];
      try {
        frozenList = typeof settings.frozen_snapshot === 'string'
          ? JSON.parse(settings.frozen_snapshot)
          : settings.frozen_snapshot || [];
      } catch (e) {
        frozenList = [];
      }

      // Ensure sanitization: strictly rank, teamId, teamName
      const sanitizedFrozen = frozenList.map((item) => ({
        rank: item.rank,
        teamId: item.teamId,
        teamName: item.teamName,
      }));

      return NextResponse.json(
        {
          mode: 'frozen',
          scope,
          leaderboard: sanitizedFrozen,
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=2',
          },
        }
      );
    }

    // 3. Live Mode: Compute standings from database
    const standings = calculateStandings(teamsRes.rows, marksRes.rows, roundsRes.rows, settings);

    // Apply scope filter
    const filtered = scope === 'finalists_only'
      ? standings.filter((s) => s.status === 'finalist')
      : standings;

    // Strictly whitelist fields (rank, teamId, teamName) - NEVER include marks or scores
    const leaderboard = filtered.map((s) => ({
      rank: s.rank,
      teamId: s.teamId,
      teamName: s.teamName,
    }));

    return NextResponse.json(
      {
        mode: 'live',
        scope,
        leaderboard,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=2',
        },
      }
    );
  } catch (err) {
    console.error('Leaderboard API error:', err);
    return NextResponse.json(
      { error: 'Could not load leaderboard.', leaderboard: [] },
      { status: 500 }
    );
  }
}
