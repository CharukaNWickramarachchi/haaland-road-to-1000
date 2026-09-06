import {
  describe,
  expect,
  it,
} from 'vitest'

import goalsData from '../data/canonical/goals.json'

import {
  goalSchema,
} from '../src/types/football'

const goals =
  goalsData.map(
    (goal) =>
      goalSchema.parse(goal),
  )

describe(
  'canonical goals dataset',
  () => {
    it(
      'contains a continuous career goal sequence',
      () => {
        goals.forEach(
          (goal, index) => {
            expect(
              goal.goalNumber,
            ).toBe(
              index + 1,
            )
          },
        )
      },
    )

    it(
      'is ordered chronologically',
      () => {
        for (
          let index = 1;
          index <
          goals.length;
          index += 1
        ) {
          const previous =
            goals[index - 1]

          const current =
            goals[index]

          expect(
            current.date >=
              previous.date,
          ).toBe(true)
        }
      },
    )

    it(
      'uses the final row as the latest goal',
      () => {
        const latest =
          goals.at(-1)

        expect(
          latest?.goalNumber,
        ).toBe(
          goals.length,
        )
      },
    )

    it(
      'contains only verified published records',
      () => {
        expect(
          goals.every(
            (goal) =>
              goal.verified,
          ),
        ).toBe(true)
      },
    )
  },
)