import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Goal } from '../src/types/football'

import {
  clubToSlug,
  getClubAnalytics,
  getClubFromSlug,
  getClubSummaries,
  getGoalsForClub,
} from '../src/lib/clubs/clubStats'

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
    club: 'Norway',
    opponent: 'Test Country',
    competition:
      'UEFA Nations League',
    competitionType:
      'International',
    matchId: 'match-3',
  },
]

describe(
  'club statistics',
  () => {
    it(
      'creates URL-safe club slugs',
      () => {
        expect(
          clubToSlug(
            'Manchester City',
          ),
        ).toBe(
          'manchester-city',
        )
      },
    )

    it(
      'finds club from slug',
      () => {
        expect(
          getClubFromSlug(
            goals,
            'norway',
          ),
        ).toBe('Norway')
      },
    )

    it(
      'filters goals for one club',
      () => {
        expect(
          getGoalsForClub(
            goals,
            'Manchester City',
          ),
        ).toHaveLength(2)
      },
    )

    it(
      'creates club summaries',
      () => {
        const summaries =
          getClubSummaries(
            goals,
          )

        expect(
          summaries[0]
            ?.club,
        ).toBe(
          'Manchester City',
        )

        expect(
          summaries[0]
            ?.goals,
        ).toBe(2)
      },
    )

    it(
      'calculates club analytics',
      () => {
        const analytics =
          getClubAnalytics(
            goals,
            'Manchester City',
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
          analytics.firstGoal
            ?.goalNumber,
        ).toBe(1)

        expect(
          analytics.latestGoal
            ?.goalNumber,
        ).toBe(2)
      },
    )
  },
)