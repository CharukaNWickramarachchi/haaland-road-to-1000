import {
  ArrowRight,
  CheckCircle2,
  Flag,
  Shield,
  Target,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { CareerProgressChart } from '../charts/career/CareerProgressChart'
import { SeasonGoalsChart } from '../charts/career/SeasonGoalsChart'
import { TeamGoalsChart } from '../charts/career/TeamGoalsChart'

import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  getAwayGoals,
  getCareerGoals,
  getClubGoals,
  getCumulativeGoalProgress,
  getGoalsByClub,
  getGoalsByCompetition,
  getGoalsBySeason,
  getHomeGoals,
  getInternationalGoals,
  getLatestGoal,
  getMilestoneStatuses,
  getNextMilestone,
  getNonPenaltyGoals,
  getPenaltyGoals,
  getProgressStats,
} from '../lib/statistics'

export function CareerPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <PageMessage text="Loading career analytics…" />
    )
  }

  if (error || !data) {
    return (
      <PageMessage text="Career data could not be loaded." />
    )
  }

  const totalGoals =
    getCareerGoals(
      data.goals,
    )

  const clubGoals =
    getClubGoals(
      data.goals,
    )

  const internationalGoals =
    getInternationalGoals(
      data.goals,
    )

  const progress =
    getProgressStats(
      data.goals,
    )

  const latestGoal =
    getLatestGoal(
      data.goals,
    )

  const nextMilestone =
    getNextMilestone(
      data.goals,
      data.milestones,
    )

  const goalsByClub =
    getGoalsByClub(
      data.goals,
    )

  const goalsBySeason =
    getGoalsBySeason(
      data.goals,
    )

  const goalsByCompetition =
    getGoalsByCompetition(
      data.goals,
    )

  const cumulative =
    getCumulativeGoalProgress(
      data.goals,
    )

  const milestones =
    getMilestoneStatuses(
      data.goals,
      data.milestones,
    )

  const penaltyGoals =
    getPenaltyGoals(
      data.goals,
    )

  const nonPenaltyGoals =
    getNonPenaltyGoals(
      data.goals,
    )

  const homeGoals =
    getHomeGoals(
      data.goals,
    )

  const awayGoals =
    getAwayGoals(
      data.goals,
    )

  const reachedMilestones =
    milestones.filter(
      (item) =>
        item.reached,
    )

  const topCompetitions =
    goalsByCompetition.slice(
      0,
      8,
    )

  return (
    <>
      <section className="border-b border-white/8">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
            Career analytics
          </p>

          <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-[-0.055em] text-white uppercase sm:text-7xl lg:text-[88px]">
                The Career
                <span className="block text-white/25">
                  So Far.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
                Every total on this page is derived from the canonical
                goal-by-goal dataset rather than manually entered
                aggregate statistics.
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-[88px] leading-none font-black tracking-[-0.07em] text-[#6CABDD] sm:text-[120px]">
                {totalGoals}
              </p>

              <p className="mt-2 text-xs font-bold tracking-[0.22em] text-white/35 uppercase">
                Verified senior goals
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/8">
        <div className="mx-auto grid max-w-[1440px] gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
          <HeroStat
            icon={
              <Shield size={18} />
            }
            label="Club goals"
            value={clubGoals}
          />

          <HeroStat
            icon={
              <Flag size={18} />
            }
            label="Norway goals"
            value={
              internationalGoals
            }
          />

          <HeroStat
            icon={
              <Target size={18} />
            }
            label="Remaining to 1000"
            value={
              progress.remainingGoals
            }
          />

          <HeroStat
            icon={
              <Trophy size={18} />
            }
            label="Next milestone"
            value={
              nextMilestone
                ?.threshold ??
              1000
            }
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
          <ChartPanel
            eyebrow="Career progression"
            title="The Road"
            description="Cumulative verified senior goals plotted against time with 1000 as the fixed destination."
          >
            <CareerProgressChart
              data={cumulative}
            />
          </ChartPanel>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard
              label="Progress"
              value={`${progress.progressPercentage.toFixed(
                1,
              )}%`}
              note={`${progress.remainingGoals} goals remain`}
            />

            <MetricCard
              label="Penalty goals"
              value={
                penaltyGoals
              }
              note={`${nonPenaltyGoals} non-penalty`}
            />

            <MetricCard
              label="Home goals"
              value={
                homeGoals
              }
              note={`${awayGoals} away goals`}
            />

            <MetricCard
              label="Dataset"
              value={`v${data.dataVersion.version}`}
              note={`Verified through ${data.dataVersion.lastVerified}`}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartPanel
            eyebrow="Team breakdown"
            title="Goals by Team"
            description="Senior first-team club goals and Norway senior international goals."
          >
            <TeamGoalsChart
              data={
                goalsByClub
              }
            />
          </ChartPanel>

          <ChartPanel
            eyebrow="Season output"
            title="Goals by Season"
            description="Canonical scoring totals grouped by recorded season."
          >
            <SeasonGoalsChart
              data={
                goalsBySeason
              }
            />
          </ChartPanel>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
              Competitions
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] uppercase sm:text-5xl">
              Where the
              <span className="block text-white/25">
                goals came.
              </span>
            </h2>
          </div>

          <div className="border-t border-white/8">
            {topCompetitions.map(
              (
                competition,
                index,
              ) => (
                <div
                  key={
                    competition.key
                  }
                  className="grid grid-cols-[45px_1fr_auto] items-center gap-4 border-b border-white/8 py-5"
                >
                  <span className="text-xs font-black text-white/20">
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )}
                  </span>

                  <p className="font-semibold text-white/65">
                    {
                      competition.key
                    }
                  </p>

                  <p className="text-2xl font-black text-[#6CABDD]">
                    {
                      competition.goals
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
                Career milestones
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] uppercase sm:text-5xl">
                The checkpoints
              </h2>
            </div>

            <p className="text-sm text-white/35">
              {
                reachedMilestones.length
              }{' '}
              milestone
              {reachedMilestones.length ===
              1
                ? ''
                : 's'}{' '}
              reached
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {milestones.map(
              (milestone) => (
                <MilestoneCard
                  key={
                    milestone.threshold
                  }
                  milestone={
                    milestone
                  }
                />
              ),
            )}
          </div>
        </div>

        {latestGoal && (
          <div className="mt-20 border border-[#6CABDD]/20 bg-[#6CABDD]/5 p-6 sm:p-8">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-[#6CABDD] uppercase">
                  Latest canonical
                  record
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">
                  Goal #
                  {
                    latestGoal.goalNumber
                  }{' '}
                  vs{' '}
                  {
                    latestGoal.opponent
                  }
                </h2>

                <p className="mt-3 text-sm text-white/40">
                  {
                    latestGoal.date
                  }{' '}
                  ·{' '}
                  {
                    latestGoal.club
                  }{' '}
                  ·{' '}
                  {
                    latestGoal.competition
                  }
                </p>
              </div>

              <Link
                to={`/goals/${latestGoal.goalNumber}`}
                className="inline-flex items-center gap-2 border border-[#6CABDD]/30 px-5 py-3 text-xs font-bold tracking-[0.15em] text-[#8FC9ED] uppercase transition hover:bg-[#6CABDD]/10"
              >
                Open record
                <ArrowRight
                  size={14}
                />
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

interface HeroStatProps {
  icon: React.ReactNode
  label: string
  value: number
}

function HeroStat({
  icon,
  label,
  value,
}: HeroStatProps) {
  return (
    <div className="bg-[#080b0f] p-6 sm:p-8">
      <div className="text-[#6CABDD]">
        {icon}
      </div>

      <p className="mt-5 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black tracking-[-0.04em]">
        {value}
      </p>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value:
    | string
    | number
  note: string
}

function MetricCard({
  label,
  value,
  note,
}: MetricCardProps) {
  return (
    <div className="border border-white/8 bg-white/[0.018] p-5">
      <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/30">
        {note}
      </p>
    </div>
  )
}

interface ChartPanelProps {
  eyebrow: string
  title: string
  description: string
  children:
    React.ReactNode
}

function ChartPanel({
  eyebrow,
  title,
  description,
  children,
}: ChartPanelProps) {
  return (
    <article className="border border-white/8 bg-white/[0.015] p-5 sm:p-7">
      <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-[-0.025em]">
        {title}
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
        {description}
      </p>

      <div className="mt-7">
        {children}
      </div>
    </article>
  )
}

interface MilestoneCardProps {
  milestone: {
    threshold: number
    reached: boolean
    date: string | null
    club: string | null
    opponent:
      | string
      | null
  }
}

function MilestoneCard({
  milestone,
}: MilestoneCardProps) {
  return (
    <article
      className={[
        'border p-5',
        milestone.reached
          ? 'border-[#6CABDD]/20 bg-[#6CABDD]/5'
          : 'border-white/8 bg-white/[0.012]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <p
          className={[
            'text-3xl font-black',
            milestone.reached
              ? 'text-[#6CABDD]'
              : 'text-white/20',
          ].join(' ')}
        >
          {
            milestone.threshold
          }
        </p>

        {milestone.reached && (
          <CheckCircle2
            size={17}
            className="text-emerald-300/70"
          />
        )}
      </div>

      <p className="mt-4 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">
        {milestone.reached
          ? 'Reached'
          : 'Ahead'}
      </p>

      {milestone.reached ? (
        <>
          <p className="mt-2 text-sm font-semibold text-white/65">
            {
              milestone.club
            }{' '}
            vs{' '}
            {
              milestone.opponent
            }
          </p>

          <p className="mt-1 text-xs text-white/30">
            {
              milestone.date
            }
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-white/30">
          Future milestone
        </p>
      )}
    </article>
  )
}

function PageMessage({
  text,
}: {
  text: string
}) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6">
      <p className="text-sm tracking-[0.15em] text-white/40 uppercase">
        {text}
      </p>
    </section>
  )
}