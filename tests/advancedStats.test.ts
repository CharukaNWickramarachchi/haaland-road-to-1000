import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Goal } from '../src/types/football'

import {
  getAverageGoalMinute,
  getDataCoverage,
  getGoalMinuteBuckets,
  getHatTricks,
  getMedianGoalMinute,
  getMultiGoalMatches,
  getOpponentStats,
} from '../src/lib/analytics/advancedStats'

const baseGoal: Goal = {
  goalNumber: 1,
  player: 'Erling Haaland',
  date: '2022-08-01',
  season: '2022/23',
  club: 'Manchester City',
  opponent: 'Test FC',
  competition:
    'Premier League',
  competitionType: 'League',
  venue: 'Home',
  minute: 10,
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
  matchId: 'match-1',
}

const goals: Goal[] = [
  baseGoal,

  {
    ...baseGoal,
    goalNumber: 2,
    minute: 30,
  },

  {
    ...baseGoal,
    goalNumber: 3,
    minute: 70,
  },

  {
    ...baseGoal,
    goalNumber: 4,
    opponent: 'Other FC',
    date: '2022-09-01',
    minute: null,
    matchId: 'match-2',
  },
]

describe(
  'advanced statistics',
  () => {
    it(
      'creates minute buckets',
      () => {
        const buckets =
          getGoalMinuteBuckets(
            goals,
          )

        expect(
          buckets.find(
            (item) =>
              item.label ===
              '1–15',
          )?.goals,
        ).toBe(1)

        expect(
          buckets.find(
            (item) =>
              item.label ===
              'Unknown',
          )?.goals,
        ).toBe(1)
      },
    )

    it(
      'calculates average and median goal minute',
      () => {
        expect(
          getAverageGoalMinute(
            goals,
          ),
        ).toBeCloseTo(
          36.67,
          1,
        )

        expect(
          getMedianGoalMinute(
            goals,
          ),
        ).toBe(30)
      },
    )

    it(
      'builds opponent rankings',
      () => {
        const opponents =
          getOpponentStats(
            goals,
          )

        expect(
          opponents[0]
            ?.opponent,
        ).toBe('Test FC')

        expect(
          opponents[0]
            ?.goals,
        ).toBe(3)
      },
    )

    it(
      'detects multi-goal and hat-trick matches',
      () => {
        expect(
          getMultiGoalMatches(
            goals,
          ),
        ).toHaveLength(1)

        expect(
          getHatTricks(
            goals,
          ),
        ).toHaveLength(1)
      },
    )

    it(
      'calculates data coverage',
      () => {
        const coverage =
          getDataCoverage(
            goals,
          )

        expect(
          coverage.minuteKnown,
        ).toBe(3)

        expect(
          coverage
            .minuteCoveragePercentage,
        ).toBe(75)
      },
    )
  },
)