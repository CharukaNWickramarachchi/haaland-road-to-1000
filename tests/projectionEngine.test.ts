import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Goal } from '../src/types/football'

import {
  buildProjectionScenarios,
  createProjectionScenario,
  getCareerGoalRate,
  getInterGoalIntervals,
  getRecentGoalRate,
  runMonteCarloProjection,
} from '../src/lib/projection/projectionEngine'

function makeGoal(
  goalNumber: number,
  date: string,
): Goal {
  return {
    goalNumber,
    player:
      'Erling Haaland',
    date,
    season: '2022/23',
    club:
      'Manchester City',
    opponent:
      `Opponent ${goalNumber}`,
    competition:
      'Premier League',
    competitionType:
      'League',
    venue: 'Home',
    minute: 20,
    addedTimeMinute: null,
    scoreAfterGoal: null,
    teamResult: 'W',
    goalType: null,
    bodyPart: null,
    penalty: false,
    freeKick: false,
    assist: null,
    assistType: null,
    sourceId: 'test',
    sourceUrl:
      'https://example.com',
    sourceName: 'Test',
    sourcePublishedAt: null,
    verified: true,
    verificationNotes: null,
    matchId:
      `match-${goalNumber}`,
  }
}

const goals = [
  makeGoal(
    1,
    '2022-01-01',
  ),
  makeGoal(
    2,
    '2022-01-11',
  ),
  makeGoal(
    3,
    '2022-01-21',
  ),
  makeGoal(
    4,
    '2022-01-31',
  ),
]

describe(
  'projection engine',
  () => {
    it(
      'calculates a career goal rate',
      () => {
        const rate =
          getCareerGoalRate(
            goals,
          )

        expect(rate).not.toBeNull()

        expect(
          rate?.goalsPerDay,
        ).toBeCloseTo(
          0.1,
        )
      },
    )

    it(
      'calculates recent goal rate',
      () => {
        const rate =
          getRecentGoalRate(
            goals,
            3,
          )

        expect(rate).not.toBeNull()

        expect(
          rate?.goalsPerDay,
        ).toBeCloseTo(
          0.1,
        )
      },
    )

    it(
      'creates a projection scenario',
      () => {
        const scenario =
          createProjectionScenario(
            'Test',
            'Testing',
            50,
            500,
            1000,
            '2026-01-01',
          )

        expect(
          scenario.remainingGoals,
        ).toBe(500)

        expect(
          scenario.estimatedYears,
        ).toBe(10)

        expect(
          scenario.projectedDate,
        ).not.toBeNull()
      },
    )

    it(
      'extracts inter-goal intervals',
      () => {
        expect(
          getInterGoalIntervals(
            goals,
          ),
        ).toEqual([
          10,
          10,
          10,
        ])
      },
    )

    it(
      'builds career, recent and blended scenarios',
      () => {
        const scenarios =
          buildProjectionScenarios(
            goals,
            {
              targetGoals: 1000,
              recentGoalWindow: 3,
              careerWeight: 0.4,
              recentWeight: 0.6,
              rateMultiplier: 1,
            },
          )

        expect(
          scenarios,
        ).toHaveLength(3)

        expect(
          scenarios.map(
            (item) =>
              item.name,
          ),
        ).toEqual([
          'Career Rate',
          'Recent Form',
          'Weighted Blend',
        ])
      },
    )

    it(
      'runs deterministic Monte Carlo simulations',
      () => {
        const result =
          runMonteCarloProjection(
            goals,
            10,
            1000,
            4,
            1,
            42,
          )

        expect(
          result.simulations,
        ).toBe(1000)

        expect(
          result.remainingGoals,
        ).toBe(6)

        expect(
          result.medianDate,
        ).not.toBeNull()

        expect(
          result.percentile10Date,
        ).not.toBeNull()

        expect(
          result.percentile90Date,
        ).not.toBeNull()
      },
    )
  },
)