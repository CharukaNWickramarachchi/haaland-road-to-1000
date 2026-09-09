import fs from 'node:fs/promises'
import path from 'node:path'

import dotenv from 'dotenv'

import {
  goalCandidateSchema,
  goalSchema,
  type BodyPart,
  type CompetitionType,
  type Goal,
  type GoalCandidate,
  type MatchResult,
} from '../src/types/football'

dotenv.config({ path: '.env.local' })

const API_BASE = 'https://sports.bzzoiro.com/api/v2'
const API_KEY = process.env.BSD_FOOTBALL_KEY
const HAALAND_PLAYER_ID = 852

const CANONICAL_PATH = path.join(
  process.cwd(),
  'data',
  'canonical',
  'goals.json',
)

const CANDIDATES_PATH = path.join(
  process.cwd(),
  'data',
  'incoming',
  'goal-candidates.json',
)

const STATE_PATH = path.join(
  process.cwd(),
  'data',
  'automation',
  'state.json',
)

interface BsdListResponse<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
}

interface BsdEvent {
  id: number
  league_id?: number | null
  season_id?: number | null
  event_date?: string | null
  status?: string | null
  home_team_id?: number | null
  away_team_id?: number | null
  home_team?: string | null
  away_team?: string | null
  home_score?: number | null
  away_score?: number | null
  period?: string | null
}

interface BsdLeague {
  id: number
  name?: string | null
  country?: string | null
}

interface BsdSequenceItem {
  event?: string | null
  player?: string | null
  pid?: number | null
  body?: string | null
  assist?: boolean | null
}

interface BsdIncident {
  type?: string | null
  minute?: number | null
  added_time?: number | null
  period_second?: number | null
  player?: string | null
  player_id?: number | null
  assist?: string | null
  is_home?: boolean | null
  goal_type?: string | null
  home_score?: number | null
  away_score?: number | null
  sequence?: BsdSequenceItem[] | null
}

interface BsdIncidentsResponse {
  event_id?: number
  incidents?: BsdIncident[]
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

