import type { FootballDataset } from '../types/football'
import { staticJsonProvider } from './StaticJsonProvider'

export async function loadDataset(): Promise<FootballDataset> {
  const [
    goals,
    matches,
    clubs,
    competitions,
    milestones,
    sources,
    dataVersion,
  ] = await Promise.all([
    staticJsonProvider.getGoals(),
    staticJsonProvider.getMatches(),
    staticJsonProvider.getClubs(),
    staticJsonProvider.getCompetitions(),
    staticJsonProvider.getMilestones(),
    staticJsonProvider.getSources(),
    staticJsonProvider.getDataVersion(),
  ])

  return {
    goals,
    matches,
    clubs,
    competitions,
    milestones,
    sources,
    dataVersion,
  }
}