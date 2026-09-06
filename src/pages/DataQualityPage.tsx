import {
  CheckCircle2,
  Database,
  TriangleAlert,
} from 'lucide-react'

import { useFootballDataset } from '../hooks/useFootballDataset'

import { getDataCoverage } from '../lib/analytics/advancedStats'

export function DataQualityPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <Message text="Inspecting dataset…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Data quality information could not be loaded." />
    )
  }

  const coverage =
    getDataCoverage(
      data.goals,
    )

  const verifiedGoals =
    data.goals.filter(
      (goal) =>
        goal.verified,
    ).length

  const unverifiedGoals =
    data.goals.length -
    verifiedGoals

  const missingSource =
    data.goals.filter(
      (goal) =>
        !goal.sourceId,
    ).length

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="border-b border-white/8 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Internal data quality
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
          Dataset
          <span className="block text-white/25">
            health.
          </span>
        </h1>

        <p className="mt-5 text-sm text-white/35">
          This route is intended for dataset inspection rather than
          primary navigation.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={<Database size={17} />}
          label="Canonical goals"
          value={
            data.goals.length
          }
          good
        />

        <StatusCard
          icon={<CheckCircle2 size={17} />}
          label="Verified goals"
          value={verifiedGoals}
          good={
            verifiedGoals ===
            data.goals.length
          }
        />

        <StatusCard
          icon={<TriangleAlert size={17} />}
          label="Unverified"
          value={unverifiedGoals}
          good={
            unverifiedGoals === 0
          }
        />

        <StatusCard
          icon={<TriangleAlert size={17} />}
          label="Missing source ID"
          value={missingSource}
          good={
            missingSource === 0
          }
        />
      </div>

      <div className="mt-12 border border-white/8 p-6">
        <h2 className="text-2xl font-black">
          Attribute coverage
        </h2>

        <div className="mt-7 space-y-6">
          <Coverage
            label="Minute"
            count={
              coverage.minuteKnown
            }
            percentage={
              coverage.minuteCoveragePercentage
            }
          />

          <Coverage
            label="Body part"
            count={
              coverage.bodyPartKnown
            }
            percentage={
              coverage.bodyPartCoveragePercentage
            }
          />

          <Coverage
            label="Goal type"
            count={
              coverage.goalTypeKnown
            }
            percentage={
              coverage.goalTypeCoveragePercentage
            }
          />

          <Coverage
            label="Assist"
            count={
              coverage.assistKnown
            }
            percentage={
              coverage.assistCoveragePercentage
            }
          />
        </div>
      </div>

      <div className="mt-12 border border-white/8 p-6">
        <h2 className="text-2xl font-black">
          Version state
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Info
            label="Version"
            value={
              data.dataVersion.version
            }
          />

          <Info
            label="Dataset mode"
            value={
              data.dataVersion.datasetMode
            }
          />

          <Info
            label="Last updated"
            value={
              data.dataVersion.lastUpdated
            }
          />

          <Info
            label="Last verified"
            value={
              data.dataVersion.lastVerified
            }
          />

          <Info
            label="Latest goal number"
            value={String(
              data.dataVersion.latestGoalNumber ??
                'N/A',
            )}
          />

          <Info
            label="Methodology"
            value={
              data.dataVersion.methodologyVersion
            }
          />
        </div>
      </div>
    </section>
  )
}

function StatusCard({
  icon,
  label,
  value,
  good,
}: {
  icon: React.ReactNode
  label: string
  value: number
  good: boolean
}) {
  return (
    <article className="border border-white/8 p-5">
      <div
        className={
          good
            ? 'text-emerald-300/70'
            : 'text-amber-300/70'
        }
      >
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-bold tracking-[0.17em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>
    </article>
  )
}

function Coverage({
  label,
  count,
  percentage,
}: {
  label: string
  count: number
  percentage: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-5">
        <p className="text-sm font-semibold text-white/55">
          {label}
        </p>

        <p className="text-xs font-bold text-[#6CABDD]">
          {count} /{' '}
          {percentage.toFixed(
            1,
          )}
          %
        </p>
      </div>

      <div className="mt-2 h-1.5 bg-white/8">
        <div
          className="h-full bg-[#6CABDD]"
          style={{
            width: `${Math.min(
              percentage,
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.16em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-1.5 font-semibold text-white/60">
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