import { z } from 'zod'

export const venueSchema = z.enum(['Home', 'Away', 'Neutral'])
export type Venue = z.infer<typeof venueSchema>

export const matchResultSchema = z.enum(['W', 'D', 'L'])
export type MatchResult = z.infer<typeof matchResultSchema>

export const competitionTypeSchema = z.enum([
  'League',
  'Domestic Cup',
  'Continental',
  'International',
  'Other',
])
export type CompetitionType = z.infer<typeof competitionTypeSchema>

export const goalTypeSchema = z.enum([
  'Open Play',
  'Header',
  'Penalty',
  'Free Kick',
  'Other',
  'Unknown',
])
export type GoalType = z.infer<typeof goalTypeSchema>

export const bodyPartSchema = z.enum([
  'Left Foot',
  'Right Foot',
  'Head',
  'Other',
  'Unknown',
])
export type BodyPart = z.infer<typeof bodyPartSchema>

export const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  sourceType: z.enum([
    'Official Club',
    'Official Association',
    'Official Competition',
    'Statistical Provider',
    'News Organization',
    'Secondary Database',
    'Other',
  ]),
  purpose: z.string().min(1),
  coverage: z.string().min(1),
  lastVerified: z.string().date(),
  notes: z.string().nullable(),
})

export type SourceRecord = z.infer<typeof sourceSchema>

export const goalSchema = z.object({
  goalNumber: z.number().int().positive(),
  player: z.literal('Erling Haaland'),
  date: z.string().date(),
  season: z.string().min(1),
  club: z.string().min(1),
  opponent: z.string().min(1),
  competition: z.string().min(1),
  competitionType: competitionTypeSchema,
  venue: venueSchema,

  minute: z.number().int().min(1).max(120).nullable(),
  addedTimeMinute: z.number().int().min(1).max(30).nullable(),

  scoreAfterGoal: z.string().nullable(),
  teamResult: matchResultSchema.nullable(),

  goalType: goalTypeSchema.nullable(),
  bodyPart: bodyPartSchema.nullable(),

  penalty: z.boolean().nullable(),
  freeKick: z.boolean().nullable(),

  assist: z.string().nullable(),
  assistType: z.string().nullable(),

  sourceId: z.string().min(1).nullable(),
  sourceUrl: z.string().url().nullable(),
  sourceName: z.string().nullable(),
  sourcePublishedAt: z.string().date().nullable(),

  verified: z.boolean(),
  verificationNotes: z.string().nullable(),

  matchId: z.string().min(1).nullable(),
})

export type Goal = z.infer<typeof goalSchema>

export const matchSchema = z.object({
  matchId: z.string().min(1),
  date: z.string().date(),
  season: z.string().min(1),
  competition: z.string().min(1),
  club: z.string().min(1),
  opponent: z.string().min(1),
  venue: venueSchema,

  teamGoals: z.number().int().nonnegative().nullable(),
  opponentGoals: z.number().int().nonnegative().nullable(),
  result: matchResultSchema.nullable(),

  playerGoals: z.number().int().nonnegative(),
  minutesPlayed: z.number().int().min(0).max(130).nullable(),
  started: z.boolean().nullable(),

  sourceId: z.string().min(1).nullable(),
  sourceUrl: z.string().url().nullable(),
})

export type Match = z.infer<typeof matchSchema>

export const clubSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  category: z.enum(['Club', 'National Team']),
  country: z.string().min(1),
  activeFrom: z.string().nullable(),
  activeTo: z.string().nullable(),
  displayOrder: z.number().int().nonnegative(),
})

export type Club = z.infer<typeof clubSchema>

export const competitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: competitionTypeSchema,
  countryOrRegion: z.string().min(1),
  active: z.boolean(),
})

export type Competition = z.infer<typeof competitionSchema>

export const milestoneSchema = z.object({
  threshold: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable(),
  category: z.enum([
    'Career',
    'Club',
    'International',
    'Competition',
    'Special',
  ]),
  autoCalculate: z.boolean(),
})

export type Milestone = z.infer<typeof milestoneSchema>

export const dataVersionSchema = z.object({
  version: z.string().min(1),
  lastUpdated: z.string().date(),
  lastVerified: z.string().date(),
  latestGoalNumber: z.number().int().nonnegative().nullable(),
  methodologyVersion: z.string().min(1),
  datasetMode: z.enum(['VERIFIED', 'DEMO', 'MIXED']),
})

export type DataVersion = z.infer<typeof dataVersionSchema>

export const datasetSchema = z.object({
  goals: z.array(goalSchema),
  matches: z.array(matchSchema),
  clubs: z.array(clubSchema),
  competitions: z.array(competitionSchema),
  milestones: z.array(milestoneSchema),
  sources: z.array(sourceSchema),
  dataVersion: dataVersionSchema,
})

export type FootballDataset = z.infer<typeof datasetSchema>

export const verifiedBaselineTeamSchema = z.object({
  team: z.string().min(1),
  expectedGoals: z.number().int().nonnegative(),
  sourceId: z.string().min(1),
})

export type VerifiedBaselineTeam = z.infer<
  typeof verifiedBaselineTeamSchema
>

export const verifiedBaselineSchema = z.object({
  verifiedThrough: z.string().date(),
  methodologyVersion: z.string().min(1),
  careerTotal: z.number().int().nonnegative(),
  teams: z.array(verifiedBaselineTeamSchema),
})

export type VerifiedBaseline = z.infer<
  typeof verifiedBaselineSchema
>

export const goalCandidateSchema = z.object({
  provider: z.enum(['API-Football', 'BSD']),
  providerFixtureId: z.number().int().positive(),
  providerEventId: z.string().min(1),
  providerDetail: z.string().nullable().optional(),
  discoveredAt: z.string().datetime(),
  date: z.string().date(),
  club: z.string().min(1),
  opponent: z.string().min(1),
  competition: z.string().min(1),
  competitionType: competitionTypeSchema,
  venue: venueSchema,
  minute: z.number().int().min(1).max(120).nullable(),
  addedTimeMinute: z.number().int().min(1).max(30).nullable(),
  penalty: z.boolean().nullable(),
  bodyPart: bodyPartSchema.nullable().optional(),
  assist: z.string().nullable().optional(),
  scoreAfterGoal: z.string().nullable().optional(),
  teamResult: matchResultSchema.nullable().optional(),
  sourceUrl: z.string().url().nullable(),
  sourceName: z.string().min(1),
  status: z.enum(['candidate', 'verified', 'promoted', 'rejected']),
  notes: z.string().nullable(),
})

export type GoalCandidate = z.infer<typeof goalCandidateSchema>
