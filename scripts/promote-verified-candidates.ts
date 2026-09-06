import fs from 'node:fs/promises'
import path from 'node:path'

import {
  goalCandidateSchema,
  goalSchema,
  type Goal,
  type GoalCandidate,
} from '../src/types/football'

const SOURCE_GOALS_PATH =
  path.join(
    process.cwd(),
    'data',
    'goals.json',
  )

const CANDIDATES_PATH =
  path.join(
    process.cwd(),
    'data',
    'incoming',
    'goal-candidates.json',
  )

const DATA_VERSION_PATH =
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

function todayUtc(): string {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

function getSeason(
  date: string,
): string {
  const parsed =
    new Date(
      `${date}T00:00:00Z`,
    )

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    throw new Error(
      `Invalid candidate date "${date}".`,
    )
  }

  const year =
    parsed.getUTCFullYear()

  const month =
    parsed.getUTCMonth() + 1

  if (month >= 7) {
    return `${year}/${String(
      year + 1,
    ).slice(-2)}`
  }

  return `${year - 1}/${String(
    year,
  ).slice(-2)}`
}

function createGoalFingerprint(
  goal: {
    date: string
    club: string
    opponent: string
    competition: string
    minute: number | null
    addedTimeMinute:
      | number
      | null
  },
): string {
  return [
    goal.date,
    goal.club.trim(),
    goal.opponent.trim(),
    goal.competition.trim(),
    goal.minute ?? '',
    goal.addedTimeMinute ?? '',
  ].join('|')
}

function candidateToGoal(
  candidate: GoalCandidate,
  temporaryGoalNumber: number,
): Goal {
  const detail =
    candidate.providerDetail
      ?.trim()
      .toLowerCase() ??
    ''

  const penalty =
    candidate.penalty

  const freeKick =
    detail.includes(
      'free kick',
    )
      ? true
      : null

  const goalType =
    penalty
      ? 'Penalty'
      : freeKick
        ? 'Free Kick'
        : null

  const matchId = [
    'api-football',
    candidate.providerFixtureId,
  ].join('-')

  return goalSchema.parse({
    /*
     * Temporary only.
     *
     * build-canonical will later
     * regenerate the entire sequence.
     */
    goalNumber:
      temporaryGoalNumber,

    player:
      'Erling Haaland',

    date:
      candidate.date,

    season:
      getSeason(
        candidate.date,
      ),

    club:
      candidate.club,

    opponent:
      candidate.opponent,

    competition:
      candidate.competition,

    competitionType:
      candidate.competitionType,

    venue:
      candidate.venue,

    minute:
      candidate.minute,

    addedTimeMinute:
      candidate.addedTimeMinute,

    scoreAfterGoal:
      null,

    teamResult:
      null,

    goalType,

    bodyPart:
      null,

    penalty,

    freeKick,

    assist:
      null,

    assistType:
      null,

    sourceId:
      'api-football-live-events',

    sourceUrl:
      candidate.sourceUrl,

    sourceName:
      candidate.sourceName,

    sourcePublishedAt:
      null,

    verified:
      true,

    verificationNotes:
      [
        'Automatically discovered through API-Football.',
        'Candidate was reviewed and explicitly marked verified before canonical promotion.',
        candidate.providerDetail
          ? `Provider detail: ${candidate.providerDetail}.`
          : null,
        candidate.notes,
      ]
        .filter(Boolean)
        .join(' '),

    matchId,
  })
}

async function loadGoals():
  Promise<Goal[]> {
  const text =
    await fs.readFile(
      SOURCE_GOALS_PATH,
      'utf8',
    )

  const raw =
    JSON.parse(text) as unknown[]

  return raw.map(
    (record) =>
      goalSchema.parse(
        record,
      ),
  )
}

