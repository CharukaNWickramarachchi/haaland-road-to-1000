import type { Goal } from '../../types/football'

const DAYS_PER_YEAR = 365.2425

export interface GoalRate {
  goals: number
  days: number
  goalsPerDay: number
  goalsPerYear: number
}

export interface ProjectionScenario {
  name: string
  description: string
  goalsPerYear: number
  remainingGoals: number
  estimatedYears: number | null
  projectedDate: string | null
}

export interface MonteCarloSummary {
  simulations: number
  targetGoals: number
  currentGoals: number
  remainingGoals: number
  medianDate: string | null
  percentile10Date: string | null
  percentile25Date: string | null
  percentile75Date: string | null
  percentile90Date: string | null
  medianYears: number | null
  percentile10Years: number | null
  percentile90Years: number | null
}

export interface ProjectionInputs {
  targetGoals: number
  recentGoalWindow: number
  careerWeight: number
  recentWeight: number
  rateMultiplier: number
}

function parseDate(
  value: string,
): Date {
  const date = new Date(
    `${value}T00:00:00Z`,
  )

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid goal date "${value}".`,
    )
  }

  return date
}

function daysBetween(
  first: Date,
  second: Date,
): number {
  return Math.max(
    (
      second.getTime() -
      first.getTime()
    ) /
      (1000 * 60 * 60 * 24),
    0,
  )
}

function addDays(
  date: Date,
  days: number,
): Date {
  const result =
    new Date(date)

  result.setUTCDate(
    result.getUTCDate() +
      Math.round(days),
  )

  return result
}

function formatDate(
  date: Date,
): string {
  return date
    .toISOString()
    .slice(0, 10)
}

function sortGoals(
  goals: Goal[],
): Goal[] {
  return [...goals].sort(
    (a, b) =>
      a.date.localeCompare(
        b.date,
      ) ||
      a.goalNumber -
        b.goalNumber,
  )
}

export function getCareerGoalRate(
  goals: Goal[],
): GoalRate | null {
  const sorted =
    sortGoals(goals)

  if (sorted.length < 2) {
    return null
  }

  const firstDate =
    parseDate(
      sorted[0].date,
    )

  const lastDate =
    parseDate(
      sorted.at(-1)!.date,
    )

  const days =
    daysBetween(
      firstDate,
      lastDate,
    )

  if (days <= 0) {
    return null
  }

  const goalIntervals =
    sorted.length - 1

  const goalsPerDay =
    goalIntervals / days

  return {
    goals: goalIntervals,
    days,
    goalsPerDay,
    goalsPerYear:
      goalsPerDay *
      DAYS_PER_YEAR,
  }
}

export function getRecentGoalRate(
  goals: Goal[],
  recentGoalWindow = 50,
): GoalRate | null {
  const sorted =
    sortGoals(goals)

  if (sorted.length < 2) {
    return null
  }

  const windowSize =
    Math.max(
      2,
      Math.min(
        recentGoalWindow,
        sorted.length,
      ),
    )

  const recent =
    sorted.slice(
      -windowSize,
    )

  const firstDate =
    parseDate(
      recent[0].date,
    )

  const lastDate =
    parseDate(
      recent.at(-1)!.date,
    )

  const days =
    daysBetween(
      firstDate,
      lastDate,
    )

  if (days <= 0) {
    return null
  }

  const goalIntervals =
    recent.length - 1

  const goalsPerDay =
    goalIntervals /
    days

  return {
    goals:
      goalIntervals,
    days,
    goalsPerDay,
    goalsPerYear:
      goalsPerDay *
      DAYS_PER_YEAR,
  }
}

export function getBlendedGoalRate(
  careerRate:
    | GoalRate
    | null,
  recentRate:
    | GoalRate
    | null,
  careerWeight = 0.4,
  recentWeight = 0.6,
): number | null {
  if (
    !careerRate &&
    !recentRate
  ) {
    return null
  }

  if (!careerRate) {
    return (
      recentRate?.goalsPerYear ??
      null
    )
  }

  if (!recentRate) {
    return careerRate.goalsPerYear
  }

  const totalWeight =
    careerWeight +
    recentWeight

  if (totalWeight <= 0) {
    return null
  }

  return (
    (
      careerRate.goalsPerYear *
        careerWeight +
      recentRate.goalsPerYear *
        recentWeight
    ) /
    totalWeight
  )
}

export function createProjectionScenario(
  name: string,
  description: string,
  goalsPerYear: number,
  currentGoals: number,
  targetGoals: number,
  startingDate: string,
): ProjectionScenario {
  const remainingGoals =
    Math.max(
      targetGoals -
        currentGoals,
      0,
    )

  if (
    remainingGoals === 0
  ) {
    return {
      name,
      description,
      goalsPerYear,
      remainingGoals: 0,
      estimatedYears: 0,
      projectedDate:
        startingDate,
    }
  }

  if (
    goalsPerYear <= 0
  ) {
    return {
      name,
      description,
      goalsPerYear,
      remainingGoals,
      estimatedYears: null,
      projectedDate: null,
    }
  }

  const estimatedYears =
    remainingGoals /
    goalsPerYear

  const days =
    estimatedYears *
    DAYS_PER_YEAR

  const projectedDate =
    formatDate(
      addDays(
        parseDate(
          startingDate,
        ),
        days,
      ),
    )

  return {
    name,
    description,
    goalsPerYear,
    remainingGoals,
    estimatedYears,
    projectedDate,
  }
}

export function buildProjectionScenarios(
  goals: Goal[],
  inputs: ProjectionInputs,
): ProjectionScenario[] {
  if (goals.length === 0) {
    return []
  }

  const sorted =
    sortGoals(goals)

  const currentGoals =
    goals.length

  const latestDate =
    sorted.at(-1)!.date

  const careerRate =
    getCareerGoalRate(
      goals,
    )

  const recentRate =
    getRecentGoalRate(
      goals,
      inputs.recentGoalWindow,
    )

  const blendedRate =
    getBlendedGoalRate(
      careerRate,
      recentRate,
      inputs.careerWeight,
      inputs.recentWeight,
    )

  const scenarios:
    ProjectionScenario[] = []

  if (careerRate) {
    scenarios.push(
      createProjectionScenario(
        'Career Rate',
        'Extends the historical career scoring pace forward without additional weighting.',
        careerRate.goalsPerYear *
          inputs.rateMultiplier,
        currentGoals,
        inputs.targetGoals,
        latestDate,
      ),
    )
  }

  if (recentRate) {
    scenarios.push(
      createProjectionScenario(
        'Recent Form',
        `Uses the most recent ${inputs.recentGoalWindow} recorded goals as the rate window.`,
        recentRate.goalsPerYear *
          inputs.rateMultiplier,
        currentGoals,
        inputs.targetGoals,
        latestDate,
      ),
    )
  }

  if (
    blendedRate !== null
  ) {
    scenarios.push(
      createProjectionScenario(
        'Weighted Blend',
        'Combines career pace with recent scoring pace using the selected weights.',
        blendedRate *
          inputs.rateMultiplier,
        currentGoals,
        inputs.targetGoals,
        latestDate,
      ),
    )
  }

  return scenarios
}

export function getInterGoalIntervals(
  goals: Goal[],
): number[] {
  const sorted =
    sortGoals(goals)

  const intervals: number[] =
    []

  for (
    let index = 1;
    index <
    sorted.length;
    index += 1
  ) {
    const previous =
      parseDate(
        sorted[
          index - 1
        ].date,
      )

    const current =
      parseDate(
        sorted[index].date,
      )

    intervals.push(
      Math.max(
        daysBetween(
          previous,
          current,
        ),
        0.25,
      ),
    )
  }

  return intervals
}

function percentile(
  sortedValues: number[],
  probability: number,
): number | null {
  if (
    sortedValues.length === 0
  ) {
    return null
  }

  const index =
    (
      sortedValues.length -
      1
    ) *
    probability

  const lower =
    Math.floor(index)

  const upper =
    Math.ceil(index)

  if (lower === upper) {
    return sortedValues[lower]
  }

  const weight =
    index - lower

  return (
    sortedValues[lower] *
      (1 - weight) +
    sortedValues[upper] *
      weight
  )
}

function createSeededRandom(
  seed: number,
): () => number {
  let state =
    seed >>> 0

  return () => {
    state =
      (
        state *
          1664525 +
        1013904223
      ) >>>
      0

    return (
      state /
      4294967296
    )
  }
}

export function runMonteCarloProjection(
  goals: Goal[],
  targetGoals = 1000,
  simulations = 10000,
  recentGoalWindow = 75,
  rateMultiplier = 1,
  seed = 1000,
): MonteCarloSummary {
  if (goals.length === 0) {
    return {
      simulations,
      targetGoals,
      currentGoals: 0,
      remainingGoals:
        targetGoals,
      medianDate: null,
      percentile10Date: null,
      percentile25Date: null,
      percentile75Date: null,
      percentile90Date: null,
      medianYears: null,
      percentile10Years: null,
      percentile90Years: null,
    }
  }

  const sorted =
    sortGoals(goals)

  const currentGoals =
    goals.length

  const remainingGoals =
    Math.max(
      targetGoals -
        currentGoals,
      0,
    )

  const latestDate =
    parseDate(
      sorted.at(-1)!.date,
    )

  if (
    remainingGoals === 0
  ) {
    const date =
      formatDate(
        latestDate,
      )

    return {
      simulations,
      targetGoals,
      currentGoals,
      remainingGoals: 0,
      medianDate: date,
      percentile10Date: date,
      percentile25Date: date,
      percentile75Date: date,
      percentile90Date: date,
      medianYears: 0,
      percentile10Years: 0,
      percentile90Years: 0,
    }
  }

  const allIntervals =
    getInterGoalIntervals(
      goals,
    )

  const recentIntervals =
    allIntervals.slice(
      -Math.max(
        1,
        recentGoalWindow - 1,
      ),
    )

  if (
    recentIntervals.length === 0
  ) {
    return {
      simulations,
      targetGoals,
      currentGoals,
      remainingGoals,
      medianDate: null,
      percentile10Date: null,
      percentile25Date: null,
      percentile75Date: null,
      percentile90Date: null,
      medianYears: null,
      percentile10Years: null,
      percentile90Years: null,
    }
  }

  const random =
    createSeededRandom(
      seed,
    )

  const projectedDays: number[] =
    []

  for (
    let simulation = 0;
    simulation <
    simulations;
    simulation += 1
  ) {
    let days = 0

    for (
      let goal = 0;
      goal <
      remainingGoals;
      goal += 1
    ) {
      const index =
        Math.floor(
          random() *
            recentIntervals.length,
        )

      const sampledInterval =
        recentIntervals[
          index
        ]

      days +=
        sampledInterval /
        Math.max(
          rateMultiplier,
          0.05,
        )
    }

    projectedDays.push(
      days,
    )
  }

  projectedDays.sort(
    (a, b) => a - b,
  )

  const p10 =
    percentile(
      projectedDays,
      0.1,
    )

  const p25 =
    percentile(
      projectedDays,
      0.25,
    )

  const p50 =
    percentile(
      projectedDays,
      0.5,
    )

  const p75 =
    percentile(
      projectedDays,
      0.75,
    )

  const p90 =
    percentile(
      projectedDays,
      0.9,
    )

  function dateFromDays(
    days:
      | number
      | null,
  ): string | null {
    if (days === null) {
      return null
    }

    return formatDate(
      addDays(
        latestDate,
        days,
      ),
    )
  }

  function yearsFromDays(
    days:
      | number
      | null,
  ): number | null {
    if (days === null) {
      return null
    }

    return (
      days /
      DAYS_PER_YEAR
    )
  }

  return {
    simulations,
    targetGoals,
    currentGoals,
    remainingGoals,

    medianDate:
      dateFromDays(p50),

    percentile10Date:
      dateFromDays(p10),

    percentile25Date:
      dateFromDays(p25),

    percentile75Date:
      dateFromDays(p75),

    percentile90Date:
      dateFromDays(p90),

    medianYears:
      yearsFromDays(p50),

    percentile10Years:
      yearsFromDays(p10),

    percentile90Years:
      yearsFromDays(p90),
  }
}