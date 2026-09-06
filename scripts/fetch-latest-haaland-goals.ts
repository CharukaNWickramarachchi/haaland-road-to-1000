import fs from 'node:fs/promises'
import path from 'node:path'

import dotenv from 'dotenv'

import {
  goalCandidateSchema,
  goalSchema,
  type Goal,
  type GoalCandidate,
} from '../src/types/football'

dotenv.config({
  path: '.env.local',
})

const API_BASE =
  'https://v3.football.api-sports.io'

const API_KEY =
  process.env.API_FOOTBALL_KEY

const CANONICAL_PATH =
  path.join(
    process.cwd(),
    'data',
    'canonical',
    'goals.json',
  )

const OUTPUT_PATH =
  path.join(
    process.cwd(),
    'data',
    'incoming',
    'goal-candidates.json',
  )

const STATE_PATH =
  path.join(
    process.cwd(),
    'data',
    'automation',
    'state.json',
  )

const PROVIDER_CONFIG_PATH =
  path.join(
    process.cwd(),
    'data',
    'automation',
    'provider-config.json',
  )

  interface ProviderConfig {
  provider: string

  teams: {
    [teamName: string]: {
      providerTeamId:
        | number
        | null
    }
  }
}

interface ApiFixture {
  fixture: {
    id: number
    date: string
  }

  league: {
    name: string
  }

  teams: {
    home: {
      id: number
      name: string
    }

    away: {
      id: number
      name: string
    }
  }
}

interface ApiEvent {
  time: {
    elapsed: number | null
    extra: number | null
  }

  team: {
    id: number
    name: string
  }

  player: {
    id: number | null
    name: string | null
  }

  type: string
  detail: string
}

interface ApiResponse<T> {
  response: T[]
}

function normalizeTeam(
  value: string,
): string {
  const aliases:
    Record<string, string> = {
      'Manchester City':
        'Manchester City',

      Norway:
        'Norway',
    }

  return aliases[value] ?? value
}

function normalizeCompetition(
  value: string,
): {
  competition: string
  competitionType:
    | 'League'
    | 'Domestic Cup'
    | 'Continental'
    | 'International'
    | 'Other'
} {
  const lower =
    value.toLowerCase()

  if (
    lower.includes(
      'premier league',
    )
  ) {
    return {
      competition:
        'Premier League',
      competitionType:
        'League',
    }
  }

  if (
    lower.includes(
      'champions league',
    )
  ) {
    return {
      competition:
        'UEFA Champions League',
      competitionType:
        'Continental',
    }
  }

  if (
    lower.includes('fa cup')
  ) {
    return {
      competition: 'FA Cup',
      competitionType:
        'Domestic Cup',
    }
  }

  if (
    lower.includes(
      'world cup',
    )
  ) {
    return {
      competition:
        value,
      competitionType:
        'International',
    }
  }

  if (
    lower.includes(
      'nations league',
    )
  ) {
    return {
      competition:
        'UEFA Nations League',
      competitionType:
        'International',
    }
  }

  return {
    competition: value,
    competitionType:
      'Other',
  }
}

function createCanonicalFingerprint(
  goal: Goal,
): string {
  return [
    goal.date,
    goal.club,
    goal.opponent,
    goal.competition,
    goal.minute ?? '',
    goal.addedTimeMinute ?? '',
  ].join('|')
}

function createCandidateFingerprint(
  candidate: GoalCandidate,
): string {
  return [
    candidate.date,
    candidate.club,
    candidate.opponent,
    candidate.competition,
    candidate.minute ?? '',
    candidate.addedTimeMinute ?? '',
  ].join('|')
}

async function loadProviderConfig():
  Promise<ProviderConfig> {
  const text =
    await fs.readFile(
      PROVIDER_CONFIG_PATH,
      'utf8',
    )

  return JSON.parse(
    text,
  ) as ProviderConfig
}

