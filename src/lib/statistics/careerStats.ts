import type { Goal, Milestone } from '../../types/football'

export interface ProgressStats {
  currentGoals: number
  targetGoals: number
  remainingGoals: number
  progressPercentage: number
}

export interface CumulativeGoalPoint {
  goalNumber: number
  date: string
  season: string
  club: string
}

export interface MilestoneStatus {
  threshold: number
  title: string
  reached: boolean
  goalNumber: number | null
  date: string | null
  club: string | null
  opponent: string | null
}

export interface NextMilestone {
  threshold: number
  title: string
  goalsRemaining: number
}

export interface GroupedGoalTotal {
  key: string
  goals: number
}

export function getCareerGoals(goals: Goal[]): number {
  return goals.filter((goal) => goal.verified).length
}

export function getLatestCanonicalGoal(
  goals: Goal[],
): Goal | null {
  if (goals.length === 0) {
    return null
  }

  return [...goals]
    .sort(
      (a, b) =>
        a.goalNumber -
        b.goalNumber,
    )
    .at(-1) ?? null
}

export function getVerifiedGoals(goals: Goal[]): Goal[] {
  return goals.filter((goal) => goal.verified)
}

export function getUnverifiedGoals(goals: Goal[]): Goal[] {
  return goals.filter((goal) => !goal.verified)
}

export function getClubGoals(goals: Goal[]): number {
  return goals.filter((goal) => goal.club !== 'Norway').length
}

export function getInternationalGoals(goals: Goal[]): number {
  return goals.filter((goal) => goal.club === 'Norway').length
}

export function getProgressStats(
  goals: Goal[],
  targetGoals = 1000,
): ProgressStats {
  const currentGoals = getCareerGoals(goals)
  const remainingGoals = Math.max(targetGoals - currentGoals, 0)

  const progressPercentage =
    targetGoals > 0
      ? Math.min((currentGoals / targetGoals) * 100, 100)
      : 0

  return {
    currentGoals,
    targetGoals,
    remainingGoals,
    progressPercentage,
  }
}

export function getLatestGoal(goals: Goal[]): Goal | null {
  if (goals.length === 0) {
    return null
  }

  return [...goals].sort((a, b) => {
    if (a.goalNumber !== b.goalNumber) {
      return b.goalNumber - a.goalNumber
    }

    return b.date.localeCompare(a.date)
  })[0]
}

export function getNextMilestone(
  goals: Goal[],
  milestones: Milestone[],
): NextMilestone | null {
  const currentGoals = getCareerGoals(goals)

  const next = [...milestones]
    .filter((milestone) => milestone.category === 'Career')
    .sort((a, b) => a.threshold - b.threshold)
    .find((milestone) => milestone.threshold > currentGoals)

  if (!next) {
    return null
  }

  return {
    threshold: next.threshold,
    title: next.title,
    goalsRemaining: next.threshold - currentGoals,
  }
}

export function getGoalsByClub(goals: Goal[]): GroupedGoalTotal[] {
  const totals = new Map<string, number>()

  for (const goal of goals) {
    totals.set(goal.club, (totals.get(goal.club) ?? 0) + 1)
  }

  return Array.from(totals.entries())
    .map(([key, count]) => ({
      key,
      goals: count,
    }))
    .sort((a, b) => b.goals - a.goals)
}

export function getGoalsBySeason(goals: Goal[]): GroupedGoalTotal[] {
  const totals = new Map<string, number>()

  for (const goal of goals) {
    totals.set(goal.season, (totals.get(goal.season) ?? 0) + 1)
  }

  return Array.from(totals.entries())
    .map(([key, count]) => ({
      key,
      goals: count,
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function getGoalsByCompetition(goals: Goal[]): GroupedGoalTotal[] {
  const totals = new Map<string, number>()

  for (const goal of goals) {
    totals.set(
      goal.competition,
      (totals.get(goal.competition) ?? 0) + 1,
    )
  }

  return Array.from(totals.entries())
    .map(([key, count]) => ({
      key,
      goals: count,
    }))
    .sort((a, b) => b.goals - a.goals)
}

export function getGoalsByVenue(goals: Goal[]): GroupedGoalTotal[] {
  const totals = new Map<string, number>()

  for (const goal of goals) {
    totals.set(goal.venue, (totals.get(goal.venue) ?? 0) + 1)
  }

  return Array.from(totals.entries()).map(([key, count]) => ({
    key,
    goals: count,
  }))
}

export function getGoalsByBodyPart(goals: Goal[]): GroupedGoalTotal[] {
  const totals = new Map<string, number>()

  for (const goal of goals) {
    if (goal.bodyPart === null || goal.bodyPart === 'Unknown') {
      continue
    }

    totals.set(goal.bodyPart, (totals.get(goal.bodyPart) ?? 0) + 1)
  }

  return Array.from(totals.entries())
    .map(([key, count]) => ({
      key,
      goals: count,
    }))
    .sort((a, b) => b.goals - a.goals)
}

export function getGoalsAgainstOpponent(goals: Goal[]): GroupedGoalTotal[] {
  const totals = new Map<string, number>()

  for (const goal of goals) {
    totals.set(goal.opponent, (totals.get(goal.opponent) ?? 0) + 1)
  }

  return Array.from(totals.entries())
    .map(([key, count]) => ({
      key,
      goals: count,
    }))
    .sort((a, b) => b.goals - a.goals)
}

export function getCumulativeGoalProgress(
  goals: Goal[],
): CumulativeGoalPoint[] {
  return [...goals]
    .sort(
      (a, b) =>
        a.goalNumber -
        b.goalNumber,
    )
    .map((goal) => ({
      goalNumber:
        goal.goalNumber,
      date: goal.date,
      season: goal.season,
      club: goal.club,
    }))
}

export function getMilestoneStatuses(
  goals: Goal[],
  milestones: Milestone[],
): MilestoneStatus[] {
  const sortedGoals =
    [...goals].sort(
      (a, b) =>
        a.goalNumber -
        b.goalNumber,
    )

  return [...milestones]
    .filter(
      (milestone) =>
        milestone.category ===
        'Career',
    )
    .sort(
      (a, b) =>
        a.threshold -
        b.threshold,
    )
    .map((milestone) => {
      const goal =
        sortedGoals.find(
          (item) =>
            item.goalNumber ===
            milestone.threshold,
        )

      return {
        threshold:
          milestone.threshold,

        title:
          milestone.title,

        reached:
          goal !== undefined,

        goalNumber:
          goal?.goalNumber ??
          null,

        date:
          goal?.date ??
          null,

        club:
          goal?.club ??
          null,

        opponent:
          goal?.opponent ??
          null,
      }
    })
}

export function getPenaltyGoals(
  goals: Goal[],
): number {
  return goals.filter(
    (goal) =>
      goal.penalty,
  ).length
}

export function getNonPenaltyGoals(
  goals: Goal[],
): number {
  return goals.filter(
    (goal) =>
      !goal.penalty,
  ).length
}

export function getHomeGoals(
  goals: Goal[],
): number {
  return goals.filter(
    (goal) =>
      goal.venue === 'Home',
  ).length
}

export function getAwayGoals(
  goals: Goal[],
): number {
  return goals.filter(
    (goal) =>
      goal.venue === 'Away',
  ).length
}