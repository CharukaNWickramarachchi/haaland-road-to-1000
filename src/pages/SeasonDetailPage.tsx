import {
  ArrowLeft,
  MapPin,
  Target,
  Trophy,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import { GoalCard } from '../components/goals/GoalCard'
import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  getSeasonAnalytics,
  slugToSeason,
} from '../lib/seasons/seasonStats'

export function SeasonDetailPage() {
  const { seasonSlug } =
    useParams()

  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <Message text="Loading season…" />
    )
  }

  if (
    error ||
    !data ||
    !seasonSlug
  ) {
    return (
      <Message text="Season data could not be loaded." />
    )
  }

  const season =
    slugToSeason(
      seasonSlug,
    )

  const analytics =
    getSeasonAnalytics(
      data.goals,
      season,
    )

  if (
    analytics.totalGoals === 0
  ) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
            Season not found
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] uppercase">
            No records.
          </h1>

          <Link
            to="/seasons"
            className="mt-7 inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-xs font-bold tracking-[0.15em] text-white/60 uppercase"
          >
            <ArrowLeft size={14} />
            Back to seasons
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <Link
        to="/seasons"
        className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-white/35 uppercase transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Seasons
      </Link>

      <header className="mt-10 grid gap-10 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
            Season analysis
          </p>

          <h1 className="mt-4 text-6xl font-black tracking-[-0.06em] uppercase sm:text-8xl">
            {season}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/45">
            Complete scoring breakdown for this season from the canonical
            career dataset.
          </p>
        </div>

        <div className="lg:text-right">
          <p className="text-[90px] leading-none font-black tracking-[-0.07em] text-[#6CABDD]">
            {
              analytics.totalGoals
            }
          </p>

          <p className="mt-2 text-xs font-bold tracking-[0.2em] text-white/30 uppercase">
            Goals
          </p>
        </div>
      </header>

      <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
        <HeroStat
          icon={<Trophy size={17} />}
          label="Competitions"
          value={
            analytics
              .competitionBreakdown
              .length
          }
        />

        <HeroStat
          icon={<Target size={17} />}
          label="Opponents"
          value={
            analytics.opponents
          }
        />

        <HeroStat
          icon={<MapPin size={17} />}
          label="Home goals"
          value={
            analytics.homeGoals
          }
        />

        <HeroStat
          icon={<MapPin size={17} />}
          label="Away goals"
          value={
            analytics.awayGoals
          }
        />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <BreakdownPanel
          eyebrow="Teams"
          title="Team Breakdown"
          rows={
            analytics.clubBreakdown
          }
        />

        <BreakdownPanel
          eyebrow="Competitions"
          title="Competition Breakdown"
          rows={
            analytics
              .competitionBreakdown
          }
        />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Penalty goals"
          value={
            analytics.penaltyGoals
          }
        />

        <Metric
          label="Non-penalty goals"
          value={
            analytics.totalGoals -
            analytics.penaltyGoals
          }
        />

        <Metric
          label="Distinct teams"
          value={
            analytics
              .clubBreakdown
              .length
          }
        />
      </div>

      <div className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
              Goal archive
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] uppercase">
              Every goal
            </h2>
          </div>

          <p className="text-sm text-white/35">
            {
              analytics.goals.length
            }{' '}
            records
          </p>
        </div>

        <div className="mt-7 grid gap-3">
          {[...analytics.goals]
            .sort(
              (a, b) =>
                b.goalNumber -
                a.goalNumber,
            )
            .map((goal) => (
              <GoalCard
                key={
                  goal.goalNumber
                }
                goal={goal}
              />
            ))}
        </div>
      </div>
    </section>
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

interface BreakdownPanelProps {
  eyebrow: string
  title: string
  rows: {
    key: string
    goals: number
  }[]
}

function BreakdownPanel({
  eyebrow,
  title,
  rows,
}: BreakdownPanelProps) {
  return (
    <article className="border border-white/8 p-6">
      <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black">
        {title}
      </h2>

      <div className="mt-6 border-t border-white/8">
        {rows.map(
          (row, index) => (
            <div
              key={row.key}
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

              <p className="text-sm font-semibold text-white/60">
                {row.key}
              </p>

              <p className="text-xl font-black text-[#6CABDD]">
                {row.goals}
              </p>
            </div>
          ),
        )}
      </div>
    </article>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border border-white/8 bg-white/[0.015] p-5">
      <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </div>
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