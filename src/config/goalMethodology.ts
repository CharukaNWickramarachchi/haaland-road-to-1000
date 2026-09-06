export const GOAL_METHODOLOGY_VERSION = '1.0'

export const CAREER_GOAL_TARGET = 1000

export const goalMethodology = {
  include: {
    seniorClubFirstTeam: true,
    seniorNationalTeam: true,
    domesticLeague: true,
    domesticCup: true,
    continentalCompetition: true,
    continentalQualifying: true,
    seniorInternationalCompetitive: true,
    seniorInternationalFriendly: true,
  },

  exclude: {
    youthMatches: true,
    reserveMatches: true,
    academyMatches: true,
    clubFriendlies: true,
    penaltyShootoutConversions: true,
    ownGoalsNotCreditedToHaaland: true,
  },

  abandonedMatchPolicy:
    'Count only when the relevant governing body preserves the official match statistics.',

  missingDataPolicy:
    'Unknown attributes must remain null and must never be inferred.',

  verificationRequired: true,
} as const