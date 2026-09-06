import fs from 'node:fs/promises'
import path from 'node:path'

import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const HEADERS = [
  'goalNumber',
  'date',
  'season',
  'club',
  'opponent',
  'competition',
  'competitionType',
  'venue',
  'minute',
  'addedTimeMinute',
  'scoreAfterGoal',
  'teamResult',
  'goalType',
  'bodyPart',
  'penalty',
  'freeKick',
  'assist',
  'assistType',
  'sourceId',
  'sourceUrl',
  'sourceName',
  'sourcePublishedAt',
  'verified',
  'verificationNotes',
  'matchId',
] as const

interface GoalRow {
  [key: string]: string
}

async function main() {
  const batchFile = process.argv[2]

  if (!batchFile) {
    throw new Error(
      'Provide a staging CSV path. Example: npm run append-goals -- data/raw/salzburg-goals.csv',
    )
  }

  const projectRoot = process.cwd()

  const canonicalPath = path.join(
    projectRoot,
    'data',
    'raw',
    'goals.csv',
  )

  const stagingPath = path.resolve(
    projectRoot,
    batchFile,
  )

  console.log('')
  console.log('Haaland Road to 1000')
  console.log('Goal Batch Appender')
  console.log('-------------------')

  const [canonicalText, stagingText] =
    await Promise.all([
      fs.readFile(canonicalPath, 'utf8'),
      fs.readFile(stagingPath, 'utf8'),
    ])

  const canonicalRows = parse(
    canonicalText,
    {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    },
  ) as GoalRow[]

  const stagingRows = parse(
    stagingText,
    {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    },
  ) as GoalRow[]

  const existingNumbers = canonicalRows
    .map((row) => Number(row.goalNumber))
    .filter(Number.isFinite)

  const highestGoalNumber =
    existingNumbers.length > 0
      ? Math.max(...existingNumbers)
      : 0

  console.log(
    `Existing canonical goals: ${canonicalRows.length}`,
  )

  console.log(
    `Incoming staging goals: ${stagingRows.length}`,
  )

  console.log(
    `Current highest goal number: ${highestGoalNumber}`,
  )

  const incomingWithNumbers =
    stagingRows.map((row, index) => ({
      goalNumber: String(
        highestGoalNumber + index + 1,
      ),
      ...row,
    }))

  const combined = [
    ...canonicalRows,
    ...incomingWithNumbers,
  ]

  const csvOutput = stringify(
    combined,
    {
      header: true,
      columns: [...HEADERS],
    },
  )

  await fs.writeFile(
    canonicalPath,
    csvOutput,
    'utf8',
  )

  console.log(
    `New canonical total: ${combined.length}`,
  )

  if (incomingWithNumbers.length > 0) {
    console.log(
      `Assigned goal numbers: ${
        highestGoalNumber + 1
      }–${combined.length}`,
    )
  }

  console.log('')
  console.log(
    'Batch appended successfully.',
  )
}

main().catch((error: unknown) => {
  console.error('')
  console.error('Batch append failed.')

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})