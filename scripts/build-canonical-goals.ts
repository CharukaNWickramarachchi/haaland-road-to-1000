import fs from 'node:fs/promises'
import path from 'node:path'

import { goalSchema, type Goal } from '../src/types/football'

const INPUT_PATH = path.join(
  process.cwd(),
  'data',
  'goals.json',
)

const OUTPUT_PATH = path.join(
  process.cwd(),
  'data',
  'canonical',
  'goals.json',
)

type ExistingGoal = Goal

function normalizeText(
  value: string,
): string {
  return value
    .replace(/\s+/g, ' ')
    .trim()
}

function getMatchKey(
  goal: ExistingGoal,
): string {
  if (goal.matchId) {
    return goal.matchId
  }

  return [
    goal.date,
    goal.club,
    goal.opponent,
    goal.competition,
  ].join('|')
}

function compareGoals(
  a: ExistingGoal,
  b: ExistingGoal,
): number {
  // 1. Actual match date
  const dateComparison =
    a.date.localeCompare(b.date)

  if (dateComparison !== 0) {
    return dateComparison
  }

  // 2. Match identity
  const matchComparison =
    getMatchKey(a).localeCompare(
      getMatchKey(b),
    )

  if (matchComparison !== 0) {
    return matchComparison
  }

  // 3. Regulation / extra-time minute
  if (
    a.minute !== null &&
    b.minute !== null
  ) {
    if (a.minute !== b.minute) {
      return a.minute - b.minute
    }

    const aAdded =
      a.addedTimeMinute ?? 0

    const bAdded =
      b.addedTimeMinute ?? 0

    if (aAdded !== bAdded) {
      return aAdded - bAdded
    }
  }

  if (
    a.minute !== null &&
    b.minute === null
  ) {
    return -1
  }

  if (
    a.minute === null &&
    b.minute !== null
  ) {
    return 1
  }

  /*
   * Migration fallback.
   *
   * Some historical records do not have
   * minute information. Their existing
   * career number preserves the known
   * historical order.
   */
  return (
    a.goalNumber -
    b.goalNumber
  )
}

function createDuplicateFingerprint(
  goal: ExistingGoal,
): string {
  return [
    goal.date,
    normalizeText(goal.club),
    normalizeText(goal.opponent),
    normalizeText(
      goal.competition,
    ),
    goal.minute ?? '',
    goal.addedTimeMinute ?? '',
    goal.penalty,
    goal.freeKick,
    goal.matchId ?? '',
  ].join('|')
}

function checkDuplicates(
  goals: ExistingGoal[],
) {
  const seen =
    new Map<string, number>()

  for (const goal of goals) {
    const fingerprint =
      createDuplicateFingerprint(
        goal,
      )

    const existing =
      seen.get(fingerprint)

    if (
      existing !== undefined
    ) {
      throw new Error(
        [
          'Possible duplicate goal detected.',
          `Existing goal number: ${existing}`,
          `Duplicate goal number: ${goal.goalNumber}`,
          `Date: ${goal.date}`,
          `Club: ${goal.club}`,
          `Opponent: ${goal.opponent}`,
          `Minute: ${goal.minute ?? 'unknown'}`,
        ].join('\n'),
      )
    }

    seen.set(
      fingerprint,
      goal.goalNumber,
    )
  }
}

function validateSequence(
  goals: Goal[],
) {
  for (
    let index = 0;
    index < goals.length;
    index += 1
  ) {
    const expected =
      index + 1

    if (
      goals[index].goalNumber !==
      expected
    ) {
      throw new Error(
        `Invalid canonical sequence at index ${index}. Expected goal #${expected}.`,
      )
    }
  }
}

async function main() {
  console.log('')
  console.log(
    'Haaland Road to 1000',
  )
  console.log(
    'Canonical Goal Builder',
  )
  console.log(
    '----------------------',
  )

  const raw =
    await fs.readFile(
      INPUT_PATH,
      'utf8',
    )

  const parsed =
    JSON.parse(raw) as unknown[]

  console.log(
    `Input records: ${parsed.length}`,
  )

  const validated =
    parsed.map(
      (record, index) => {
        const result =
          goalSchema.safeParse(
            record,
          )

        if (!result.success) {
          console.error('')
          console.error(
            `Invalid source record at index ${index}`,
          )

          console.error(
            result.error.flatten(),
          )

          throw new Error(
            'Source goal validation failed.',
          )
        }

        return result.data
      },
    )

  checkDuplicates(validated)

  const sorted =
    [...validated].sort(
      compareGoals,
    )

  const canonical: Goal[] =
    sorted.map(
      (goal, index) => ({
        ...goal,

        /*
         * goalNumber is DERIVED here.
         * It is no longer trusted from
         * the source dataset.
         */
        goalNumber:
          index + 1,
      }),
    )

  validateSequence(canonical)

  /*
   * Re-run Zod against the final output.
   */
  for (
    let index = 0;
    index <
    canonical.length;
    index += 1
  ) {
    const result =
      goalSchema.safeParse(
        canonical[index],
      )

    if (!result.success) {
      throw new Error(
        `Canonical record #${index + 1} failed schema validation.`,
      )
    }
  }

  await fs.mkdir(
    path.dirname(
      OUTPUT_PATH,
    ),
    {
      recursive: true,
    },
  )

  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify(
      canonical,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  const first =
    canonical[0]

  const latest =
    canonical.at(-1)

  console.log('')
  console.log(
    `Canonical records: ${canonical.length}`,
  )

  console.log(
    `First goal: #${first?.goalNumber} — ${first?.date}`,
  )

  console.log(
    `Latest goal: #${latest?.goalNumber} — ${latest?.date}`,
  )

  console.log('')
  console.log(
    `Created: ${OUTPUT_PATH}`,
  )

  console.log('')
  console.log(
    '✓ Canonical goal dataset built successfully.',
  )
}

main().catch(
  (error: unknown) => {
    console.error('')
    console.error(
      'Canonical build failed.',
    )

    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)