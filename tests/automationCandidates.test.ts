import { describe, expect, it } from 'vitest'

import candidateData from '../data/incoming/goal-candidates.json'

import { goalCandidateSchema } from '../src/types/football'

describe('automation candidate audit data', () => {
  it('contains only schema-valid candidate records', () => {
    const parsed = goalCandidateSchema.array().parse(candidateData)
    expect(parsed).toHaveLength(candidateData.length)
  })
})
