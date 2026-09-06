import fs from 'node:fs/promises'
import path from 'node:path'

import {
  goalSchema,
} from '../src/types/football'

const GOALS_PATH =
  path.join(
    process.cwd(),
    'data',
    'canonical',
    'goals.json',
  )

const VERSION_PATH =
  path.join(
    process.cwd(),
    'data',
    'data-version.json',
  )

interface DataVersion {
  version: string
  lastUpdated: string
  lastVerified: string
  latestGoalNumber:
    | number
    | null
  methodologyVersion: string
  datasetMode: string
}

async function main() {
  const goalsText =
    await fs.readFile(
      GOALS_PATH,
      'utf8',
    )

  const rawGoals =
    JSON.parse(
      goalsText,
    ) as unknown[]

  const goals =
    rawGoals.map(
      (record) =>
        goalSchema.parse(
          record,
        ),
    )

  const versionText =
    await fs.readFile(
      VERSION_PATH,
      'utf8',
    )

  const version =
    JSON.parse(
      versionText,
    ) as DataVersion

  const latest =
    goals.at(-1)

  version.latestGoalNumber =
    latest?.goalNumber ??
    null

  version.lastUpdated =
    new Date()
      .toISOString()
      .slice(0, 10)

  /*
   * If a newly verified goal is later
   * than the existing verification
   * cutoff, advance the cutoff to at
   * least that goal's date.
   *
   * We do not automatically advance it
   * beyond the latest verified event.
   */
  if (
    latest &&
    latest.date >
      version.lastVerified
  ) {
    version.lastVerified =
      latest.date
  }

  await fs.writeFile(
    VERSION_PATH,
    JSON.stringify(
      version,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log('')
  console.log(
    'Data version synchronized.',
  )

  console.log(
    `Latest goal number: ${version.latestGoalNumber ?? 'N/A'}`,
  )

  console.log(
    `Last verified: ${version.lastVerified}`,
  )
}

main().catch(
  (error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)