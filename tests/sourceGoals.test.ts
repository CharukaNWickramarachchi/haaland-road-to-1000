import { describe, expect, it } from 'vitest'

import sourceGoalsData from '../data/goals.json'
import canonicalGoalsData from '../data/canonical/goals.json'

import { goalSchema } from '../src/types/football'

describe('source goals dataset', () => {
  it('contains only schema-valid source goal records', () => {
    const parsed = goalSchema.array().parse(sourceGoalsData)
    expect(parsed).toHaveLength(sourceGoalsData.length)
  })

  it('stays synchronized in record count with the canonical dataset', () => {
    expect(sourceGoalsData).toHaveLength(canonicalGoalsData.length)
  })
})
