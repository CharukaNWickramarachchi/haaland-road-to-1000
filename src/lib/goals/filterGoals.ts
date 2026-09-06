import type { Goal } from '../../types/football'

export interface GoalFilters {
  search: string
  club: string
  competition: string
  season: string
  venue: string
  verifiedOnly: boolean
}

export const DEFAULT_GOAL_FILTERS: GoalFilters = {
  search: '',
  club: 'all',
  competition: 'all',
  season: 'all',
  venue: 'all',
  verifiedOnly: false,
}

export function filterGoals(
  goals: Goal[],
  filters: GoalFilters,
): Goal[] {
  const search = filters.search
    .trim()
    .toLowerCase()

  return goals.filter((goal) => {
    if (search) {
      const searchableText = [
        String(goal.goalNumber),
        goal.club,
        goal.opponent,
        goal.competition,
        goal.season,
        goal.goalType ?? '',
        goal.bodyPart ?? '',
        goal.assist ?? '',
      ]
        .join(' ')
        .toLowerCase()

      if (!searchableText.includes(search)) {
        return false
      }
    }

    if (
      filters.club !== 'all' &&
      goal.club !== filters.club
    ) {
      return false
    }

    if (
      filters.competition !== 'all' &&
      goal.competition !== filters.competition
    ) {
      return false
    }

    if (
      filters.season !== 'all' &&
      goal.season !== filters.season
    ) {
      return false
    }

    if (
      filters.venue !== 'all' &&
      goal.venue !== filters.venue
    ) {
      return false
    }

    if (
      filters.verifiedOnly &&
      !goal.verified
    ) {
      return false
    }

    return true
  })
}

export function getUniqueValues(
  goals: Goal[],
  selector: (goal: Goal) => string,
): string[] {
  return [
    ...new Set(
      goals.map(selector),
    ),
  ].sort((a, b) =>
    a.localeCompare(b),
  )
}