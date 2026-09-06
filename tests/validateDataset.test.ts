import { describe, expect, it } from 'vitest'

import type {
  FootballDataset,
  Goal,
} from '../src/types/football'

import { validateDataset } from '../src/services/validation/validateDataset'

const baseGoal: Goal = {
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
  sourceUrl: 'https://example.com/goal',
  sourceName: 'Example',
  sourcePublishedAt: '2020-01-01',
  verified: true,
  verificationNotes: null,
  matchId: 'match-1',
}

function createDataset(
  goals: Goal[],
  latestGoalNumber: number | null,
): FootballDataset {
  return {
    goals,
    matches: [],
    clubs: [],
    competitions: [],
    milestones: [],
    sources: [
      {
        id: 'source-1',
        name: 'Example Source',
        url: 'https://example.com',
        sourceType: 'Official Club',
        purpose: 'Testing',
        coverage: 'Test dataset',
        lastVerified: '2026-08-31',
        notes: null,
      },
    ],
    dataVersion: {
      version: '0.1.0',
      lastUpdated: '2026-08-31',
      lastVerified: '2026-08-31',
      latestGoalNumber,
      methodologyVersion: '1.0',
      datasetMode: 'VERIFIED',
    },
  }
}

describe('dataset validation', () => {
  it('accepts an empty dataset with a null latest goal number', () => {
    const result = validateDataset(
      createDataset([], null),
    )

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('accepts a valid sequential dataset', () => {
    const secondGoal: Goal = {
      ...baseGoal,
      goalNumber: 2,
      date: '2020-01-02',
      opponent: 'Another FC',
      minute: 35,
      matchId: 'match-2',
    }

    const result = validateDataset(
      createDataset(
        [baseGoal, secondGoal],
        2,
      ),
    )

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects duplicate goal numbers', () => {
    const duplicate: Goal = {
      ...baseGoal,
      opponent: 'Different FC',
      matchId: 'match-2',
    }

    const result = validateDataset(
      createDataset(
        [baseGoal, duplicate],
        1,
      ),
    )

    expect(
      result.errors.some(
        (issue) =>
          issue.code === 'DUPLICATE_GOAL_NUMBER',
      ),
    ).toBe(true)
  })

  it('detects a gap in the goal sequence', () => {
    const thirdGoal: Goal = {
      ...baseGoal,
      goalNumber: 3,
      date: '2020-01-03',
      matchId: 'match-3',
    }

    const result = validateDataset(
      createDataset(
        [baseGoal, thirdGoal],
        3,
      ),
    )

    expect(
      result.errors.some(
        (issue) =>
          issue.code === 'GOAL_SEQUENCE_GAP',
      ),
    ).toBe(true)
  })

  it('detects possible duplicate goal records', () => {
    const duplicateGoal: Goal = {
      ...baseGoal,
      goalNumber: 2,
    }

    const result = validateDataset(
      createDataset(
        [baseGoal, duplicateGoal],
        2,
      ),
    )

    expect(
      result.errors.some(
        (issue) =>
          issue.code ===
          'POSSIBLE_DUPLICATE_GOAL',
      ),
    ).toBe(true)
  })

  it('rejects a verified goal without source evidence', () => {
    const goalWithoutSource: Goal = {
      ...baseGoal,
      sourceId: null,
      sourceUrl: null,
    }

    const result = validateDataset(
      createDataset(
        [goalWithoutSource],
        1,
      ),
    )

    expect(
      result.errors.some(
        (issue) =>
          issue.code ===
          'VERIFIED_GOAL_WITHOUT_SOURCE',
      ),
    ).toBe(true)
  })

  it('detects an unknown source reference', () => {
    const goal: Goal = {
      ...baseGoal,
      sourceId: 'missing-source',
    }

    const result = validateDataset(
      createDataset(
        [goal],
        1,
      ),
    )

    expect(
      result.errors.some(
        (issue) =>
          issue.code === 'UNKNOWN_SOURCE_ID',
      ),
    ).toBe(true)
  })

  it('detects disagreement with latestGoalNumber', () => {
    const secondGoal: Goal = {
      ...baseGoal,
      goalNumber: 2,
      date: '2020-01-02',
      opponent: 'Another FC',
      matchId: 'match-2',
    }

    const result = validateDataset(
      createDataset(
        [baseGoal, secondGoal],
        1,
      ),
    )

    expect(
      result.errors.some(
        (issue) =>
          issue.code ===
          'LATEST_GOAL_NUMBER_MISMATCH',
      ),
    ).toBe(true)
  })
})