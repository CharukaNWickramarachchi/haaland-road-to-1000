import fs from 'node:fs/promises'
import path from 'node:path'

import dotenv from 'dotenv'

dotenv.config({
  path: '.env.local',
})

const API_BASE =
  'https://v3.football.api-sports.io'

const API_KEY =
  process.env.API_FOOTBALL_KEY

const CONFIG_PATH =
  path.join(
    process.cwd(),
    'data',
    'automation',
    'provider-config.json',
  )

interface ApiTeam {
  team: {
    id: number
    name: string
    country: string
    national: boolean
  }
}

interface ApiResponse<T> {
  response: T[]
}

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

async function findTeam(
  search: string,
  expectedName: string,
): Promise<number> {
  const teams =
    await apiGet<ApiTeam>(
      `/teams?search=${encodeURIComponent(
        search,
      )}`,
    )

  const exact =
    teams.find(
      (item) =>
        item.team.name
          .toLowerCase() ===
        expectedName.toLowerCase(),
    )

  if (!exact) {
    console.log('')
    console.log(
      `Search results for "${search}":`,
    )

    for (const item of teams) {
      console.log(
        `${item.team.id} | ${item.team.name} | ${item.team.country}`,
      )
    }

    throw new Error(
      `Could not uniquely resolve "${expectedName}".`,
    )
  }

  return exact.team.id
}

async function main() {
  console.log('')
  console.log(
    'Haaland Road to 1000',
  )
  console.log(
    'API-Football Team Resolver',
  )
  console.log(
    '--------------------------',
  )

  const raw =
    await fs.readFile(
      CONFIG_PATH,
      'utf8',
    )

  const config =
    JSON.parse(raw) as
      ProviderConfig

  const cityId =
    await findTeam(
      'Manchester City',
      'Manchester City',
    )

  const norwayId =
    await findTeam(
      'Norway',
      'Norway',
    )

  config.teams[
    'Manchester City'
  ].providerTeamId =
    cityId

  config.teams[
    'Norway'
  ].providerTeamId =
    norwayId

  await fs.writeFile(
    CONFIG_PATH,
    JSON.stringify(
      config,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log('')
  console.log(
    `Manchester City ID: ${cityId}`,
  )

  console.log(
    `Norway ID: ${norwayId}`,
  )

  console.log('')
  console.log(
    '✓ Provider team IDs resolved.',
  )
}

main().catch(
  (error: unknown) => {
    console.error('')
    console.error(
      'Team resolution failed.',
    )

    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exitCode = 1
  },
)