async function apiGet<T>(
  endpoint: string,
): Promise<T[]> {
  if (!API_KEY) {
    throw new Error(
      'API_FOOTBALL_KEY is missing.',
    )
  }

  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        headers: {
          'x-apisports-key':
            API_KEY,
        },
      },
    )

  if (!response.ok) {
    throw new Error(
      `API-Football HTTP ${response.status}`,
    )
  }

  const body =
    await response.json() as
      ApiResponse<T>

  return body.response
}

async function loadCanonical():
  Promise<Goal[]> {
  const text =
    await fs.readFile(
      CANONICAL_PATH,
      'utf8',
    )

  const raw =
    JSON.parse(text)

  return raw.map(
    (record: unknown) =>
      goalSchema.parse(
        record,
      ),
  )
}

async function loadExistingCandidates():
  Promise<GoalCandidate[]> {
  try {
    const text =
      await fs.readFile(
        OUTPUT_PATH,
        'utf8',
      )

    const raw =
      JSON.parse(text)

    return raw.map(
      (record: unknown) =>
        goalCandidateSchema.parse(
          record,
        ),
    )
  } catch {
    return []
  }
}

async function main() {
  console.log('')
  console.log(
    'Haaland Road to 1000',
  )
  console.log(
    'Latest Goal Detector',
  )
  console.log(
    '--------------------',
  )

  const canonical =
    await loadCanonical()

  const latest =
    canonical.at(-1)

  if (!latest) {
    throw new Error(
      'Canonical dataset is empty.',
    )
  }

  console.log(
    `Current canonical total: ${canonical.length}`,
  )

  console.log(
    `Latest canonical date: ${latest.date}`,
  )

  /*
   * We deliberately search from
   * several days before the latest
   * canonical goal so delayed provider
   * updates cannot be missed.
   */
  const startDate =
    new Date(
      `${latest.date}T00:00:00Z`,
    )

  startDate.setUTCDate(
    startDate.getUTCDate() - 3,
  )

  const from =
    startDate
      .toISOString()
      .slice(0, 10)

  const today =
    new Date()
      .toISOString()
      .slice(0, 10)

  console.log(
    `Checking fixtures: ${from} → ${today}`,
  )

  /*
   * During initial setup we discover
   * Haaland's provider player ID from
   * recent fixture events instead of
   * hardcoding an assumed ID.
   *
   * Search Manchester City and Norway
   * fixtures separately in the next
   * refinement once IDs are confirmed.
   */

  const providerConfig =
  await loadProviderConfig()

const cityId =
  providerConfig
    .teams[
      'Manchester City'
    ]
    ?.providerTeamId

const norwayId =
  providerConfig
    .teams[
      'Norway'
    ]
    ?.providerTeamId

if (
  !cityId ||
  !norwayId
) {
  throw new Error(
    'Provider team IDs are missing. Run npm run resolve-provider-teams first.',
  )
}

const cityFixtures =
  await apiGet<ApiFixture>(
    `/fixtures?team=${cityId}&from=${from}&to=${today}`,
  )

const norwayFixtures =
  await apiGet<ApiFixture>(
    `/fixtures?team=${norwayId}&from=${from}&to=${today}`,
  )

const fixtureMap =
  new Map<
    number,
    ApiFixture
  >()

for (const fixture of [
  ...cityFixtures,
  ...norwayFixtures,
]) {
  fixtureMap.set(
    fixture.fixture.id,
    fixture,
  )
}

const fixtures =
  [...fixtureMap.values()]

console.log(
  `Manchester City fixtures: ${cityFixtures.length}`,
)

console.log(
  `Norway fixtures: ${norwayFixtures.length}`,
)

console.log(
  `Unique fixtures to inspect: ${fixtures.length}`,
)

  console.log(
    `Fixtures returned: ${fixtures.length}`,
  )

  const canonicalFingerprints =
    new Set(
      canonical.map(
        createCanonicalFingerprint,
      ),
    )

  const existing =
    await loadExistingCandidates()

  const candidateFingerprints =
    new Set(
      existing.map(
        createCandidateFingerprint,
      ),
    )

  const discovered:
    GoalCandidate[] = []

  for (const fixture of fixtures) {
    const home =
      fixture.teams.home.name

    const away =
      fixture.teams.away.name

    const relevantFixture =
      [
        home,
        away,
      ].some(
        (team) =>
          team ===
            'Manchester City' ||
          team ===
            'Norway',
      )

    if (!relevantFixture) {
      continue
    }

    const events =
        await apiGet<ApiEvent>(
            `/fixtures/events?fixture=${fixture.fixture.id}&type=Goal`,
    )

    for (let index = 0;
      index <
      events.length;
      index += 1
    ) {
      const event =
        events[index]

      if (
        event.type !==
        'Goal'
      ) {
        continue
      }

      if (
        event.detail
            .toLowerCase()
            .includes(
                'own goal',
            )
      ) {
        continue
    }

      const scorerName =
  event.player.name
    ?.trim()
    .toLowerCase()

if (
  !scorerName ||
  !scorerName.includes(
    'haaland',
  )
) {
  continue
}

      const scorerTeam =
        normalizeTeam(
          event.team.name,
        )

      const opponent =
        scorerTeam ===
        normalizeTeam(home)
          ? normalizeTeam(away)
          : normalizeTeam(home)

      const {
        competition,
        competitionType,
      } =
        normalizeCompetition(
          fixture.league.name,
        )

      const candidate =
        goalCandidateSchema.parse(
          {
            provider:
              'API-Football',

            providerFixtureId:
              fixture.fixture.id,

            providerEventId:
              `${fixture.fixture.id}-${index}`,

            providerDetail:
                event.detail || null,

            discoveredAt:
              new Date()
                .toISOString(),

            date:
              fixture.fixture.date.slice(
                0,
                10,
              ),

            club:
              scorerTeam,

            opponent,

            competition,

            competitionType,

            /*
             * Venue is based on which
             * side Haaland's team appears
             * on in the fixture.
             */
            venue:
              scorerTeam ===
              normalizeTeam(home)
                ? 'Home'
                : 'Away',

            minute:
              event.time.elapsed,

            addedTimeMinute:
              event.time.extra,

            penalty:
              event.detail
                .toLowerCase()
                .includes(
                  'penalty',
                ),

            sourceUrl: null,

            sourceName:
              'API-Football',

            status:
              'candidate',

            notes:
              'Automatically discovered goal event. Requires canonical verification before publication.',
          },
        )

      const fingerprint =
        createCandidateFingerprint(
          candidate,
        )

      if (
        canonicalFingerprints.has(
          fingerprint,
        ) ||
        candidateFingerprints.has(
          fingerprint,
        )
      ) {
        continue
      }

      discovered.push(
        candidate,
      )

      candidateFingerprints.add(
        fingerprint,
      )
    }
  }

  const combined = [
    ...existing,
    ...discovered,
  ]

  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify(
      combined,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  await fs.writeFile(
    STATE_PATH,
    JSON.stringify(
      {
        lastCheckedAt:
          new Date()
            .toISOString(),

        lastCandidateDate:
          discovered.at(-1)
            ?.date ??
          null,

        lastCanonicalGoalNumber:
          canonical.length,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log('')
  console.log(
    `New candidates: ${discovered.length}`,
  )

  if (
    discovered.length === 0
  ) {
    console.log(
      '✓ No unpublished Haaland goals detected.',
    )
  } else {
    console.log('')
    console.log(
      'Candidate goals detected:',
    )

    for (
      const candidate
      of discovered
    ) {
      console.log(
        `${candidate.date} | ${candidate.club} vs ${candidate.opponent} | ${candidate.minute ?? '?'}'`,
      )
    }

    console.log('')
    console.log(
      'Candidates were NOT added to the canonical dataset.',
    )
  }
}

main().catch(
  (error: unknown) => {
    console.error('')
    console.error(
      'Goal detection failed.',
    )

    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)