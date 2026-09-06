import {
  clubSchema,
  competitionSchema,
  dataVersionSchema,
  goalSchema,
  matchSchema,
  milestoneSchema,
  sourceSchema,
  type Club,
  type Competition,
  type DataVersion,
  type Goal,
  type Match,
  type Milestone,
  type SourceRecord,
} from '../types/football'

import type { FootballDataProvider } from './FootballDataProvider'

import goalsJson from '../../data/canonical/goals.json'
import matchesJson from '../../data/matches.json'
import clubsJson from '../../data/clubs.json'
import competitionsJson from '../../data/competitions.json'
import milestonesJson from '../../data/milestones.json'
import sourcesJson from '../../data/sources.json'
import dataVersionJson from '../../data/data-version.json'

export class StaticJsonProvider implements FootballDataProvider {
  async getGoals(): Promise<Goal[]> {
    return goalSchema.array().parse(goalsJson)
  }

  async getMatches(): Promise<Match[]> {
    return matchSchema.array().parse(matchesJson)
  }

  async getClubs(): Promise<Club[]> {
    return clubSchema.array().parse(clubsJson)
  }

  async getCompetitions(): Promise<Competition[]> {
    return competitionSchema.array().parse(competitionsJson)
  }

  async getMilestones(): Promise<Milestone[]> {
    return milestoneSchema.array().parse(milestonesJson)
  }

  async getSources(): Promise<SourceRecord[]> {
    return sourceSchema.array().parse(sourcesJson)
  }

  async getDataVersion(): Promise<DataVersion> {
    return dataVersionSchema.parse(dataVersionJson)
  }
}

export const staticJsonProvider = new StaticJsonProvider()