async function loadCandidates():
  Promise<GoalCandidate[]> {
  try {
    const text =
      await fs.readFile(
        CANDIDATES_PATH,
        'utf8',
      )

    const raw =
      JSON.parse(text) as unknown[]

    return raw.map(
      (record) =>
        goalCandidateSchema.parse(
          record,
        ),
    )
  } catch (
    error
  ) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return []
    }

    throw error
  }
}

async function loadDataVersion():
  Promise<DataVersion> {
  const text =
    await fs.readFile(
      DATA_VERSION_PATH,
      'utf8',
    )

  return JSON.parse(
    text,
  ) as DataVersion
}

async function main() {
  console.log('')
  console.log(
    'Haaland Road to 1000',
  )

  console.log(
    'Verified Candidate Promotion',
  )

  console.log(
    '----------------------------',
  )

  const goals =
    await loadGoals()

  const candidates =
    await loadCandidates()

  const verified =
    candidates.filter(
      (candidate) =>
        candidate.status ===
        'verified',
    )

  console.log(
    `Existing source goals: ${goals.length}`,
  )

  console.log(
    `Candidates: ${candidates.length}`,
  )

  console.log(
    `Verified candidates: ${verified.length}`,
  )

  if (
    verified.length === 0
  ) {
    console.log('')
    console.log(
      '✓ Nothing to promote.',
    )

    return
  }

  const fingerprints =
    new Set(
      goals.map(
        createGoalFingerprint,
      ),
    )

  const promoted:
    Goal[] = []

  for (
    const candidate
    of verified
  ) {
    const fingerprint =
      createGoalFingerprint(
        candidate,
      )

    if (
      fingerprints.has(
        fingerprint,
      )
    ) {
      console.log(
        `Skipping duplicate candidate: ${candidate.date} ${candidate.club} vs ${candidate.opponent}`,
      )

      continue
    }

    const temporaryNumber =
      goals.length +
      promoted.length +
      1

    const goal =
      candidateToGoal(
        candidate,
        temporaryNumber,
      )

    promoted.push(goal)

    fingerprints.add(
      fingerprint,
    )
  }

  if (
    promoted.length === 0
  ) {
    console.log('')
    console.log(
      '✓ Verified candidates were already present.',
    )

    return
  }

  const combined = [
    ...goals,
    ...promoted,
  ]

  await fs.writeFile(
    SOURCE_GOALS_PATH,
    JSON.stringify(
      combined,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  /*
   * Mark successfully promoted
   * candidates so they cannot be
   * promoted repeatedly.
   */
  const promotedFingerprints =
    new Set(
      promoted.map(
        createGoalFingerprint,
      ),
    )

  const updatedCandidates =
    candidates.map(
      (candidate) => {
        if (
          promotedFingerprints.has(
            createGoalFingerprint(
              candidate,
            ),
          )
        ) {
          return {
            ...candidate,
            status:
              'rejected' as const,

            notes: [
              candidate.notes,
              'Promoted into source dataset.',
            ]
              .filter(Boolean)
              .join(' '),
          }
        }

        return candidate
      },
    )

  await fs.writeFile(
    CANDIDATES_PATH,
    JSON.stringify(
      updatedCandidates,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  const dataVersion =
    await loadDataVersion()

  dataVersion.lastUpdated =
    todayUtc()

  /*
   * Do NOT set latestGoalNumber here.
   *
   * The canonical builder must first
   * sort and regenerate the sequence.
   */
  await fs.writeFile(
    DATA_VERSION_PATH,
    JSON.stringify(
      dataVersion,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log('')
  console.log(
    `Promoted records: ${promoted.length}`,
  )

  for (
    const goal
    of promoted
  ) {
    console.log(
      `${goal.date} | ${goal.club} vs ${goal.opponent} | ${goal.minute ?? '?'}'`,
    )
  }

  console.log('')
  console.log(
    '✓ Verified candidates merged into source goals.',
  )

  console.log(
    'Run build-canonical next.',
  )
}

main().catch(
  (error: unknown) => {
    console.error('')
    console.error(
      'Candidate promotion failed.',
    )

    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)