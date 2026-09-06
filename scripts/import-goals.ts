import fs from 'node:fs/promises'
import path from 'node:path'

import { parse } from 'csv-parse/sync'

import {
  goalSchema,
  type Goal,
} from '../src/types/football'

const projectRoot = process.cwd()

const inputPath = path.join(
  projectRoot,
  'data',
  'raw',
  'goals.csv',
)

const outputPath = path.join(
  projectRoot,
  'data',
  'goals.json',
)

interface RawGoalRow {
  goalNumber: string
  date: string
  season: string
  club: string
  opponent: string
  competition: string
  competitionType: string
  venue: string
  minute: string
  addedTimeMinute: string
  scoreAfterGoal: string
  teamResult: string
  goalType: string
  bodyPart: string
  penalty: string
  freeKick: string
  assist: string
  assistType: string
  sourceId: string
  sourceUrl: string
  sourceName: string
  sourcePublishedAt: string
  verified: string
  verificationNotes: string
  matchId: string
}

function nullableString(value: string): string | null {
  const trimmed = value.trim()

  return trimmed === '' ? null : trimmed
}

function nullableNumber(value: string): number | null {
  const trimmed = value.trim()

  if (trimmed === '') {
    return null
  }

  const parsed = Number(trimmed)

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `Expected a number but received "${value}".`,
    )
  }

  return parsed
}

function requiredNumber(
  value: string,
  fieldName: string,
): number {
  const trimmed = value.trim()

  if (trimmed === '') {
    throw new Error(
      `${fieldName} is required.`,
    )
  }

  const parsed = Number(trimmed)

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `${fieldName} must be a number.`,
    )
  }

  return parsed
}

function parseBoolean(
  value: string,
  fieldName: string,
): boolean {
  const normalized = value
    .trim()
    .toLowerCase()

  if (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'yes'
  ) {
    return true
  }

  if (
    normalized === 'false' ||
    normalized === '0' ||
    normalized === 'no'
  ) {
    return false
  }

  throw new Error(
    `${fieldName} must be true or false.`,
  )
}

function transformRow(
  row: RawGoalRow,
  rowNumber: number,
): Goal {
  try {
    const candidate = {
      goalNumber: requiredNumber(
        row.goalNumber,
        'goalNumber',
      ),

      player: 'Erling Haaland' as const,

      date: row.date.trim(),
      season: row.season.trim(),
      club: row.club.trim(),
      opponent: row.opponent.trim(),
      competition: row.competition.trim(),

      competitionType:
        row.competitionType.trim(),

      venue: row.venue.trim(),

      minute: nullableNumber(row.minute),

      addedTimeMinute: nullableNumber(
        row.addedTimeMinute,
      ),

      scoreAfterGoal: nullableString(
        row.scoreAfterGoal,
      ),

      teamResult: nullableString(
        row.teamResult,
      ),

      goalType: nullableString(
        row.goalType,
      ),

      bodyPart: nullableString(
        row.bodyPart,
      ),

      penalty: parseBoolean(
        row.penalty,
        'penalty',
      ),

      freeKick: parseBoolean(
        row.freeKick,
        'freeKick',
      ),

      assist: nullableString(row.assist),

      assistType: nullableString(
        row.assistType,
      ),

      sourceId: nullableString(
        row.sourceId,
      ),

      sourceUrl: nullableString(
        row.sourceUrl,
      ),

      sourceName: nullableString(
        row.sourceName,
      ),

      sourcePublishedAt: nullableString(
        row.sourcePublishedAt,
      ),

      verified: parseBoolean(
        row.verified,
        'verified',
      ),

      verificationNotes: nullableString(
        row.verificationNotes,
      ),

      matchId: nullableString(row.matchId),
    }

    return goalSchema.parse(candidate)
  } catch (error) {
    throw new Error(
      `CSV row ${rowNumber} is invalid: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    )
  }
}

async function main() {
  console.log('')
  console.log('Haaland Road to 1000')
  console.log('Goal Import Pipeline')
  console.log('--------------------')

  const csvText = await fs.readFile(
    inputPath,
    'utf8',
  )

  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawGoalRow[]

  console.log(
    `Raw CSV records: ${rows.length}`,
  )

  const goals = rows.map(
    (row, index) =>
      transformRow(row, index + 2),
  )

  goals.sort(
    (a, b) =>
      a.goalNumber - b.goalNumber,
  )

  await fs.writeFile(
    outputPath,
    `${JSON.stringify(goals, null, 2)}\n`,
    'utf8',
  )

  console.log(
    `Imported goals: ${goals.length}`,
  )

  console.log(
    `Output: ${outputPath}`,
  )

  console.log('')
  console.log('Goal import completed.')
}

main().catch((error: unknown) => {
  console.error('')
  console.error('Goal import failed.')

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})