  // Repairs the common PowerShell ConvertTo-Json single-object case.
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

function extractDate(event: BsdEvent): string | null {
  if (!event.event_date) {
    return null
  }

  return event.event_date.slice(0, 10)
}

function extractHomeTeam(event: BsdEvent): string | null {
  return event.home_team ? normalizeTeam(event.home_team) : null
}

function extractAwayTeam(event: BsdEvent): string | null {
  return event.away_team ? normalizeTeam(event.away_team) : null
}

function normalizeCompetition(
  leagueName: string,
  scorerTeam: string,
): { competition: string; competitionType: CompetitionType } {
  const name = normalizeText(leagueName || 'Unknown Competition')
  const lower = name.toLowerCase()

  if (scorerTeam === 'Norway') {
    return {
      competition: name,
      competitionType: 'International',
    }
  }

  if (lower.includes('champions league')) {
    return {
      competition: 'UEFA Champions League',
      competitionType: 'Continental',
    }
  }

  if (
    lower.includes('europa league') ||
    lower.includes('conference league') ||
    lower.includes('uefa super cup')
  ) {
    return {
      competition: name,
      competitionType: 'Continental',
    }
  }

  if (lower === 'premier league' || lower.includes('premier league')) {
    return {
      competition: 'Premier League',
      competitionType: 'League',
    }
  }

  if (
    lower.includes('fa cup') ||
    lower.includes('efl cup') ||
    lower.includes('league cup') ||
    lower.includes('community shield')
  ) {
    return {
      competition: name,
      competitionType: 'Domestic Cup',
    }
  }

  return {
    competition: name,
    competitionType: 'Other',
  }
}

function extractBodyPart(incident: BsdIncident): BodyPart | null {
  const goalSequence = incident.sequence?.find(
    (item) => item.event?.toLowerCase() === 'goal' && item.pid === HAALAND_PLAYER_ID,
  )

  const body = goalSequence?.body?.toLowerCase()

  if (!body) {
    return null
  }

  if (body.includes('head')) {
    return 'Head'
  }

  if (body.includes('right')) {
    return 'Right Foot'
  }

  if (body.includes('left')) {
    return 'Left Foot'
  }

  return 'Other'
}

function getTeamResult(event: BsdEvent, isHome: boolean): MatchResult | null {
  if (event.home_score === null || event.home_score === undefined) {
    return null
  }

  if (event.away_score === null || event.away_score === undefined) {
    return null
  }

  if (event.home_score === event.away_score) {
    return 'D'
  }

  const teamWon = isHome
    ? event.home_score > event.away_score
    : event.away_score > event.home_score

  return teamWon ? 'W' : 'L'
}

function getScoreAfterGoal(incident: BsdIncident): string | null {
  if (incident.home_score === null || incident.home_score === undefined) {
    return null
  }

  if (incident.away_score === null || incident.away_score === undefined) {
    return null
  }

  return `${incident.home_score}-${incident.away_score}`
}

function getPenalty(incident: BsdIncident): boolean {
  const goalType = incident.goal_type?.toLowerCase() ?? ''
  return goalType.includes('penalty') && !goalType.includes('shootout')
}

function isShootoutIncident(incident: BsdIncident): boolean {
  const goalType = incident.goal_type?.toLowerCase() ?? ''
  return goalType.includes('shootout')
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiGet<T>(endpoint: string): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      'BSD_FOOTBALL_KEY is missing. Add it to .env.local locally and GitHub Actions secrets.',
    )
  }

  const url = `${API_BASE}${endpoint}`
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Token ${API_KEY}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(20_000),
      })

      if (response.ok) {
        return (await response.json()) as T
      }

      const body = await response.text()
      const error = new Error(`BSD HTTP ${response.status}: ${body}`)

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after') ?? '1')

        if (retryAfter > 60 || attempt === 3) {
          throw error
        }

        await sleep(Math.max(1, retryAfter) * 1000)
        lastError = error
        continue
      }

      if (response.status >= 500 && attempt < 3) {
        lastError = error
        await sleep(attempt * 1500)
        continue
      }

      throw error
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < 3 && !lastError.message.startsWith('BSD HTTP 4')) {
        await sleep(attempt * 1500)
        continue
      }

      throw lastError
    }
  }

  throw lastError ?? new Error(`BSD request failed: ${endpoint}`)
}

