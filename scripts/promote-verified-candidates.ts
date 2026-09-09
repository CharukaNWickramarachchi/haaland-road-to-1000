import fs from 'node:fs/promises'
import path from 'node:path'

import {
  goalCandidateSchema,
  goalSchema,
  sourceSchema,
  type Goal,
  type GoalCandidate,
  type SourceRecord,
} from '../src/types/football'

const SOURCE_GOALS_PATH = path.join(process.cwd(), 'data', 'goals.json')
const CANDIDATES_PATH = path.join(
  process.cwd(),
  'data',
  'incoming',
  'goal-candidates.json',
)
const SOURCES_PATH = path.join(process.cwd(), 'data', 'sources.json')
const DATA_VERSION_PATH = path.join(process.cwd(), 'data', 'data-version.json')

interface DataVersion {
  version: string
  lastUpdated: string
  lastVerified: string
  latestGoalNumber: number | null
  methodologyVersion: string
  datasetMode: string
}

function cleanJson(text: string): string {
  return text.replace(/^\uFEFF/, '').trim()
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value
  }

  if (value === null || value === undefined) {
    return []
  }

  return [value]
}

function normalizeCandidateRecord(record: unknown): unknown {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return record
  }

  const value = { ...(record as Record<string, unknown>) }

  if (
    value.teamResult !== null &&
    value.teamResult !== undefined &&
    value.teamResult !== 'W' &&
    value.teamResult !== 'D' &&
    value.teamResult !== 'L'
  ) {
    value.teamResult = null
  }

  if (value.addedTimeMinute === 0 || value.addedTimeMinute === '') {
    value.addedTimeMinute = null
  }

  if (value.bodyPart === '') {
    value.bodyPart = null
  }

  if (value.assist === '') {
    value.assist = null
  }

  if (value.scoreAfterGoal === '') {
    value.scoreAfterGoal = null
  }

  return value
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeTeam(value: string): string {
  const name = normalizeText(value)
  const lower = name.toLowerCase()

  if (lower === 'man city' || lower === 'manchester city') {
    return 'Manchester City'
  }

  if (lower === 'norway') {
    return 'Norway'
  }

  return name
}

function normalizedAddedTime(value: number | null | undefined): number | '' {
  return value && value > 0 ? value : ''
}

