import {
  Clock3,
  Database,
  MapPin,
  Target,
} from 'lucide-react'

import { GoalMinuteChart } from '../charts/analytics/GoalMinuteChart'
import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  getAverageGoalMinute,
  getDataCoverage,
  getGoalMinuteBuckets,
  getMedianGoalMinute,
  getMultiGoalMatches,
  getOpponentStats,
} from '../lib/analytics/advancedStats'

import {
  getAwayGoals,
  getHomeGoals,
  getPenaltyGoals,
} from '../lib/statistics'

export function AnalyticsPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <Message text="Loading analytics…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Analytics could not be loaded." />
    )
  }

  const minuteBuckets =
    getGoalMinuteBuckets(
      data.goals,
    )

  const averageMinute =
    getAverageGoalMinute(
      data.goals,
    )

  const medianMinute =
    getMedianGoalMinute(
      data.goals,
    )

  const coverage =
    getDataCoverage(
      data.goals,
    )

  const opponents =
    getOpponentStats(
      data.goals,
    )

  const multiGoalMatches =
    getMultiGoalMatches(
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

  const penalties =
    getPenaltyGoals(
      data.goals,
    )

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="border-b border-white/8 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Advanced analytics
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
          Inside the
          <span className="block text-white/25">
            goals.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-white/45">
          Goal-level analytics derived directly from the verified
          canonical dataset. Metrics requiring complete appearance or
          minutes-played data are intentionally excluded for now.
        </p>
      </header>

      <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
        <HeroStat
          icon={<Clock3 size={17} />}
          label="Average goal minute"
          value={
            averageMinute === null
              ? 'N/A'
              : averageMinute.toFixed(
                  1,
                )
          }
        />

        <HeroStat
          icon={<Target size={17} />}
          label="Median goal minute"
          value={
            medianMinute === null
              ? 'N/A'
              : medianMinute.toFixed(
                  1,
                )
          }
        />

        <HeroStat
          icon={<MapPin size={17} />}
          label="Home / Away"
          value={`${homeGoals} / ${awayGoals}`}
        />

        <HeroStat
          icon={<Database size={17} />}
          label="Multi-goal matches"
          value={
            multiGoalMatches.length
          }
        />
      </div>

      <div className="mt-12 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <article className="border border-white/8 p-6">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
            Goal timing
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Scoring Minutes
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/35">
            Distribution across standard football minute buckets. Unknown
            minutes remain visible rather than being estimated.
          </p>

          <div className="mt-7">
            <GoalMinuteChart
              data={minuteBuckets}
            />
          </div>
        </article>

        <article className="border border-white/8 p-6">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
            Data coverage
          </p>

          <h2 className="mt-2 text-2xl font-black">
            What we actually know
          </h2>

          <div className="mt-7 space-y-6">
            <Coverage
              label="Goal minute"
              value={
                coverage.minuteCoveragePercentage
              }
            />

            <Coverage
              label="Body part"
              value={
                coverage.bodyPartCoveragePercentage
              }
            />

            <Coverage
              label="Goal type"
              value={
                coverage.goalTypeCoveragePercentage
              }
            />

            <Coverage
              label="Assist"
              value={
                coverage.assistCoveragePercentage
              }
            />
          </div>
        </article>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Ranking
          title="Most Scored Against"
          rows={opponents
            .slice(0, 10)
            .map(
              (item) => ({
                label:
                  item.opponent,
                value:
                  item.goals,
              }),
            )}
        />

        <Ranking
          title="Scoring Profile"
          rows={[
            {
              label:
                'Penalty goals',
              value: penalties,
            },
            {
              label:
                'Non-penalty goals',
              value:
                data.goals.length -
                penalties,
            },
            {
              label:
                'Home goals',
              value: homeGoals,
            },
            {
              label:
                'Away goals',
              value: awayGoals,
            },
            {
              label:
                'Neutral venue goals',
              value:
                data.goals.length -
                homeGoals -
                awayGoals,
            },
          ]}
        />
      </div>
    </section>
  )
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value:
    | string
    | number
}) {
  return (
    <div className="bg-[#080b0f] p-6">
      <div className="text-[#6CABDD]">
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </div>
  )
}

function Coverage({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white/55">
          {label}
        </p>

        <p className="text-xs font-bold text-[#6CABDD]">
          {value.toFixed(1)}%
        </p>
      </div>

      <div className="mt-2 h-1.5 bg-white/8">
        <div
          className="h-full bg-[#6CABDD]"
          style={{
            width: `${Math.min(
              value,
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  )
}

function Ranking({
  title,
  rows,
}: {
  title: string
  rows: {
    label: string
    value: number
  }[]
}) {
  return (
    <article className="border border-white/8 p-6">
      <h2 className="text-2xl font-black">
        {title}
      </h2>

      <div className="mt-6 border-t border-white/8">
        {rows.map(
          (row, index) => (
            <div
              key={row.label}
              className="grid grid-cols-[35px_1fr_auto] items-center gap-4 border-b border-white/8 py-4"
            >
              <span className="text-xs font-black text-white/20">
                {String(
                  index + 1,
                ).padStart(
                  2,
                  '0',
                )}
              </span>

              <span className="text-sm font-semibold text-white/60">
                {row.label}
              </span>

              <span className="text-xl font-black text-[#6CABDD]">
                {row.value}
              </span>
            </div>
          ),
        )}
      </div>
    </article>
  )
}

function Message({
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