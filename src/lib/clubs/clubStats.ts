import type { Goal } from '../../types/football'

import {
  getAwayGoals,
  getGoalsByCompetition,
  getGoalsBySeason,
  getHomeGoals,
  getPenaltyGoals,
} from '../statistics'

export interface ClubSummary {
  club: string
  goals: number
  seasons: number
  competitions: number
  opponents: number
  firstGoalDate: string | null
  latestGoalDate: string | null
}

export function clubToSlug(
  club: string,
): string {
  return club
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getClubFromSlug(
  goals: Goal[],
  slug: string,
): string | null {
  const club = [
    ...new Set(
      goals.map(
        (goal) => goal.club,
      ),
    ),
  ].find(
    (name) =>
      clubToSlug(name) === slug,
  )

  return club ?? null
}

export function getGoalsForClub(
  goals: Goal[],
  club: string,
): Goal[] {
  return goals
    .filter(
      (goal) =>
        goal.club === club,
    )
    .sort(
      (a, b) =>
        a.goalNumber -
        b.goalNumber,
    )
}

export function getClubSummaries(
  goals: Goal[],
): ClubSummary[] {
  const grouped =
    new Map<string, Goal[]>()

  for (const goal of goals) {
    const existing =
      grouped.get(goal.club) ?? []

    existing.push(goal)

    grouped.set(
      goal.club,
      existing,
    )
  }

  return Array.from(
    grouped.entries(),
  )
    .map(
      ([club, clubGoals]) => {
        const sorted =
          [...clubGoals].sort(
            (a, b) =>
              a.date.localeCompare(
                b.date,
              ),
          )

        return {
          club,

          goals:
            clubGoals.length,

          seasons:
            new Set(
              clubGoals.map(
                (goal) =>
                  goal.season,
              ),
            ).size,

          competitions:
            new Set(
              clubGoals.map(
                (goal) =>
                  goal.competition,
              ),
            ).size,

          opponents:
            new Set(
              clubGoals.map(
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

export function getClubAnalytics(
  goals: Goal[],
  club: string,
) {
  const clubGoals =
    getGoalsForClub(
      goals,
      club,
    )

  return {
    goals: clubGoals,

    totalGoals:
      clubGoals.length,

    seasonBreakdown:
      getGoalsBySeason(
        clubGoals,
      ),

    competitionBreakdown:
      getGoalsByCompetition(
        clubGoals,
      ),

    homeGoals:
      getHomeGoals(
        clubGoals,
      ),

    awayGoals:
      getAwayGoals(
        clubGoals,
      ),

    penaltyGoals:
      getPenaltyGoals(
        clubGoals,
      ),

    opponents:
      new Set(
        clubGoals.map(
          (goal) =>
            goal.opponent,
        ),
      ).size,

    firstGoal:
      clubGoals[0] ?? null,

    latestGoal:
      clubGoals.at(-1) ?? null,
  }
}