function createGoalFingerprint(goal: {
  date: string
  club: string
  opponent: string
  minute: number | null
  addedTimeMinute: number | null | undefined
}): string {
  return [
    goal.date,
    normalizeTeam(goal.club).toLowerCase(),
    normalizeTeam(goal.opponent).toLowerCase(),
    goal.minute ?? '',
    normalizedAddedTime(goal.addedTimeMinute),
  ].join('|')
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

function getSeason(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid candidate date "${date}".`)
  }

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth() + 1

  if (month >= 7) {
    return `${year}/${String(year + 1).slice(-2)}`
  }

  return `${year - 1}/${String(year).slice(-2)}`
}

function sourceIdFor(candidate: GoalCandidate): string {
  return candidate.provider === 'BSD'
    ? 'bsd-live-events'
    : 'api-football-live-events'
}

function matchIdFor(candidate: GoalCandidate): string {
  const prefix = candidate.provider === 'BSD' ? 'bsd' : 'api-football'
  return `${prefix}-${candidate.providerFixtureId}`
}

function candidateToGoal(candidate: GoalCandidate, temporaryGoalNumber: number): Goal {
  const detail = candidate.providerDetail?.trim().toLowerCase() ?? ''
  const penalty = candidate.penalty
  const freeKick = detail.includes('free kick') ? true : false

  const goalType = penalty
    ? 'Penalty'
    : freeKick
      ? 'Free Kick'
      : candidate.bodyPart === 'Head'
        ? 'Header'
        : 'Open Play'

  return goalSchema.parse({
    goalNumber: temporaryGoalNumber,
    player: 'Erling Haaland',
    date: candidate.date,
    season: getSeason(candidate.date),
    club: candidate.club,
    opponent: candidate.opponent,
    competition: candidate.competition,
    competitionType: candidate.competitionType,
    venue: candidate.venue,
    minute: candidate.minute,
    addedTimeMinute: candidate.addedTimeMinute,
    scoreAfterGoal: candidate.scoreAfterGoal ?? null,
    teamResult:
      candidate.teamResult === 'W' ||
      candidate.teamResult === 'D' ||
      candidate.teamResult === 'L'
        ? candidate.teamResult
        : null,
    goalType,
    bodyPart: candidate.bodyPart ?? null,
    penalty,
    freeKick,
    assist: candidate.assist ?? null,
    assistType: null,
    sourceId: sourceIdFor(candidate),
    sourceUrl: candidate.sourceUrl,
    sourceName: candidate.sourceName,
    sourcePublishedAt: null,
    verified: true,
    verificationNotes: [
      `Automatically detected through ${candidate.provider}.`,
      'Published from a finished-match goal incident after schema and duplicate validation.',
      candidate.providerDetail ? `Provider detail: ${candidate.providerDetail}.` : null,
      candidate.notes,
    ]
      .filter(Boolean)
      .join(' '),
    matchId: matchIdFor(candidate),
  })
}

function normalizeGoalRecord(
  record: unknown,
): unknown {
  if (
    !record ||
    typeof record !== 'object' ||
    Array.isArray(record)
  ) {
    return record
  }

  const value = {
    ...(record as Record<string, unknown>),
  }

  // Historical data may contain stale or malformed result values.
  // Only W/D/L are valid match results; anything else is treated as unknown.
  if (
    value.teamResult !== null &&
    value.teamResult !== 'W' &&
    value.teamResult !== 'D' &&
    value.teamResult !== 'L'
  ) {
    value.teamResult = null
  }

  if (
    value.addedTimeMinute === '' ||
    value.addedTimeMinute === 0 ||
    value.addedTimeMinute === undefined
  ) {
    value.addedTimeMinute = null
  }

  if (
    value.scoreAfterGoal === '' ||
    value.scoreAfterGoal === undefined
  ) {
    value.scoreAfterGoal = null
  }

  if (
    value.goalType === '' ||
    value.goalType === undefined
  ) {
    value.goalType = null
  }

  if (
    value.bodyPart === '' ||
    value.bodyPart === undefined
  ) {
    value.bodyPart = null
  }

  if (
    value.assist === '' ||
    value.assist === undefined
  ) {
    value.assist = null
  }

  if (
    value.assistType === '' ||
    value.assistType === undefined
  ) {
    value.assistType = null
  }

  if (
    value.sourceId === '' ||
    value.sourceId === undefined
  ) {
    value.sourceId = null
  }

  if (
    value.sourceUrl === '' ||
    value.sourceUrl === undefined
  ) {
    value.sourceUrl = null
  }

  if (
    value.sourceName === '' ||
    value.sourceName === undefined
  ) {
    value.sourceName = null
  }

  if (
    value.sourcePublishedAt === '' ||
    value.sourcePublishedAt === undefined
  ) {
    value.sourcePublishedAt = null
  }

  if (
    value.verificationNotes === '' ||
    value.verificationNotes === undefined
  ) {
    value.verificationNotes = null
  }

  if (
    value.matchId === '' ||
    value.matchId === undefined
  ) {
    value.matchId = null
  }

  return value
}

async function loadGoals():
  Promise<Goal[]> {
  const text =
    cleanJson(
      await fs.readFile(
        SOURCE_GOALS_PATH,
        'utf8',
      ),
    )

  const parsed =
    JSON.parse(text) as unknown

  return asArray(parsed).map(
    (record) =>
      goalSchema.parse(
        normalizeGoalRecord(
          record,
        ),
      ),
  )
}

async function loadCandidates(): Promise<GoalCandidate[]> {
  try {
    const text = cleanJson(await fs.readFile(CANDIDATES_PATH, 'utf8'))

    if (!text) {
      return []
    }

    const parsed = JSON.parse(text) as unknown
    return asArray(parsed).map((record) =>
      goalCandidateSchema.parse(normalizeCandidateRecord(record)),
    )
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

async function loadSources(): Promise<SourceRecord[]> {
  const text = cleanJson(await fs.readFile(SOURCES_PATH, 'utf8'))
  const parsed = JSON.parse(text) as unknown
  return asArray(parsed).map((record) => sourceSchema.parse(record))
}

async function ensureBsdSource(): Promise<void> {
  const sources = await loadSources()
  const index = sources.findIndex((source) => source.id === 'bsd-live-events')

  const record = sourceSchema.parse({
    id: 'bsd-live-events',
    name: 'Bzzoiro Sports Data — Football Match Incidents',
    url: 'https://sports.bzzoiro.com/',
    sourceType: 'Statistical Provider',
    purpose:
      'Automated detection and publication of new Erling Haaland senior goals from finished match incidents.',
    coverage: 'Manchester City and Norway senior match incidents',
    lastVerified: todayUtc(),
    notes:
      'Automated provider source. Haaland is matched using BSD player ID 852. Historical API-Football candidate records are retained only in the candidate audit file; all new automated publications use BSD.',
  })

  if (index >= 0) {
    sources[index] = record
  } else {
    sources.push(record)
  }

  await fs.writeFile(SOURCES_PATH, `${JSON.stringify(sources, null, 2)}\n`, 'utf8')
}

async function loadDataVersion(): Promise<DataVersion> {
  const text = cleanJson(await fs.readFile(DATA_VERSION_PATH, 'utf8'))
  return JSON.parse(text) as DataVersion
}

async function main(): Promise<void> {
  console.log('')
  console.log('Haaland Road to 1000')
  console.log('Automatic Candidate Promotion')
  console.log('-----------------------------')

  const goals = await loadGoals()
  const candidates = await loadCandidates()
  const verified = candidates
    .filter((candidate) => candidate.status === 'verified')
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.minute ?? 999) - (b.minute ?? 999) ||
        (a.addedTimeMinute ?? 0) - (b.addedTimeMinute ?? 0),
    )

  console.log(`Existing source goals: ${goals.length}`)
  console.log(`Candidates: ${candidates.length}`)
  console.log(`Verified candidates: ${verified.length}`)

  if (verified.length === 0) {
    console.log('')
    console.log('✓ Nothing to promote.')
    return
  }

  const fingerprints = new Set(goals.map(createGoalFingerprint))
  const promoted: Goal[] = []
  const processedCandidateIds = new Set<string>()

  for (const candidate of verified) {
    const fingerprint = createGoalFingerprint(candidate)

    if (fingerprints.has(fingerprint)) {
      console.log(
        `Already present: ${candidate.date} | ${candidate.club} vs ${candidate.opponent} | ${candidate.minute ?? '?'}'`,
      )
      processedCandidateIds.add(candidate.providerEventId)
      continue
    }

    const temporaryGoalNumber = goals.length + promoted.length + 1
    const goal = candidateToGoal(candidate, temporaryGoalNumber)

    promoted.push(goal)
    fingerprints.add(fingerprint)
    processedCandidateIds.add(candidate.providerEventId)
  }

  if (promoted.some((goal) => goal.sourceId === 'bsd-live-events')) {
    await ensureBsdSource()
  }

  if (promoted.length > 0) {
    const combined = [...goals, ...promoted]
    await fs.writeFile(SOURCE_GOALS_PATH, `${JSON.stringify(combined, null, 2)}\n`, 'utf8')
  }

  const updatedCandidates = candidates.map((candidate) => {
    if (!processedCandidateIds.has(candidate.providerEventId)) {
      return candidate
    }

    return goalCandidateSchema.parse({
      ...candidate,
      status: 'promoted',
      notes: [candidate.notes, 'Processed by the automatic publication pipeline.']
        .filter(Boolean)
        .join(' '),
    })
  })

  await fs.writeFile(
    CANDIDATES_PATH,
    `${JSON.stringify(updatedCandidates, null, 2)}\n`,
    'utf8',
  )

  const dataVersion = await loadDataVersion()
  dataVersion.lastUpdated = todayUtc()

  await fs.writeFile(
    DATA_VERSION_PATH,
    `${JSON.stringify(dataVersion, null, 2)}\n`,
    'utf8',
  )

  console.log('')
  console.log(`Promoted records: ${promoted.length}`)

  for (const goal of promoted) {
    const minuteText = `${goal.minute ?? '?'}${
      goal.addedTimeMinute ? `+${goal.addedTimeMinute}` : ''
    }'`

    console.log(`${goal.date} | ${goal.club} vs ${goal.opponent} | ${minuteText}`)
  }

  console.log('')
  console.log('✓ Candidate promotion complete.')
}

main().catch((error: unknown) => {
  console.error('')
  console.error('Candidate promotion failed.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
