import {
  describe,
  expect,
  it,
} from 'vitest'

import type { Goal } from '../src/types/football'

import {
  DEFAULT_GOAL_FILTERS,
  filterGoals,
} from '../src/lib/goals/filterGoals'

const goals: Goal[] = [
  {
    goalNumber: 1,
    player: 'Erling Haaland',
    date: '2020-01-01',
    season: '2019/20',
    club: 'Borussia Dortmund',
    opponent: 'Test FC',
    competition: 'Bundesliga',
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
  },
  {
    goalNumber: 2,
    player: 'Erling Haaland',
    date: '2021-01-01',
    season: '2020/21',
    club: 'Norway',
    opponent: 'Another Team',
    competition:
      'UEFA Nations League',
    competitionType:
      'International',
    venue: 'Away',
    minute: 55,
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
    matchId: 'match-2',
  },
]

describe(
  'goal filtering',
  () => {
    it(
      'returns all goals with default filters',
      () => {
        expect(
          filterGoals(
            goals,
            DEFAULT_GOAL_FILTERS,
          ),
        ).toHaveLength(2)
      },
    )

    it(
      'filters by club',
      () => {
        expect(
          filterGoals(
            goals,
            {
              ...DEFAULT_GOAL_FILTERS,
              club: 'Norway',
            },
          ),
        ).toHaveLength(1)
      },
    )

    it(
      'searches opponent names',
      () => {
        const result =
          filterGoals(
            goals,
            {
              ...DEFAULT_GOAL_FILTERS,
              search:
                'Another Team',
            },
          )

        expect(
          result[0]
            ?.goalNumber,
        ).toBe(2)
      },
    )

    it(
      'searches goal numbers',
      () => {
        const result =
          filterGoals(
            goals,
            {
              ...DEFAULT_GOAL_FILTERS,
              search: '1',
            },
          )

        expect(
          result.some(
            (goal) =>
              goal.goalNumber ===
              1,
          ),
        ).toBe(true)
      },
    )
  },
)