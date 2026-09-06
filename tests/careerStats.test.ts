import { describe, expect, it } from 'vitest'

import type { Goal, Milestone } from '../src/types/football'

import {
  getCareerGoals,
  getClubGoals,
  getGoalsByClub,
  getGoalsBySeason,
  getInternationalGoals,
  getLatestGoal,
  getNextMilestone,
  getProgressStats,
  getUnverifiedGoals,
  getVerifiedGoals,
  getAwayGoals,
  getCumulativeGoalProgress,
  getHomeGoals,
  getMilestoneStatuses,
  getNonPenaltyGoals,
  getPenaltyGoals,
} from '../src/lib/statistics'

const goals: Goal[] = [
  {
    goalNumber: 1,
    player: 'Erling Haaland',
    date: '2020-01-01',
    season: '2019/2020',
    club: 'Borussia Dortmund',
    opponent: 'Test FC',
    competition: 'Bundesliga',
    competitionType: 'League',
    venue: 'Home',
    minute: 20,
    addedTimeMinute: null,
    scoreAfterGoal: '1-0',
    teamResult: 'W',
    goalType: 'Open Play',
    bodyPart: 'Left Foot',
    penalty: false,
    freeKick: false,
    assist: null,
    assistType: null,
    sourceId: 'source-1',
    sourceUrl: 'https://example.com/1',
    sourceName: 'Example Source',
    sourcePublishedAt: '2020-01-01',
    verified: true,
    verificationNotes: null,
    matchId: 'match-1',
  },
  {
    goalNumber: 2,
    player: 'Erling Haaland',
    date: '2020-02-01',
    season: '2019/2020',
    club: 'Norway',
    opponent: 'Test Country',
    competition: 'International',
    competitionType: 'International',
    venue: 'Away',
    minute: 55,
    addedTimeMinute: null,
    scoreAfterGoal: null,
    teamResult: 'D',
    goalType: 'Header',
    bodyPart: 'Head',
    penalty: false,
    freeKick: false,
    assist: null,
    assistType: null,
    sourceId: null,
    sourceUrl: null,
    sourceName: null,
    sourcePublishedAt: null,
    verified: false,
    verificationNotes: 'Test-only record',
    matchId: 'match-2',
  },
  {
    goalNumber: 3,
    player: 'Erling Haaland',
    date: '2021-03-01',
    season: '2020/2021',
    club: 'Manchester City',
    opponent: 'Another FC',
    competition: 'Premier League',
    competitionType: 'League',
    venue: 'Home',
    minute: 70,
    addedTimeMinute: null,
    scoreAfterGoal: '2-0',
    teamResult: 'W',
    goalType: 'Open Play',
    bodyPart: 'Right Foot',
    penalty: false,
    freeKick: false,
    assist: null,
    assistType: null,
    sourceId: 'source-2',
    sourceUrl: 'https://example.com/2',
    sourceName: 'Example Source',
    sourcePublishedAt: '2021-03-01',
    verified: true,
    verificationNotes: null,
    matchId: 'match-3',
  },
]

const milestones: Milestone[] = [
  {
    threshold: 2,
    title: '2 Career Goals',
    description: null,
    category: 'Career',
    autoCalculate: true,
  },
  {
    threshold: 4,
    title: '4 Career Goals',
    description: null,
    category: 'Career',
    autoCalculate: true,
  },
  {
    threshold: 5,
    title: '5 Career Goals',
    description: null,
    category: 'Career',
    autoCalculate: true,
  },
]

describe('career statistics', () => {
  it('counts verified career goals only', () => {
    expect(getCareerGoals(goals)).toBe(2)
  })

  it('separates verified and unverified goals', () => {
    expect(getVerifiedGoals(goals)).toHaveLength(2)
    expect(getUnverifiedGoals(goals)).toHaveLength(1)
  })

  it('separates club and senior international goals', () => {
    expect(getClubGoals(goals)).toBe(2)
    expect(getInternationalGoals(goals)).toBe(1)
  })

  it('calculates verified progress toward a target', () => {
    const progress = getProgressStats(goals, 10)

    expect(progress.currentGoals).toBe(2)
    expect(progress.remainingGoals).toBe(8)
    expect(progress.progressPercentage).toBe(20)
  })

  it('finds the next milestone strictly above the current total', () => {
    const nextMilestone = getNextMilestone(goals, milestones)

    expect(nextMilestone).toEqual({
      threshold: 4,
      title: '4 Career Goals',
      goalsRemaining: 2,
    })
  })

  it('finds the latest goal by goal number', () => {
    expect(getLatestGoal(goals)?.goalNumber).toBe(3)
  })

  it('groups goals by club', () => {
    expect(getGoalsByClub(goals)).toEqual([
      { key: 'Borussia Dortmund', goals: 1 },
      { key: 'Norway', goals: 1 },
      { key: 'Manchester City', goals: 1 },
    ])
  })

  it('groups goals by season', () => {
    expect(getGoalsBySeason(goals)).toEqual([
      { key: '2019/2020', goals: 2 },
      { key: '2020/2021', goals: 1 },
    ])
  })

  it('returns zero progress safely for an empty dataset', () => {
    expect(getProgressStats([], 1000)).toEqual({
      currentGoals: 0,
      targetGoals: 1000,
      remainingGoals: 1000,
      progressPercentage: 0,
    })
  })

  it('builds cumulative career progress', () => {
  const progress =
    getCumulativeGoalProgress(
      goals,
    )

  expect(progress).toEqual([
    {
      goalNumber: 1,
      date: '2020-01-01',
      season: '2019/2020',
      club:
        'Borussia Dortmund',
    },
    {
      goalNumber: 2,
      date: '2020-02-01',
      season: '2019/2020',
      club: 'Norway',
    },
    {
      goalNumber: 3,
      date: '2021-03-01',
      season: '2020/2021',
      club:
        'Manchester City',
    },
  ])
})

it('calculates milestone status from canonical goal numbers', () => {
  const status =
    getMilestoneStatuses(
      goals,
      milestones,
    )

  expect(status[0]).toMatchObject({
    threshold: 2,
    reached: true,
    goalNumber: 2,
  })

  expect(status[1]).toMatchObject({
    threshold: 4,
    reached: false,
    goalNumber: null,
  })
})

it('counts penalty and non-penalty goals', () => {
  const penaltyGoal = {
    ...goals[0],
    penalty: true,
  }

  const sample = [
    penaltyGoal,
    goals[1],
    goals[2],
  ]

  expect(
    getPenaltyGoals(sample),
  ).toBe(1)

  expect(
    getNonPenaltyGoals(
      sample,
    ),
  ).toBe(2)
})

it('counts home and away goals', () => {
  expect(
    getHomeGoals(goals),
  ).toBe(2)

  expect(
    getAwayGoals(goals),
  ).toBe(1)
})
})