import type { Goal } from '../../types/football'

import {
  getAwayGoals,
  getGoalsByClub,
  getGoalsBySeason,
  getHomeGoals,
  getPenaltyGoals,
} from '../statistics'

export interface CompetitionSummary {
  competition: string
  competitionType: string
  goals: number
  seasons: number
  clubs: string[]
  opponents: number
  firstGoalDate: string | null
  latestGoalDate: string | null
}

export function competitionToSlug(
  competition: string,
): string {
  return competition
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getGoalsForCompetition(
  goals: Goal[],
  competition: string,
): Goal[] {
  return goals
    .filter(
      (goal) =>
        goal.competition === competition,
    )
    .sort(
      (a, b) =>
        a.goalNumber - b.goalNumber,
    )
}

export function getCompetitionFromSlug(
  goals: Goal[],
  slug: string,
): string | null {
  const competition =
    [
      ...new Set(
        goals.map(
          (goal) =>
            goal.competition,
        ),
      ),
    ].find(
      (name) =>
        competitionToSlug(name) === slug,
    )

  return competition ?? null
}

export function getCompetitionSummaries(
  goals: Goal[],
): CompetitionSummary[] {
  const grouped =
    new Map<string, Goal[]>()

  for (const goal of goals) {
    const existing =
      grouped.get(
        goal.competition,
      ) ?? []

    existing.push(goal)

    grouped.set(
      goal.competition,
      existing,
    )
  }

  return Array.from(
    grouped.entries(),
  )
    .map(
      ([competition, competitionGoals]) => {
        const sorted =
          [...competitionGoals].sort(
            (a, b) =>
              a.date.localeCompare(
                b.date,
              ),
          )

        return {
          competition,

          competitionType:
            competitionGoals[0]
              ?.competitionType ??
            'Other',

          goals:
            competitionGoals.length,

          seasons:
            new Set(
              competitionGoals.map(
                (goal) =>
                  goal.season,
              ),
            ).size,

          clubs: [
            ...new Set(
              competitionGoals.map(
                (goal) =>
                  goal.club,
              ),
            ),
          ],

          opponents:
            new Set(
              competitionGoals.map(
                (goal) =>
                  goal.opponent,
              ),
            ).size,

          firstGoalDate:
            sorted[0]?.date ?? null,

          latestGoalDate:
            sorted.at(-1)?.date ??
            null,
        }
      },
    )
    .sort(
      (a, b) =>
        b.goals - a.goals,
    )
}

export function getCompetitionAnalytics(
  goals: Goal[],
  competition: string,
) {
  const competitionGoals =
    getGoalsForCompetition(
      goals,
      competition,
    )

  return {
    goals: competitionGoals,

    totalGoals:
      competitionGoals.length,

    seasonBreakdown:
      getGoalsBySeason(
        competitionGoals,
      ),

    clubBreakdown:
      getGoalsByClub(
        competitionGoals,
      ),

    homeGoals:
      getHomeGoals(
        competitionGoals,
      ),

    awayGoals:
      getAwayGoals(
        competitionGoals,
      ),

    penaltyGoals:
      getPenaltyGoals(
        competitionGoals,
      ),

    opponents:
      new Set(
        competitionGoals.map(
          (goal) =>
            goal.opponent,
        ),
      ).size,
  }
}