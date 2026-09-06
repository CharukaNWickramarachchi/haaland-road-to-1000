import fs from 'node:fs/promises'
import path from 'node:path'

import {
  verifiedBaselineSchema,
  type VerifiedBaseline,
} from '../src/types/football'

import { loadDataset } from '../src/services/loadDataset'

import { reconcileBaseline } from '../src/services/validation/reconcileBaseline'

async function loadBaseline(): Promise<VerifiedBaseline> {
  const baselinePath = path.join(
    process.cwd(),
    'data',
    'verified-baseline.json',
  )

  const raw = await fs.readFile(
    baselinePath,
    'utf8',
  )

  return verifiedBaselineSchema.parse(
    JSON.parse(raw),
  )
}

async function main() {
  console.log('')
  console.log('Haaland Road to 1000')
  console.log('Baseline Reconciliation')
  console.log('-----------------------')

  const [dataset, baseline] =
    await Promise.all([
      loadDataset(),
      loadBaseline(),
    ])

  const result = reconcileBaseline(
    dataset.goals,
    baseline,
  )

  console.log(
    `Verified through: ${baseline.verifiedThrough}`,
  )

  console.log(
    `Methodology: ${baseline.methodologyVersion}`,
  )

  console.log('')

  console.log(
    'Team'.padEnd(24),
    'Expected'.padStart(10),
    'Actual'.padStart(10),
    'Diff'.padStart(8),
  )

  console.log('-'.repeat(54))

  for (const team of result.teams) {
    console.log(
      team.team.padEnd(24),
      String(team.expectedGoals).padStart(10),
      String(team.actualGoals).padStart(10),
      String(team.difference).padStart(8),
    )
  }

  console.log('-'.repeat(54))

  console.log(
    'CAREER TOTAL'.padEnd(24),
    String(
      result.expectedCareerTotal,
    ).padStart(10),

    String(
      result.actualCareerTotal,
    ).padStart(10),

    String(
      result.totalDifference,
    ).padStart(8),
  )

  console.log('')

  if (result.matchesBaseline) {
    console.log(
      '✓ Canonical dataset matches verified baseline.',
    )
  } else {
    console.log(
      '⚠ Canonical dataset does not yet match verified baseline.',
    )

    console.log(
      'This is expected while historical goal records are still being imported.',
    )
  }
}

main().catch((error: unknown) => {
  console.error('')
  console.error(
    'Baseline reconciliation failed.',
  )

  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exitCode = 1
})