async function loadCanonical(): Promise<Goal[]> {
  const text = cleanJson(await fs.readFile(CANONICAL_PATH, 'utf8'))
  const parsed = JSON.parse(text) as unknown

  return asArray(parsed).map((record) => goalSchema.parse(record))
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

async function loadRecentEvents(teamName: string, from: string, to: string): Promise<BsdEvent[]> {
  const endpoint =
    `/events/?team_name=${encodeURIComponent(teamName)}` +
    `&status=finished&date_from=${encodeURIComponent(from)}` +
    `&date_to=${encodeURIComponent(to)}&limit=200`

  const response = await apiGet<BsdListResponse<BsdEvent> | BsdEvent[]>(endpoint)

  if (Array.isArray(response)) {
    return response
  }

  return Array.isArray(response.results) ? response.results : []
}

async function loadEventDetail(eventId: number): Promise<BsdEvent> {
  return apiGet<BsdEvent>(`/events/${eventId}/`)
}

async function loadIncidents(eventId: number): Promise<BsdIncident[]> {
  const response = await apiGet<BsdIncidentsResponse>(`/events/${eventId}/incidents/`)
  return Array.isArray(response.incidents) ? response.incidents : []
}

const leagueCache = new Map<number, string>()

async function loadLeagueName(leagueId: number | null | undefined): Promise<string> {
  if (!leagueId) {
    return 'Unknown Competition'
  }

  const cached = leagueCache.get(leagueId)

  if (cached) {
    return cached
  }

  try {
    const league = await apiGet<BsdLeague>(`/leagues/${leagueId}/`)
    const name = normalizeText(league.name ?? `League ${leagueId}`)
    leagueCache.set(leagueId, name)
    return name
  } catch (error) {
    console.warn(
      `Could not resolve league ${leagueId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )

    return `League ${leagueId}`
  }
}

async function main(): Promise<void> {
  console.log('')
  console.log('Haaland Road to 1000')
  console.log('BSD Automatic Goal Detector')
  console.log('---------------------------')

  const canonical = await loadCanonical()
  const latest = canonical.at(-1)

  if (!latest) {
    throw new Error('Canonical dataset is empty.')
  }

  const from = latest.date
  const to = todayUtc()

  console.log(`Current canonical total: ${canonical.length}`)
  console.log(`Latest canonical date: ${latest.date}`)
  console.log(`Checking finished matches: ${from} -> ${to}`)

  const [cityCompact, norwayCompact] = await Promise.all([
    loadRecentEvents('Manchester City', from, to),
    loadRecentEvents('Norway', from, to),
  ])

  console.log(`Manchester City matches in window: ${cityCompact.length}`)
  console.log(`Norway matches in window: ${norwayCompact.length}`)

  if (cityCompact.length === 0 && norwayCompact.length === 0) {
    throw new Error(
      'BSD returned zero finished Manchester City and Norway matches in the catch-up window. Refusing to treat this as a successful check.',
    )
  }

  const compactById = new Map<number, BsdEvent>()

  for (const event of [...cityCompact, ...norwayCompact]) {
    if (typeof event.id === 'number') {
      compactById.set(event.id, event)
    }
  }

  const detailedEvents: BsdEvent[] = []

  for (const compact of compactById.values()) {
    const detail = await loadEventDetail(compact.id)
    const merged = { ...compact, ...detail }

    if (merged.status && merged.status !== 'finished') {
      continue
    }

    if (!extractDate(merged)) {
      console.warn(`Skipping event ${merged.id}: no event_date in detail response.`)
      continue
    }

    detailedEvents.push(merged)
  }

  detailedEvents.sort((a, b) => {
    const dateA = extractDate(a) ?? ''
    const dateB = extractDate(b) ?? ''
    return dateA.localeCompare(dateB) || a.id - b.id
  })

  const existingCandidates = await loadCandidates()

  const canonicalFingerprints = new Set<string>()
  for (const goal of canonical) {
    canonicalFingerprints.add(createGoalFingerprint(goal))
  }

  const candidateIndexByFingerprint = new Map<string, number>()
  existingCandidates.forEach((candidate, index) => {
    candidateIndexByFingerprint.set(createGoalFingerprint(candidate), index)
  })

  const discovered: GoalCandidate[] = []
  let refreshedCandidates = 0

  for (const event of detailedEvents) {
    const date = extractDate(event)
    const home = extractHomeTeam(event)
    const away = extractAwayTeam(event)

    if (!date || !home || !away) {
      console.warn(`Skipping event ${event.id}: incomplete date/team data.`)
      continue
    }

    const relevant =
      home === 'Manchester City' ||
      away === 'Manchester City' ||
      home === 'Norway' ||
      away === 'Norway'

    if (!relevant) {
      continue
    }

    console.log(`Inspecting ${event.id}: ${home} vs ${away}`)

    const incidents = await loadIncidents(event.id)
    const leagueName = await loadLeagueName(event.league_id)

    for (let index = 0; index < incidents.length; index += 1) {
      const incident = incidents[index]

      if (incident.type?.toLowerCase() !== 'goal') {
        continue
      }

      if (incident.player_id !== HAALAND_PLAYER_ID) {
        continue
      }

      if (isShootoutIncident(incident)) {
        continue
      }

      if (incident.is_home === null || incident.is_home === undefined) {
        console.warn(`Skipping Haaland goal in event ${event.id}: incident side is missing.`)
        continue
      }

      const scorerTeam = incident.is_home ? home : away

      if (scorerTeam !== 'Manchester City' && scorerTeam !== 'Norway') {
        continue
      }

      const minute = incident.minute ?? null

      if (minute === null || minute < 1 || minute > 120) {
        console.warn(`Skipping Haaland goal in event ${event.id}: invalid minute ${minute}.`)
        continue
      }

      const addedTime =
        incident.added_time && incident.added_time > 0
          ? incident.added_time
          : null

      const opponent = incident.is_home ? away : home
      const competitionInfo = normalizeCompetition(leagueName, scorerTeam)

      const candidate = goalCandidateSchema.parse({
        provider: 'BSD',
        providerFixtureId: event.id,
        providerEventId: [
          event.id,
          HAALAND_PLAYER_ID,
          minute,
          addedTime ?? 0,
          incident.period_second ?? index,
        ].join('-'),
        providerDetail: incident.goal_type ?? null,
        discoveredAt: new Date().toISOString(),
        date,
        club: scorerTeam,
        opponent,
        competition: competitionInfo.competition,
        competitionType: competitionInfo.competitionType,
        venue: incident.is_home ? 'Home' : 'Away',
        minute,
        addedTimeMinute: addedTime,
        penalty: getPenalty(incident),
        bodyPart: extractBodyPart(incident),
        assist: incident.assist ?? null,
        scoreAfterGoal: getScoreAfterGoal(incident),
        teamResult: getTeamResult(event, incident.is_home),
        sourceUrl: `${API_BASE}/events/${event.id}/incidents/`,
        sourceName: 'BSD',
        status: 'verified',
        notes:
          'Automatically detected from a finished BSD match using Erling Haaland player ID 852.',
      })

      const fingerprint = createGoalFingerprint(candidate)

      if (canonicalFingerprints.has(fingerprint)) {
        continue
      }

      const existingIndex = candidateIndexByFingerprint.get(fingerprint)

      if (existingIndex !== undefined) {
        const existing = existingCandidates[existingIndex]

        if (existing.status === 'verified' || existing.status === 'candidate') {
          existingCandidates[existingIndex] = goalCandidateSchema.parse({
            ...existing,
            ...candidate,
            status: 'verified',
            discoveredAt: existing.discoveredAt,
            notes:
              existing.notes?.includes(
                'Refreshed from the latest BSD finished-match incident payload.',
              )
                ? existing.notes
                : [
                    existing.notes,
                    'Refreshed from the latest BSD finished-match incident payload.',
                  ]
                    .filter(Boolean)
                    .join(' '),
          })

          refreshedCandidates += 1
        }

        continue
      }

      candidateIndexByFingerprint.set(
        fingerprint,
        existingCandidates.length + discovered.length,
      )
      discovered.push(candidate)
    }
  }

  discovered.sort((a, b) => {
    return (
      a.date.localeCompare(b.date) ||
      (a.minute ?? 999) - (b.minute ?? 999) ||
      (a.addedTimeMinute ?? 0) - (b.addedTimeMinute ?? 0) ||
      a.providerEventId.localeCompare(b.providerEventId)
    )
  })

  const output = [...existingCandidates, ...discovered]

  await fs.mkdir(path.dirname(CANDIDATES_PATH), { recursive: true })
  await fs.writeFile(CANDIDATES_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true })
  await fs.writeFile(
    STATE_PATH,
    `${JSON.stringify(
      {
        lastCheckedAt: new Date().toISOString(),
        lastCandidateDate: discovered.at(-1)?.date ?? null,
        lastCanonicalGoalNumber: latest.goalNumber,
        newGoalsDetected: discovered.length,
        provider: 'BSD',
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  console.log('')
  console.log(`New verified goals detected: ${discovered.length}`)
  console.log(`Existing candidates refreshed: ${refreshedCandidates}`)

  for (const goal of discovered) {
    const minuteText = `${goal.minute ?? '?'}${
      goal.addedTimeMinute ? `+${goal.addedTimeMinute}` : ''
    }'`

    console.log(`${goal.date} | ${goal.club} vs ${goal.opponent} | ${minuteText}`)
  }

  console.log('')
  console.log('✓ BSD goal detection complete.')
}

main().catch((error: unknown) => {
  console.error('')
  console.error('BSD goal detection failed.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
