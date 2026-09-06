import type {
  Goal,
  VerifiedBaseline,
} from '../../types/football'

export interface TeamReconciliation {
  team: string
  expectedGoals: number
  actualGoals: number
  difference: number
  matches: boolean
}

export interface BaselineReconciliationResult {
  expectedCareerTotal: number
  actualCareerTotal: number
  totalDifference: number
  matchesBaseline: boolean
  teams: TeamReconciliation[]
}

const TEAM_NAME_ALIASES: Record<string, string> = {
  Bryne: 'Bryne FK',
  'Bryne FK': 'Bryne FK',

  Molde: 'Molde FK',
  'Molde FK': 'Molde FK',

  Salzburg: 'FC Red Bull Salzburg',
  'Red Bull Salzburg': 'FC Red Bull Salzburg',
  'FC Red Bull Salzburg': 'FC Red Bull Salzburg',

  Dortmund: 'Borussia Dortmund',
  'Borussia Dortmund': 'Borussia Dortmund',

  'Man City': 'Manchester City',
  'Manchester City': 'Manchester City',

  Norway: 'Norway',
}

function normalizeTeamName(team: string): string {
  return TEAM_NAME_ALIASES[team] ?? team
}

export function reconcileBaseline(
  goals: Goal[],
  baseline: VerifiedBaseline,
): BaselineReconciliationResult {
  const actualByTeam = new Map<string, number>()

  for (const goal of goals) {
    const team = normalizeTeamName(goal.club)

    actualByTeam.set(
      team,
      (actualByTeam.get(team) ?? 0) + 1,
    )
  }

  const teams = baseline.teams.map((entry) => {
    const team = normalizeTeamName(entry.team)

    const actualGoals =
      actualByTeam.get(team) ?? 0

    const difference =
      actualGoals - entry.expectedGoals

    return {
      team,
      expectedGoals: entry.expectedGoals,
      actualGoals,
      difference,
      matches: difference === 0,
    }
  })

  const actualCareerTotal = goals.length

  const totalDifference =
    actualCareerTotal - baseline.careerTotal

  return {
    expectedCareerTotal:
      baseline.careerTotal,

    actualCareerTotal,

    totalDifference,

    matchesBaseline:
      totalDifference === 0 &&
      teams.every((team) => team.matches),

    teams,
  }
}