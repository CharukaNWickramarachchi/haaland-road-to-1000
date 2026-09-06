import type {
  Club,
  Competition,
  DataVersion,
  Goal,
  Match,
  Milestone,
  SourceRecord,
} from '../types/football'

export interface FootballDataProvider {
  getGoals(): Promise<Goal[]>
  getMatches(): Promise<Match[]>
  getClubs(): Promise<Club[]>
  getCompetitions(): Promise<Competition[]>
  getMilestones(): Promise<Milestone[]>
  getSources(): Promise<SourceRecord[]>
  getDataVersion(): Promise<DataVersion>
}