import type { Goal } from '../../types/football'
import {
  getGoalsByClub,
  getGoalsByCompetition,
  getHomeGoals,
  getAwayGoals,
  getPenaltyGoals,
} from '../statistics'

export interface SeasonSummary {
  season: string
  goals: number
  firstGoalDate: string | null
  lastGoalDate: string | null
  clubs: string[]
  competitions: number
  opponents: number
}

export function seasonToSlug(
  season: string,
): string {
  return season.replace('/', '-')
}

export function slugToSeason(
  slug: string,
): string {
  const match = slug.match(
    /^(\d{4})-(\d{2,4})$/,
  )

  if (!match) {
    return slug
  }

  return `${match[1]}/${match[2]}`
}

export function getGoalsForSeason(
  goals: Goal[],
  season: string,
): Goal[] {
  return goals
    .filter(
      (goal) =>
        goal.season === season,
    )
    .sort(
      (a, b) =>
        a.goalNumber -
        b.goalNumber,
    )
}

export function getSeasonSummaries(
  goals: Goal[],
): SeasonSummary[] {
  const grouped =
    new Map<string, Goal[]>()

  for (const goal of goals) {
    const existing =
      grouped.get(goal.season) ??
      []

    existing.push(goal)

    grouped.set(
      goal.season,
      existing,
    )
  }

  return Array.from(
    grouped.entries(),
  )
    .map(
      ([season, seasonGoals]) => {
        const sorted =
          [...seasonGoals].sort(
            (a, b) =>
              a.date.localeCompare(
                b.date,
              ),
          )

        return {
          season,

          goals:
            seasonGoals.length,

          firstGoalDate:
            sorted[0]?.date ??
            null,

          lastGoalDate:
            sorted.at(-1)
              ?.date ?? null,

          clubs: [
            ...new Set(
              seasonGoals.map(
                (goal) =>
                  goal.club,
              ),
            ),
          ],

          competitions:
            new Set(
              seasonGoals.map(
                (goal) =>
                  goal.competition,
              ),
            ).size,

          opponents:
            new Set(
              seasonGoals.map(
                (goal) =>
                  goal.opponent,
              ),
            ).size,
        }
      },
    )
    .sort(
      (a, b) =>
        b.season.localeCompare(
          a.season,
        ),
    )
}

export function getSeasonAnalytics(
  goals: Goal[],
  season: string,
) {
  const seasonGoals =
    getGoalsForSeason(
      goals,
      season,
    )

  return {
    goals: seasonGoals,

    totalGoals:
      seasonGoals.length,

    clubBreakdown:
      getGoalsByClub(
        seasonGoals,
      ),

    competitionBreakdown:
      getGoalsByCompetition(
        seasonGoals,
      ),

    homeGoals:
      getHomeGoals(
        seasonGoals,
      ),

    awayGoals:
      getAwayGoals(
        seasonGoals,
      ),

    penaltyGoals:
      getPenaltyGoals(
        seasonGoals,
      ),

    opponents:
      new Set(
        seasonGoals.map(
          (goal) =>
            goal.opponent,
        ),
      ).size,
  }
}