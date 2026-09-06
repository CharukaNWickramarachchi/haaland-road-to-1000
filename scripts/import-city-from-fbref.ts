import fs from 'node:fs/promises'
import path from 'node:path'

import * as cheerio from 'cheerio'
import { stringify } from 'csv-stringify/sync'

const SOURCE_URL =
  'https://fbref.com/en/players/1f44ac21/goallogs/all_comps/Erling-Haaland-Goal-Log'

const VERIFIED_CUTOFF = '2026-08-31'
const EXPECTED_CITY_GOALS = 164

const OUTPUT_PATH = path.join(
  process.cwd(),
  'data',
  'raw',
  'manchester-city-goals.csv',
)

const LOCAL_HTML_PATH = path.join(
  process.cwd(),
  'data',
  'raw',
  'fbref-haaland-goals.html',
)

const HEADERS = [
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
]

interface StagingGoal {
  [key: string]: string
}

interface TableRow {
  [key: string]: string
}

function clean(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getSeason(date: string): string {
  const parsed = new Date(
    `${date}T00:00:00Z`,
  )

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(
      `Invalid date "${date}".`,
    )
  }

  const year = parsed.getUTCFullYear()

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

function parseMinute(
  rawValue: string,
): {
  minute: string
  addedTimeMinute: string
} {
  const value = clean(rawValue)
    .replace(/[′']/g, '')

  if (!value) {
    return {
      minute: '',
      addedTimeMinute: '',
    }
  }

  const match = value.match(
    /^(\d+)(?:\+(\d+))?$/,
  )

  if (!match) {
    return {
      minute: '',
      addedTimeMinute: '',
    }
  }

  return {
    minute: match[1],
    addedTimeMinute:
      match[2] ?? '',
  }
}

function normalizeVenue(
  value: string,
): string {
  const normalized =
    clean(value).toLowerCase()

  if (
    normalized === 'home' ||
    normalized === 'h'
  ) {
    return 'Home'
  }

  if (
    normalized === 'away' ||
    normalized === 'a'
  ) {
    return 'Away'
  }

  return 'Neutral'
}

function normalizeCompetition(
  value: string,
): {
  competition: string
  competitionType: string
} {
  const normalized = clean(value)

  const lower =
    normalized.toLowerCase()

  if (
    lower.includes(
      'premier league',
    )
  ) {
    return {
      competition:
        'Premier League',
      competitionType: 'League',
    }
  }

  if (
    lower.includes(
      'champions',
    ) &&
    lower.includes('league')
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
    lower.includes('efl cup') ||
    lower.includes(
      'league cup',
    ) ||
    lower.includes('carabao')
  ) {
    return {
      competition: 'EFL Cup',
      competitionType:
        'Domestic Cup',
    }
  }

  if (
    lower.includes(
      'community shield',
    )
  ) {
    return {
      competition:
        'FA Community Shield',
      competitionType: 'Other',
    }
  }

  if (
    lower.includes(
      'club world cup',
    )
  ) {
    return {
      competition:
        'FIFA Club World Cup',
      competitionType: 'Other',
    }
  }

  if (
    lower.includes(
      'super cup',
    ) ||
    lower.includes('supercup')
  ) {
    return {
      competition:
        'UEFA Super Cup',
      competitionType:
        'Continental',
    }
  }

  return {
    competition:
      normalized ||
      'Unknown Competition',

    competitionType: 'Other',
  }
}

async function fetchHtml(): Promise<string> {
  console.log(
    'Attempting live FBref download...',
  )

  try {
    const response =
      await fetch(SOURCE_URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0',
          Accept:
            'text/html,application/xhtml+xml',
          'Accept-Language':
            'en-US,en;q=0.9',
        },
      })

    if (response.ok) {
      const html =
        await response.text()

      if (
        html.includes(
          'Goal Log',
        )
      ) {
        console.log(
          'Live FBref download successful.',
        )

        return html
      }
    }

    console.log(
      `Live request unavailable${
        response
          ? ` (HTTP ${response.status})`
          : ''
      }.`,
    )
  } catch {
    console.log(
      'Live request could not be completed.',
    )
  }

  console.log(
    'Trying local FBref HTML snapshot...',
  )

  const html =
    await fs.readFile(
      LOCAL_HTML_PATH,
      'utf8',
    )

  return html
}

function detectBlockedPage(
  html: string,
) {
  const lower =
    html.toLowerCase()

  const blockedSignals = [
    'access denied',
    'too many requests',
    'rate limit',
    'temporarily blocked',
    'verify you are human',
    'captcha',
    'cloudflare',
  ]

  const signal =
    blockedSignals.find(
      (text) =>
        lower.includes(text),
    )

  if (signal) {
    throw new Error(
      `The saved FBref HTML appears to be a blocked/challenge page. Detected: "${signal}".`,
    )
  }
}

function getStat(
  row: cheerio.Cheerio<any>,
  names: string[],
): string {
  for (const name of names) {
    const value = clean(
      row
        .find(
          `[data-stat="${name}"]`,
        )
        .first()
        .text(),
    )

    if (value) {
      return value
    }
  }

  return ''
}

/**
 * Primary FBref parser.
 *
 * FBref has historically used both
 * "team" and "squad" style field names.
 */
function extractUsingDataStats(
  $: cheerio.CheerioAPI,
): TableRow[] {
  const results: TableRow[] = []

  $('table tbody tr').each(
    (_, element) => {
      const row = $(element)

      const date = getStat(
        row,
        ['date'],
      )

      if (!date) {
        return
      }

      const team = getStat(
        row,
        [
          'team',
          'squad',
          'team_name',
        ],
      )

      const opponent =
        getStat(row, [
          'opponent',
        ])

      const competition =
        getStat(row, [
          'comp',
          'competition',
        ])

      const venue = getStat(
        row,
        ['venue'],
      )

      const minute = getStat(
        row,
        ['minute'],
      )

      const assist = getStat(
        row,
        ['assist'],
      )

      const notes = getStat(
        row,
        ['notes'],
      )

      results.push({
        date,
        team,
        opponent,
        competition,
        venue,
        minute,
        assist,
        notes,
      })
    },
  )

  return results
}

/**
 * Fallback parser for browser-saved
 * versions where data-stat attributes
 * are missing or altered.
 */
function extractUsingHeaders(
  $: cheerio.CheerioAPI,
): TableRow[] {
  const results: TableRow[] = []

  $('table').each(
    (_, tableElement) => {
      const table =
        $(tableElement)

      const headerCells =
        table
          .find('thead tr')
          .last()
          .find('th, td')
          .toArray()

      const headers =
        headerCells.map(
          (cell) =>
            clean($(cell).text()),
        )

      const normalizedHeaders =
        headers.map(
          (header) =>
            header.toLowerCase(),
        )

      const dateIndex =
        normalizedHeaders.indexOf(
          'date',
        )

      const compIndex =
        normalizedHeaders.indexOf(
          'comp',
        )

      const venueIndex =
        normalizedHeaders.indexOf(
          'venue',
        )

      const squadIndex =
        normalizedHeaders.findIndex(
          (header) =>
            header === 'squad' ||
            header === 'team',
        )

      const opponentIndex =
        normalizedHeaders.indexOf(
          'opponent',
        )

      const minuteIndex =
        normalizedHeaders.indexOf(
          'minute',
        )

      const assistIndex =
        normalizedHeaders.indexOf(
          'assist',
        )

      const notesIndex =
        normalizedHeaders.indexOf(
          'notes',
        )

      if (
        dateIndex === -1 ||
        squadIndex === -1 ||
        opponentIndex === -1 ||
        minuteIndex === -1
      ) {
        return
      }

      table
        .find('tbody tr')
        .each(
          (_, rowElement) => {
            const cells =
              $(rowElement)
                .find('th, td')
                .toArray()
                .map(
                  (cell) =>
                    clean(
                      $(cell).text(),
                    ),
                )

            const date =
              cells[dateIndex] ?? ''

            if (!date) {
              return
            }

            results.push({
              date,

              team:
                cells[
                  squadIndex
                ] ?? '',

              opponent:
                cells[
                  opponentIndex
                ] ?? '',

              competition:
                compIndex >= 0
                  ? cells[
                      compIndex
                    ] ?? ''
                  : '',

              venue:
                venueIndex >= 0
                  ? cells[
                      venueIndex
                    ] ?? ''
                  : '',

              minute:
                cells[
                  minuteIndex
                ] ?? '',

              assist:
                assistIndex >= 0
                  ? cells[
                      assistIndex
                    ] ?? ''
                  : '',

              notes:
                notesIndex >= 0
                  ? cells[
                      notesIndex
                    ] ?? ''
                  : '',
            })
          },
        )
    },
  )

  return results
}

function extractRows(
  html: string,
): TableRow[] {
  detectBlockedPage(html)

  const normalizedHtml =
    html
      .replace(/<!--/g, '')
      .replace(/-->/g, '')

  const $ =
    cheerio.load(
      normalizedHtml,
    )

  console.log(
    `HTML size: ${html.length.toLocaleString()} characters`,
  )

  const tables =
    $('table').toArray()

  console.log(
    `Tables found: ${tables.length}`,
  )

  let goalTable:
    cheerio.Cheerio<any> | null =
    null

  for (
    let index = 0;
    index < tables.length;
    index += 1
  ) {
    const table =
      $(tables[index])

    const id =
      table.attr('id') ?? ''

    const caption =
      clean(
        table
          .find('caption')
          .first()
          .text(),
      )

    const nearbyHeading =
      clean(
        table
          .prevAll(
            'h1, h2, h3, h4',
          )
          .first()
          .text(),
      )

    const description = [
      id,
      caption,
      nearbyHeading,
    ]
      .join(' ')
      .toLowerCase()

    console.log(
      `Table ${index + 1}: id="${id}" caption="${caption}"`,
    )

    const looksLikeAssistTable =
      description.includes(
        'assist',
      )

    const looksLikeGoalTable =
      description.includes(
        'goal',
      )

    if (
      looksLikeGoalTable &&
      !looksLikeAssistTable
    ) {
      goalTable = table
      break
    }
  }

  /*
   * FBref's goal-log page currently
   * contains two principal tables:
   *
   *   1. Goals
   *   2. Assists
   *
   * If its labels change but there are
   * still exactly two tables, the first
   * table is treated as the goal table.
   */
  if (
    !goalTable &&
    tables.length === 2
  ) {
    console.log(
      'Could not identify the goal table by label.',
    )

    console.log(
      'Using the first of the two FBref log tables.',
    )

    goalTable =
      $(tables[0])
  }

  if (!goalTable) {
    throw new Error(
      'Unable to identify the FBref Goals table safely.',
    )
  }

  console.log(
    `Selected goal table: id="${
      goalTable.attr('id') ?? ''
    }"`,
  )

  /*
   * Create a temporary document
   * containing only the selected table.
   *
   * This prevents extractUsingDataStats
   * from accidentally reading FBref's
   * assists table.
   */
  const goalTableHtml =
    $.html(goalTable)

  const goalOnlyDocument =
    cheerio.load(
      `<html><body>${goalTableHtml}</body></html>`,
    )

  let rows =
    extractUsingDataStats(
      goalOnlyDocument,
    )

  console.log(
    `Goal-table rows discovered with data-stat parser: ${rows.length}`,
  )

  if (rows.length > 0) {
    return rows
  }

  console.log(
    'Trying visible-header fallback parser on goal table...',
  )

  rows =
    extractUsingHeaders(
      goalOnlyDocument,
    )

  console.log(
    `Goal-table rows discovered with fallback parser: ${rows.length}`,
  )

  return rows
}

function extractCityGoals(
  html: string,
): StagingGoal[] {
  const rows =
    extractRows(html)

  const goals:
    StagingGoal[] = []

  for (const row of rows) {
    const date =
      clean(row.date)

    const team =
      clean(row.team)

    if (
      !team
        .toLowerCase()
        .includes(
          'manchester city',
        )
    ) {
      continue
    }

    if (
      !date ||
      date > VERIFIED_CUTOFF
    ) {
      continue
    }

    const opponent =
      clean(row.opponent)

    if (!opponent) {
      continue
    }

    const {
      competition,
      competitionType,
    } =
      normalizeCompetition(
        row.competition,
      )

    const minuteData =
      parseMinute(row.minute)

    const notes =
      clean(row.notes)

    const isPenalty =
      notes
        .toLowerCase()
        .includes('penalty')

    goals.push({
      date,

      season:
        getSeason(date),

      club:
        'Manchester City',

      opponent,

      competition,

      competitionType,

      venue:
        normalizeVenue(
          row.venue,
        ),

      minute:
        minuteData.minute,

      addedTimeMinute:
        minuteData.addedTimeMinute,

      // FBref's score field is not
      // automatically mapped because
      // our schema specifically means
      // score AFTER the goal.
      scoreAfterGoal: '',

      teamResult: '',

      goalType:
        isPenalty
          ? 'Penalty'
          : '',

      bodyPart: '',

      penalty:
        String(isPenalty),

      freeKick: 'false',

      assist:
        clean(row.assist),

      assistType: '',

      sourceId:
        'fbref-haaland-goal-log',

      sourceUrl:
        SOURCE_URL,

      sourceName:
        'FBref',

      sourcePublishedAt: '',

      verified: 'true',

      verificationNotes:
        'Granular goal event from FBref. Aggregate Manchester City totals are reconciled separately against official Manchester City records.',

      matchId: [
        'city',
        date,
        slugify(opponent),
        slugify(
          competition,
        ),
      ].join('-'),
    })
  }

  return goals.sort(
    (a, b) => {
      const dateComparison =
        a.date.localeCompare(
          b.date,
        )

      if (
        dateComparison !== 0
      ) {
        return dateComparison
      }

      const minuteComparison =
        Number(
          a.minute || 0,
        ) -
        Number(
          b.minute || 0,
        )

      if (
        minuteComparison !== 0
      ) {
        return minuteComparison
      }

      return (
        Number(
          a.addedTimeMinute ||
            0,
        ) -
        Number(
          b.addedTimeMinute ||
            0,
        )
      )
    },
  )
}

function printSeasonSummary(
  goals: StagingGoal[],
) {
  const expected =
    new Map([
      ['2022/23', 52],
      ['2023/24', 38],
      ['2024/25', 34],
      ['2025/26', 38],
      ['2026/27', 2],
    ])

  const actual =
    new Map<string, number>()

  for (const goal of goals) {
    actual.set(
      goal.season,
      (actual.get(
        goal.season,
      ) ?? 0) + 1,
    )
  }

  console.log('')
  console.log(
    'Season reconciliation',
  )

  console.log(
    '---------------------',
  )

  for (
    const [
      season,
      expectedGoals,
    ] of expected
  ) {
    const actualGoals =
      actual.get(season) ?? 0

    const difference =
      actualGoals -
      expectedGoals

    console.log(
      `${season.padEnd(
        10,
      )} expected=${String(
        expectedGoals,
      ).padStart(
        3,
      )} actual=${String(
        actualGoals,
      ).padStart(
        3,
      )} diff=${String(
        difference,
      ).padStart(4)}`,
    )
  }
}

async function main() {
  console.log('')
  console.log(
    'Haaland Road to 1000',
  )

  console.log(
    'Manchester City FBref Import',
  )

  console.log(
    '----------------------------',
  )

  const html =
    await fetchHtml()

  const goals =
    extractCityGoals(html)

  console.log('')
  console.log(
    `City goals discovered through ${VERIFIED_CUTOFF}: ${goals.length}`,
  )

  printSeasonSummary(goals)

  const expectedSeasonTotals =
  new Map<string, number>([
    ['2022/23', 52],
    ['2023/24', 38],
    ['2024/25', 34],
    ['2025/26', 38],
    ['2026/27', 2],
  ])

const actualSeasonTotals =
  new Map<string, number>()

for (const goal of goals) {
  actualSeasonTotals.set(
    goal.season,
    (
      actualSeasonTotals.get(
        goal.season,
      ) ?? 0
    ) + 1,
  )
}

const seasonMismatch =
  Array.from(
    expectedSeasonTotals.entries(),
  ).some(
    ([season, expected]) =>
      (
        actualSeasonTotals.get(
          season,
        ) ?? 0
      ) !== expected,
  )

if (seasonMismatch) {
  throw new Error(
    'Manchester City season-level reconciliation failed.',
  )
}

  if (
    goals.length !==
    EXPECTED_CITY_GOALS
  ) {
    console.log('')
    console.log(
      'Import stopped for safety.',
    )

    console.log(
      `Expected ${EXPECTED_CITY_GOALS} Manchester City goals but discovered ${goals.length}.`,
    )

    console.log(
      'The staging CSV has NOT been written.',
    )

    throw new Error(
      'Manchester City goal total failed reconciliation.',
    )
  }

  const output =
    stringify(goals, {
      header: true,
      columns: HEADERS,
    })

  await fs.writeFile(
    OUTPUT_PATH,
    output,
    'utf8',
  )

  console.log('')
  console.log(
    `Created: ${OUTPUT_PATH}`,
  )

  console.log(
    'Manchester City staging import passed the 164-goal checkpoint.',
  )
}

main().catch(
  (error: unknown) => {
    console.error('')
    console.error(
      'Manchester City import failed.',
    )

    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)