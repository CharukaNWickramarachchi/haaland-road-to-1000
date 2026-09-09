import fs from 'node:fs/promises'
import path from 'node:path'

import {
  goalSchema,
  verifiedBaselineSchema,
  type Goal,
  type VerifiedBaseline,
} from '../src/types/football'

const GOALS_PATH = path.join(process.cwd(), 'data', 'canonical', 'goals.json')
const BASELINE_PATH = path.join(process.cwd(), 'data', 'verified-baseline.json')

function cleanJson(text: string): string {
  return text.replace(/^\uFEFF/, '').trim()
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value == null ? [] : [value]
}

async function loadGoals(): Promise<Goal[]> {
  const text = cleanJson(await fs.readFile(GOALS_PATH, 'utf8'))
  const parsed = JSON.parse(text) as unknown
  return asArray(parsed).map((record) => goalSchema.parse(record))
}

async function loadBaseline(): Promise<VerifiedBaseline> {
  const text = cleanJson(await fs.readFile(BASELINE_PATH, 'utf8'))
  return verifiedBaselineSchema.parse(JSON.parse(text))
}

async function main(): Promise<void> {
  const goals = await loadGoals()
  const baseline = await loadBaseline()
  const verifiedGoals = goals.filter((goal) => goal.verified)
  const latest = verifiedGoals.at(-1)

  const teams = baseline.teams.map((entry) => {
    const expectedGoals = verifiedGoals.filter((goal) => goal.club === entry.team).length
    const changed = expectedGoals !== entry.expectedGoals

    return {
      ...entry,
      expectedGoals,
      sourceId:
        changed && (entry.team === 'Manchester City' || entry.team === 'Norway')
          ? 'bsd-live-events'
          : entry.sourceId,
    }
  })

  const updated = verifiedBaselineSchema.parse({
    ...baseline,
    verifiedThrough: latest?.date ?? baseline.verifiedThrough,
    careerTotal: verifiedGoals.length,
    teams,
  })

  await fs.writeFile(BASELINE_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8')

  console.log('')
  console.log('Verified baseline synchronized.')
  console.log(`Verified through: ${updated.verifiedThrough}`)
  console.log(`Career total: ${updated.careerTotal}`)

  for (const team of updated.teams) {
    console.log(`${team.team}: ${team.expectedGoals}`)
  }
}

main().catch((error: unknown) => {
  console.error('')
  console.error('Baseline synchronization failed.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
