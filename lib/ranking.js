/**
 * Pure calculation functions for Hack-O-Lantern 2026 scoring and ranking.
 */

export function calculateStandings(teams, marks, rounds, settings = {}) {
  const roundWeights = settings.round_weights || { '1': 1, '2': 1, '3': 1 };
  const finalWeight = Number(settings.final_weight ?? 1.0);
  const finalRule = settings.final_ranking_rule || 'final_only';
  const tieBreakOrder = settings.tie_break_order || [3, 2, 1];

  const roundMap = new Map();
  rounds.forEach((r) => roundMap.set(r.round_number, r));

  const teamMarksMap = new Map();
  marks.forEach((m) => {
    if (m.removed) return;
    const key = `${m.team_id}:${m.round_number}`;
    if (!teamMarksMap.has(key)) teamMarksMap.set(key, []);
    teamMarksMap.get(key).push(Number(m.value));
  });

  const computedTeams = teams.map((team) => {
    const roundScores = {};
    const roundMarkCounts = {};
    const roundComplete = {};

    let cumulativeTotal = 0;
    let hasAnyMarks = false;

    // Rounds 1, 2, 3
    for (let r = 1; r <= 3; r++) {
      const rObj = roundMap.get(r) || { evaluators_per_team: 3 };
      const teamRoundMarks = teamMarksMap.get(`${team.id}:${r}`) || [];
      roundMarkCounts[r] = teamRoundMarks.length;
      roundComplete[r] = teamRoundMarks.length >= (rObj.evaluators_per_team || 3);

      if (teamRoundMarks.length > 0) {
        hasAnyMarks = true;
        const avg = teamRoundMarks.reduce((a, b) => a + b, 0) / teamRoundMarks.length;
        roundScores[r] = Math.round(avg * 100) / 100;
        const weight = Number(roundWeights[String(r)] ?? 1);
        cumulativeTotal += roundScores[r] * weight;
      } else {
        roundScores[r] = null;
      }
    }

    // Round 4 (Final)
    const r4Obj = roundMap.get(4) || { evaluators_per_team: 3 };
    const finalMarks = teamMarksMap.get(`${team.id}:4`) || [];
    roundMarkCounts[4] = finalMarks.length;
    roundComplete[4] = finalMarks.length >= (r4Obj.evaluators_per_team || 3);

    if (finalMarks.length > 0) {
      hasAnyMarks = true;
      const avg = finalMarks.reduce((a, b) => a + b, 0) / finalMarks.length;
      roundScores[4] = Math.round(avg * 100) / 100;
    } else {
      roundScores[4] = null;
    }

    cumulativeTotal = Math.round(cumulativeTotal * 100) / 100;

    let finalOverallScore = null;
    if (roundScores[4] !== null) {
      if (finalRule === 'cumulative') {
        finalOverallScore = Math.round((cumulativeTotal + roundScores[4] * finalWeight) * 100) / 100;
      } else {
        finalOverallScore = roundScores[4];
      }
    }

    return {
      teamId: team.id,
      teamName: team.name,
      status: team.status,
      problemStatement: team.problem_statement || team.problemStatement || null,
      trackNumber: team.track_number || team.trackNumber || null,
      hasAnyMarks,
      roundScores,
      roundMarkCounts,
      roundComplete,
      cumulativeTotal,
      finalOverallScore,
    };
  });

  const hasFinalScores = computedTeams.some((t) => t.status === 'finalist' && t.roundScores[4] !== null);

  const comparator = (a, b) => {
    if (!a.hasAnyMarks && !b.hasAnyMarks) return a.teamName.localeCompare(b.teamName);
    if (a.hasAnyMarks && !b.hasAnyMarks) return -1;
    if (!a.hasAnyMarks && b.hasAnyMarks) return 1;

    if (hasFinalScores) {
      const aFinalist = a.status === 'finalist';
      const bFinalist = b.status === 'finalist';
      if (aFinalist && !bFinalist) return -1;
      if (!aFinalist && bFinalist) return 1;

      if (aFinalist && bFinalist) {
        const aScore = a.finalOverallScore ?? -1;
        const bScore = b.finalOverallScore ?? -1;
        if (bScore !== aScore) return bScore - aScore;

        if (finalRule === 'final_only') {
          if (b.cumulativeTotal !== a.cumulativeTotal) {
            return b.cumulativeTotal - a.cumulativeTotal;
          }
        }
      }
    }

    if (b.cumulativeTotal !== a.cumulativeTotal) {
      return b.cumulativeTotal - a.cumulativeTotal;
    }

    for (const r of tieBreakOrder) {
      const scoreA = a.roundScores[r] ?? 0;
      const scoreB = b.roundScores[r] ?? 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
    }

    return a.teamName.localeCompare(b.teamName);
  };

  const isIdenticalScore = (a, b) => {
    if (!a.hasAnyMarks && !b.hasAnyMarks) return true;
    if (a.hasAnyMarks !== b.hasAnyMarks) return false;

    if (hasFinalScores) {
      if ((a.status === 'finalist') !== (b.status === 'finalist')) return false;
      if (a.status === 'finalist' && b.status === 'finalist') {
        if (a.finalOverallScore !== b.finalOverallScore) return false;
        if (finalRule === 'final_only' && a.cumulativeTotal !== b.cumulativeTotal) return false;
      }
    }

    if (a.cumulativeTotal !== b.cumulativeTotal) return false;

    for (const r of tieBreakOrder) {
      if ((a.roundScores[r] ?? 0) !== (b.roundScores[r] ?? 0)) return false;
    }

    return true;
  };

  const sorted = [...computedTeams].sort(comparator);

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (!sorted[i].hasAnyMarks) {
      sorted[i].rank = null;
      continue;
    }

    if (i > 0 && isIdenticalScore(sorted[i], sorted[i - 1])) {
      sorted[i].rank = sorted[i - 1].rank;
    } else {
      sorted[i].rank = currentRank;
    }
    currentRank++;
  }

  return sorted;
}

