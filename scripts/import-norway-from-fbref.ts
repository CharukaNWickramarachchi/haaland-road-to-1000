import fs from 'node:fs/promises'
import path from 'node:path'

import * as cheerio from 'cheerio'
import { stringify } from 'csv-stringify/sync'

const SOURCE_URL =
  'https://fbref.com/en/players/1f44ac21/goallogs/all_comps/Erling-Haaland-Goal-Log'

const VERIFIED_CUTOFF = '2026-08-31'
const EXPECTED_NORWAY_GOALS = 62

const INPUT_PATH = path.join(
  process.cwd(),
  'data',
  'raw',
  'fbref-haaland-goals.html',
)

const OUTPUT_PATH = path.join(
  process.cwd(),
  'data',
  'raw',
  'norway-goals.csv',
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

interface RawRow {
  [key: string]: string
}

interface StagingGoal {
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
  const parsed = new Date(`${date}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date "${date}".`)
  }

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth() + 1

  if (month >= 7) {
    return `${year}/${String(year + 1).slice(-2)}`
  }

  return `${year - 1}/${String(year).slice(-2)}`
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
    addedTimeMinute: match[2] ?? '',
  }
}

function normalizeVenue(value: string): string {
  const normalized = clean(value).toLowerCase()

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
  const lower = normalized.toLowerCase()

  if (
    lower.includes('world cup') &&
    (
      lower.includes('qual') ||
      lower.includes('qualification')
    )
  ) {
    return {
      competition:
        'FIFA World Cup Qualifying',
      competitionType:
        'International',
    }
  }

  if (lower.includes('world cup')) {
    return {
      competition:
        'FIFA World Cup',
      competitionType:
        'International',
    }
  }

  if (
    lower.includes('euro') &&
    (
      lower.includes('qual') ||
      lower.includes('qualification')
    )
  ) {
    return {
      competition:
        'UEFA European Championship Qualifying',
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

  if (
    lower.includes(
      'international friendly',
    ) ||
    lower === 'friendlies' ||
    lower === 'friendly'
  ) {
    return {
      competition:
        'International Friendly',
      competitionType:
        'International',
    }
  }

  return {
    competition:
      normalized ||
      'International',

    competitionType:
      'International',
  }
}

function getStat(
  row: cheerio.Cheerio<any>,
  names: string[],
): string {
  for (const name of names) {
    const value = clean(
      row
        .find(`[data-stat="${name}"]`)
        .first()
        .text(),
    )

    if (value) {
      return value
    }
  }

  return ''
}

function getGoalTable(
  html: string,
): cheerio.CheerioAPI {
  const normalizedHtml =
    html
      .replace(/<!--/g, '')
      .replace(/-->/g, '')

  const $ =
    cheerio.load(normalizedHtml)

  const tables =
    $('table').toArray()

  console.log(
    `Tables found: ${tables.length}`,
  )

  let selected:
    cheerio.Cheerio<any> | null =
    null

  for (const element of tables) {
    const table = $(element)

    const id =
      table.attr('id') ?? ''

    const caption = clean(
      table
        .find('caption')
        .first()
        .text(),
    )

    const description =
      `${id} ${caption}`
        .toLowerCase()

    if (
      description.includes('goal') &&
      !description.includes('assist')
    ) {
      selected = table
      break
    }
  }

  if (
    !selected &&
    tables.length === 2
  ) {
    selected = $(tables[0])
  }

  if (!selected) {
    throw new Error(
      'Could not safely identify FBref goal table.',
    )
  }

  console.log(
    `Selected table: ${
      selected.attr('id') ?? ''
    }`,
  )

  return cheerio.load(
    `<html><body>${$.html(selected)}</body></html>`,
  )
}

function extractRows(
  html: string,
): RawRow[] {
  const $ =
    getGoalTable(html)

  const rows: RawRow[] = []

  $('table tbody tr').each(
    (_, element) => {
      const row = $(element)

      const date =
        getStat(row, ['date'])

      if (!date) {
        return
      }

      rows.push({
        date,

        team: getStat(
          row,
          [
            'team',
            'squad',
            'team_name',
          ],
        ),

        opponent: getStat(
          row,
          ['opponent'],
        ),

        competition: getStat(
          row,
          [
            'comp',
            'competition',
          ],
        ),

        venue: getStat(
          row,
          ['venue'],
        ),

        minute: getStat(
          row,
          ['minute'],
        ),

        assist: getStat(
          row,
          ['assist'],
        ),

        notes: getStat(
          row,
          ['notes'],
        ),
      })
    },
  )

  return rows
}

function isNorwayTeam(
  team: string,
): boolean {
  const normalized =
    clean(team).toLowerCase()

  return (
    normalized === 'norway' ||
    normalized === 'nor'
  )
}

function extractNorwayGoals(
  html: string,
): StagingGoal[] {
  const rows = extractRows(html)

  console.log(
    `Goal-table rows discovered: ${rows.length}`,
  )

  const goals: StagingGoal[] = []

  for (const row of rows) {
    if (!isNorwayTeam(row.team)) {
      continue
    }

    const date = clean(row.date)

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

    const minute =
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

      club: 'Norway',

      opponent,

      competition,

      competitionType,

      venue:
        normalizeVenue(
          row.venue,
        ),

      minute:
        minute.minute,

      addedTimeMinute:
        minute.addedTimeMinute,

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
        'Granular Norway goal event from FBref. Aggregate senior international total reconciled against the Norwegian Football Federation.',

      matchId: [
        'norway',
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
      const dateCompare =
        a.date.localeCompare(
          b.date,
        )

      if (dateCompare !== 0) {
        return dateCompare
      }

      const minuteCompare =
        Number(a.minute || 0) -
        Number(b.minute || 0)

      if (minuteCompare !== 0) {
        return minuteCompare
      }

      return (
        Number(
          a.addedTimeMinute || 0,
        ) -
        Number(
          b.addedTimeMinute || 0,
        )
      )
    },
  )
}

function printCompetitionSummary(
  goals: StagingGoal[],
) {
  const counts =
    new Map<string, number>()

  for (const goal of goals) {
    counts.set(
      goal.competition,
      (
        counts.get(
          goal.competition,
        ) ?? 0
      ) + 1,
    )
  }

  console.log('')
  console.log(
    'Competition summary',
  )

  console.log(
    '-------------------',
  )

  for (
    const [competition, count]
    of [...counts.entries()].sort(
      (a, b) =>
        b[1] - a[1],
    )
  ) {
    console.log(
      `${competition.padEnd(42)} ${count}`,
    )
  }
}

async function main() {
  console.log('')
  console.log(
    'Haaland Road to 1000',
  )

  console.log(
    'Norway Senior Goal Import',
  )

  console.log(
    '-------------------------',
  )

  const html =
    await fs.readFile(
      INPUT_PATH,
      'utf8',
    )

  console.log(
    `HTML size: ${html.length.toLocaleString()} characters`,
  )

  const goals =
    extractNorwayGoals(html)

  console.log('')
  console.log(
    `Norway senior goals discovered through ${VERIFIED_CUTOFF}: ${goals.length}`,
  )

  printCompetitionSummary(goals)

  if (
    goals.length !==
    EXPECTED_NORWAY_GOALS
  ) {
    console.log('')
    console.log(
      'Import stopped for safety.',
    )

    console.log(
      `Expected ${EXPECTED_NORWAY_GOALS} Norway senior goals but discovered ${goals.length}.`,
    )

    console.log(
      'norway-goals.csv has NOT been written.',
    )

    throw new Error(
      'Norway goal total failed reconciliation.',
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
    'Norway staging import passed the 62-goal checkpoint.',
  )
}

main().catch(
  (error: unknown) => {
    console.error('')
    console.error(
      'Norway import failed.',
    )

    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)