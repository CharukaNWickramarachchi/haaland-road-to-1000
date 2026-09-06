import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Goal } from '../src/types/football'

import {
  competitionToSlug,
  getCompetitionAnalytics,
  getCompetitionFromSlug,
  getCompetitionSummaries,
  getGoalsForCompetition,
} from '../src/lib/competitions/competitionStats'

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
    competition:
      'UEFA Champions League',
    competitionType:
      'Continental',
    matchId: 'match-3',
  },
]

describe(
  'competition statistics',
  () => {
    it(
      'creates URL-safe slugs',
      () => {
        expect(
          competitionToSlug(
            'UEFA Champions League',
          ),
        ).toBe(
          'uefa-champions-league',
        )
      },
    )

    it(
      'finds competition names from slugs',
      () => {
        expect(
          getCompetitionFromSlug(
            goals,
            'premier-league',
          ),
        ).toBe(
          'Premier League',
        )
      },
    )

    it(
      'filters competition goals',
      () => {
        expect(
          getGoalsForCompetition(
            goals,
            'Premier League',
          ),
        ).toHaveLength(2)
      },
    )

    it(
      'creates competition summaries',
      () => {
        const summaries =
          getCompetitionSummaries(
            goals,
          )

        expect(
          summaries[0]
            ?.competition,
        ).toBe(
          'Premier League',
        )

        expect(
          summaries[0]
            ?.goals,
        ).toBe(2)
      },
    )

    it(
      'calculates competition analytics',
      () => {
        const analytics =
          getCompetitionAnalytics(
            goals,
            'Premier League',
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
      },
    )
  },
)