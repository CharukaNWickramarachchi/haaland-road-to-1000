import type {
  FootballDataset,
  Goal,
  SourceRecord,
} from '../../types/football'

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  severity: ValidationSeverity
  code: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export function validateDataset(
  dataset: FootballDataset,
): ValidationResult {
  const issues: ValidationIssue[] = []

  validateGoalNumbers(dataset.goals, issues)
  validateGoalSequence(dataset.goals, issues)
  validateDuplicateGoals(dataset.goals, issues)
  validateVerifiedGoalSources(
    dataset.goals,
    dataset.sources,
    issues,
  )
  validateSourceReferences(
    dataset.goals,
    dataset.sources,
    issues,
  )
  validateLatestGoalNumber(dataset, issues)

  const errors = issues.filter(
    (issue) => issue.severity === 'error',
  )

  const warnings = issues.filter(
    (issue) => issue.severity === 'warning',
  )

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateGoalNumbers(
  goals: Goal[],
  issues: ValidationIssue[],
) {
  const seen = new Set<number>()

  for (const goal of goals) {
    if (seen.has(goal.goalNumber)) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_GOAL_NUMBER',
        message: `Goal number ${goal.goalNumber} appears more than once.`,
      })
    }

    seen.add(goal.goalNumber)
  }
}

function validateGoalSequence(
  goals: Goal[],
  issues: ValidationIssue[],
) {
  if (goals.length === 0) {
    return
  }

  const goalNumbers = [...new Set(
    goals.map((goal) => goal.goalNumber),
  )].sort((a, b) => a - b)

  const firstGoal = goalNumbers[0]
  const lastGoal = goalNumbers[goalNumbers.length - 1]

  if (firstGoal !== 1) {
    issues.push({
      severity: 'error',
      code: 'GOAL_SEQUENCE_START',
      message: `Canonical goal numbering must start at 1, but starts at ${firstGoal}.`,
    })
  }

  for (
    let expected = firstGoal;
    expected <= lastGoal;
    expected += 1
  ) {
    if (!goalNumbers.includes(expected)) {
      issues.push({
        severity: 'error',
        code: 'GOAL_SEQUENCE_GAP',
        message: `Goal number ${expected} is missing from the canonical sequence.`,
      })
    }
  }
}

function validateDuplicateGoals(
  goals: Goal[],
  issues: ValidationIssue[],
) {
  const fingerprints = new Map<string, Goal[]>()

  for (const goal of goals) {
    const fingerprint = createGoalFingerprint(goal)

    const existing = fingerprints.get(fingerprint) ?? []
    existing.push(goal)
    fingerprints.set(fingerprint, existing)
  }

  for (const [fingerprint, matchingGoals] of fingerprints) {
    if (matchingGoals.length <= 1) {
      continue
    }

    const numbers = matchingGoals
      .map((goal) => goal.goalNumber)
      .join(', ')

    issues.push({
      severity: 'error',
      code: 'POSSIBLE_DUPLICATE_GOAL',
      message:
        `Possible duplicate goal records detected for goal numbers ${numbers}. ` +
        `Fingerprint: ${fingerprint}`,
    })
  }
}

function createGoalFingerprint(goal: Goal): string {
  return [
    goal.date,
    goal.club,
    goal.opponent,
    goal.competition,
    goal.minute ?? 'unknown-minute',
    goal.addedTimeMinute ?? 'no-added-time',
    goal.matchId ?? 'unknown-match',
  ]
    .join('|')
    .toLowerCase()
}

function validateVerifiedGoalSources(
  goals: Goal[],
  sources: SourceRecord[],
  issues: ValidationIssue[],
) {
  const sourceIds = new Set(
    sources.map((source) => source.id),
  )

  for (const goal of goals) {
    if (!goal.verified) {
      continue
    }

    const hasRegisteredSource =
      goal.sourceId !== null &&
      sourceIds.has(goal.sourceId)

    const hasDirectSourceUrl =
      goal.sourceUrl !== null

    if (!hasRegisteredSource && !hasDirectSourceUrl) {
      issues.push({
        severity: 'error',
        code: 'VERIFIED_GOAL_WITHOUT_SOURCE',
        message:
          `Goal #${goal.goalNumber} is marked verified but has no registered source or direct source URL.`,
      })
    }
  }
}

function validateSourceReferences(
  goals: Goal[],
  sources: SourceRecord[],
  issues: ValidationIssue[],
) {
  const sourceIds = new Set(
    sources.map((source) => source.id),
  )

  for (const goal of goals) {
    if (
      goal.sourceId !== null &&
      !sourceIds.has(goal.sourceId)
    ) {
      issues.push({
        severity: 'error',
        code: 'UNKNOWN_SOURCE_ID',
        message:
          `Goal #${goal.goalNumber} references unknown source ID "${goal.sourceId}".`,
      })
    }
  }
}

function validateLatestGoalNumber(
  dataset: FootballDataset,
  issues: ValidationIssue[],
) {
  const { goals, dataVersion } = dataset

  if (goals.length === 0) {
    if (dataVersion.latestGoalNumber !== null) {
      issues.push({
        severity: 'error',
        code: 'LATEST_GOAL_WITH_EMPTY_DATASET',
        message:
          'latestGoalNumber must be null when the canonical goal dataset is empty.',
      })
    }

    return
  }

  const maximumGoalNumber = Math.max(
    ...goals.map((goal) => goal.goalNumber),
  )

  if (dataVersion.latestGoalNumber === null) {
    issues.push({
      severity: 'warning',
      code: 'LATEST_GOAL_NUMBER_MISSING',
      message:
        `The dataset contains goals through #${maximumGoalNumber}, but latestGoalNumber is null.`,
    })

    return
  }

  if (
    dataVersion.latestGoalNumber !== maximumGoalNumber
  ) {
    issues.push({
      severity: 'error',
      code: 'LATEST_GOAL_NUMBER_MISMATCH',
      message:
        `latestGoalNumber is ${dataVersion.latestGoalNumber}, but the canonical dataset ends at goal #${maximumGoalNumber}.`,
    })
  }
}