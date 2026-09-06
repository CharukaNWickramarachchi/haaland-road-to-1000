import type { Goal } from '../../types/football'

export interface GoalMinuteBucket {
  label: string
  goals: number
}

export interface OpponentStat {
  opponent: string
  goals: number
  matchesScoredIn: number
  clubs: string[]
  competitions: string[]
}

export interface MultiGoalMatch {
  matchId: string
  date: string
  club: string
  opponent: string
  competition: string
  goals: number
  goalNumbers: number[]
}

export interface DataCoverage {
  totalGoals: number
  minuteKnown: number
  minuteCoveragePercentage: number
  bodyPartKnown: number
  bodyPartCoveragePercentage: number
  goalTypeKnown: number
  goalTypeCoveragePercentage: number
  assistKnown: number
  assistCoveragePercentage: number
}

function percentage(
  value: number,
  total: number,
): number {
  if (total === 0) {
    return 0
  }

  return (value / total) * 100
}

export function getGoalMinuteBuckets(
  goals: Goal[],
): GoalMinuteBucket[] {
  const buckets: GoalMinuteBucket[] = [
    { label: '1–15', goals: 0 },
    { label: '16–30', goals: 0 },
    { label: '31–45+', goals: 0 },
    { label: '46–60', goals: 0 },
    { label: '61–75', goals: 0 },
    { label: '76–90+', goals: 0 },
    { label: 'Extra time', goals: 0 },
    { label: 'Unknown', goals: 0 },
  ]

  for (const goal of goals) {
    const minute = goal.minute

    if (minute === null) {
      buckets[7].goals += 1
      continue
    }

    if (minute <= 15) {
      buckets[0].goals += 1
    } else if (minute <= 30) {
      buckets[1].goals += 1
    } else if (minute <= 45) {
      buckets[2].goals += 1
    } else if (minute <= 60) {
      buckets[3].goals += 1
    } else if (minute <= 75) {
      buckets[4].goals += 1
    } else if (minute <= 90) {
      buckets[5].goals += 1
    } else {
      buckets[6].goals += 1
    }
  }

  return buckets
}

export function getAverageGoalMinute(
  goals: Goal[],
): number | null {
  const knownMinutes = goals
    .map((goal) => goal.minute)
    .filter(
      (minute): minute is number =>
        minute !== null,
    )

  if (knownMinutes.length === 0) {
    return null
  }

  return (
    knownMinutes.reduce(
      (sum, minute) =>
        sum + minute,
      0,
    ) / knownMinutes.length
  )
}

export function getMedianGoalMinute(
  goals: Goal[],
): number | null {
  const minutes = goals
    .map((goal) => goal.minute)
    .filter(
      (minute): minute is number =>
        minute !== null,
    )
    .sort((a, b) => a - b)

  if (minutes.length === 0) {
    return null
  }

  const middle =
    Math.floor(
      minutes.length / 2,
    )

  if (
    minutes.length % 2 === 0
  ) {
    return (
      (
        minutes[middle - 1] +
        minutes[middle]
      ) / 2
    )
  }

  return minutes[middle]
}

export function getOpponentStats(
  goals: Goal[],
): OpponentStat[] {
  const grouped =
    new Map<string, Goal[]>()

  for (const goal of goals) {
    const existing =
      grouped.get(
        goal.opponent,
      ) ?? []

    existing.push(goal)

    grouped.set(
      goal.opponent,
      existing,
    )
  }

  return Array.from(
    grouped.entries(),
  )
    .map(
      ([opponent, opponentGoals]) => ({
        opponent,
        goals:
          opponentGoals.length,

        matchesScoredIn:
          new Set(
            opponentGoals.map(
              (goal) =>
                goal.matchId ??
                [
                  goal.date,
                  goal.club,
                  goal.opponent,
                  goal.competition,
                ].join('|'),
            ),
          ).size,

        clubs: [
          ...new Set(
            opponentGoals.map(
              (goal) =>
                goal.club,
            ),
          ),
        ],

        competitions: [
          ...new Set(
            opponentGoals.map(
              (goal) =>
                goal.competition,
            ),
          ),
        ],
      }),
    )
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        a.opponent.localeCompare(
          b.opponent,
        ),
    )
}

export function getMultiGoalMatches(
  goals: Goal[],
): MultiGoalMatch[] {
  const grouped =
    new Map<string, Goal[]>()

  for (const goal of goals) {
    const key =
      goal.matchId ??
      [
        goal.date,
        goal.club,
        goal.opponent,
        goal.competition,
      ].join('|')

    const existing =
      grouped.get(key) ?? []

    existing.push(goal)

    grouped.set(
      key,
      existing,
    )
  }

  return Array.from(
    grouped.entries(),
  )
    .filter(
      ([, matchGoals]) =>
        matchGoals.length >= 2,
    )
    .map(
      ([matchId, matchGoals]) => {
        const first =
          matchGoals[0]

        return {
          matchId,
          date: first.date,
          club: first.club,
          opponent:
            first.opponent,
          competition:
            first.competition,
          goals:
            matchGoals.length,
          goalNumbers:
            matchGoals
              .map(
                (goal) =>
                  goal.goalNumber,
              )
              .sort(
                (a, b) =>
                  a - b,
              ),
        }
      },
    )
    .sort(
      (a, b) =>
        b.goals - a.goals ||
        b.date.localeCompare(
          a.date,
        ),
    )
}

export function getHatTricks(
  goals: Goal[],
): MultiGoalMatch[] {
  return getMultiGoalMatches(
    goals,
  ).filter(
    (match) =>
      match.goals >= 3,
  )
}

export function getFourGoalMatches(
  goals: Goal[],
): MultiGoalMatch[] {
  return getMultiGoalMatches(
    goals,
  ).filter(
    (match) =>
      match.goals >= 4,
  )
}

export function getFiveGoalMatches(
  goals: Goal[],
): MultiGoalMatch[] {
  return getMultiGoalMatches(
    goals,
  ).filter(
    (match) =>
      match.goals >= 5,
  )
}

export function getDataCoverage(
  goals: Goal[],
): DataCoverage {
  const totalGoals =
    goals.length

  const minuteKnown =
    goals.filter(
      (goal) =>
        goal.minute !== null,
    ).length

  const bodyPartKnown =
    goals.filter(
      (goal) =>
        goal.bodyPart !== null &&
        goal.bodyPart !==
          'Unknown',
    ).length

  const goalTypeKnown =
    goals.filter(
      (goal) =>
        goal.goalType !== null &&
        goal.goalType !==
          'Unknown',
    ).length

  const assistKnown =
    goals.filter(
      (goal) =>
        goal.assist !== null,
    ).length

  return {
    totalGoals,

    minuteKnown,

    minuteCoveragePercentage:
      percentage(
        minuteKnown,
        totalGoals,
      ),

    bodyPartKnown,

    bodyPartCoveragePercentage:
      percentage(
        bodyPartKnown,
        totalGoals,
      ),

    goalTypeKnown,

    goalTypeCoveragePercentage:
      percentage(
        goalTypeKnown,
        totalGoals,
      ),

    assistKnown,

    assistCoveragePercentage:
      percentage(
        assistKnown,
        totalGoals,
      ),
  }
}