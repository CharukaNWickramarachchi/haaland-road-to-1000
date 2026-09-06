import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Goal } from '../src/types/football'

import {
  getGoalsForSeason,
  getSeasonAnalytics,
  getSeasonSummaries,
  seasonToSlug,
  slugToSeason,
} from '../src/lib/seasons/seasonStats'

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
  matchId: 'match-1',
}

const goals: Goal[] = [
  baseGoal,

  {
    ...baseGoal,
    goalNumber: 2,
    date: '2022-09-01',
    opponent: 'Another FC',
    venue: 'Away',
    penalty: true,
    matchId: 'match-2',
  },

  {
    ...baseGoal,
    goalNumber: 3,
    date: '2023-09-01',
    season: '2023/24',
    opponent: 'Third FC',
    matchId: 'match-3',
  },
]

describe(
  'season statistics',
  () => {
    it(
      'converts season values to URL-safe slugs',
      () => {
        expect(
          seasonToSlug(
            '2022/23',
          ),
        ).toBe('2022-23')

        expect(
          slugToSeason(
            '2022-23',
          ),
        ).toBe('2022/23')
      },
    )

    it(
      'filters goals for one season',
      () => {
        expect(
          getGoalsForSeason(
            goals,
            '2022/23',
          ),
        ).toHaveLength(2)
      },
    )

    it(
      'creates season summaries',
      () => {
        const summaries =
          getSeasonSummaries(
            goals,
          )

        expect(
          summaries[0]
            ?.season,
        ).toBe('2023/24')

        expect(
          summaries[1]
            ?.goals,
        ).toBe(2)
      },
    )

    it(
      'calculates season analytics',
      () => {
        const analytics =
          getSeasonAnalytics(
            goals,
            '2022/23',
          )

        expect(
          analytics.totalGoals,
        ).toBe(2)

        expect(
          analytics.homeGoals,
        ).toBe(1)

        expect(
          analytics.awayGoals,
        ).toBe(1)

        expect(
          analytics.penaltyGoals,
        ).toBe(1)

        expect(
          analytics.opponents,
        ).toBe(2)
      },
    )
  },
)