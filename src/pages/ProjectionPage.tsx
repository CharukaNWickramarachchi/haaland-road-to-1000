import {
  Activity,
  CalendarDays,
  Gauge,
  Target,
} from 'lucide-react'

import {
  useMemo,
  useState,
} from 'react'

import { ProjectionScenarioChart } from '../charts/projection/ProjectionScenarioChart'

import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  buildProjectionScenarios,
  getCareerGoalRate,
  getRecentGoalRate,
  runMonteCarloProjection,
} from '../lib/projection/projectionEngine'

export function ProjectionPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  const [
    recentGoalWindow,
    setRecentGoalWindow,
  ] = useState(50)

  const [
    recentWeight,
    setRecentWeight,
  ] = useState(60)

  const [
    rateMultiplier,
    setRateMultiplier,
  ] = useState(100)

  const targetGoals = 1000

  const careerWeight =
    100 - recentWeight

  const scenarios =
    useMemo(() => {
      if (!data) {
        return []
      }

      return buildProjectionScenarios(
        data.goals,
        {
          targetGoals,
          recentGoalWindow,
          careerWeight:
            careerWeight /
            100,
          recentWeight:
            recentWeight /
            100,
          rateMultiplier:
            rateMultiplier /
            100,
        },
      )
    }, [
      data,
      recentGoalWindow,
      careerWeight,
      recentWeight,
      rateMultiplier,
    ])

  const monteCarlo =
    useMemo(() => {
      if (!data) {
        return null
      }

      return runMonteCarloProjection(
        data.goals,
        targetGoals,
        10000,
        recentGoalWindow,
        rateMultiplier /
          100,
      )
    }, [
      data,
      recentGoalWindow,
      rateMultiplier,
    ])

  if (loading) {
    return (
      <Message text="Running projection models…" />
    )
  }

  if (
    error ||
    !data ||
    !monteCarlo
  ) {
    return (
      <Message text="Projection data could not be loaded." />
    )
  }

  const careerRate =
    getCareerGoalRate(
      data.goals,
    )

  const recentRate =
    getRecentGoalRate(
      data.goals,
      recentGoalWindow,
    )

  const currentGoals =
    data.goals.length

  const remainingGoals =
    Math.max(
      targetGoals -
        currentGoals,
      0,
    )

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="border-b border-white/8 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Statistical projection
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
          When could
          <span className="block text-[#6CABDD]">
            1000 happen?
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-7 text-white/45">
          These models extend historical scoring patterns statistically.
          They are scenarios—not guarantees, forecasts of injuries,
          selection, retirement or future competition schedules.
        </p>
      </header>

      <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
        <HeroStat
          icon={<Target size={17} />}
          label="Current goals"
          value={
            currentGoals
          }
        />

        <HeroStat
          icon={<Gauge size={17} />}
          label="Remaining"
          value={
            remainingGoals
          }
        />

        <HeroStat
          icon={<Activity size={17} />}
          label="Career goals / year"
          value={
            careerRate
              ? careerRate.goalsPerYear.toFixed(
                  1,
                )
              : 'N/A'
          }
        />

        <HeroStat
          icon={<Activity size={17} />}
          label="Recent goals / year"
          value={
            recentRate
              ? recentRate.goalsPerYear.toFixed(
                  1,
                )
              : 'N/A'
          }
        />
      </div>

      <div className="mt-12 grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
        <article className="border border-white/8 p-6">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
            What-if controls
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Scenario Inputs
          </h2>

          <div className="mt-8 space-y-8">
            <Control
              label="Recent goal window"
              value={`${recentGoalWindow} goals`}
              minimum="20"
              maximum="100"
              step="5"
              rawValue={
                recentGoalWindow
              }
              onChange={
                setRecentGoalWindow
              }
            />

            <Control
              label="Recent form weight"
              value={`${recentWeight}%`}
              minimum="0"
              maximum="100"
              step="5"
              rawValue={
                recentWeight
              }
              onChange={
                setRecentWeight
              }
            />

            <Control
              label="Rate multiplier"
              value={`${rateMultiplier}%`}
              minimum="60"
              maximum="140"
              step="5"
              rawValue={
                rateMultiplier
              }
              onChange={
                setRateMultiplier
              }
            />
          </div>

          <div className="mt-8 border-t border-white/8 pt-6">
            <p className="text-xs leading-6 text-white/35">
              A 100% multiplier means no manual adjustment. Lower values
              simulate a slower future scoring environment; higher values
              simulate a faster one.
            </p>
          </div>
        </article>

        <article className="border border-white/8 p-6">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
            Rate comparison
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Scenario Pace
          </h2>

          <div className="mt-6">
            <ProjectionScenarioChart
              scenarios={
                scenarios
              }
            />
          </div>
        </article>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {scenarios.map(
          (scenario) => (
            <article
              key={
                scenario.name
              }
              className="border border-white/8 bg-white/[0.015] p-6"
            >
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#6CABDD] uppercase">
                {
                  scenario.name
                }
              </p>

              <p className="mt-5 text-4xl font-black">
                {
                  scenario.projectedDate ??
                  'N/A'
                }
              </p>

              <p className="mt-2 text-sm font-semibold text-white/50">
                {
                  scenario.goalsPerYear.toFixed(
                    1,
                  )
                }{' '}
                goals/year
              </p>

              <p className="mt-5 text-xs leading-6 text-white/30">
                {
                  scenario.description
                }
              </p>

              {scenario.estimatedYears !==
                null && (
                <p className="mt-5 border-t border-white/8 pt-4 text-xs text-white/35">
                  Estimated time:{' '}
                  <strong className="text-white/65">
                    {
                      scenario.estimatedYears.toFixed(
                        1,
                      )
                    }{' '}
                    years
                  </strong>
                </p>
              )}
            </article>
          ),
        )}
      </div>

      <div className="mt-16 border border-[#6CABDD]/20 bg-[#6CABDD]/5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={19}
            className="text-[#6CABDD]"
          />

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
              Monte Carlo
            </p>

            <h2 className="mt-1 text-2xl font-black">
              10,000 simulated paths
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
          <MonteCarloMetric
            label="10th percentile"
            value={
              monteCarlo.percentile10Date
            }
          />

          <MonteCarloMetric
            label="25th percentile"
            value={
              monteCarlo.percentile25Date
            }
          />

          <MonteCarloMetric
            label="Median"
            value={
              monteCarlo.medianDate
            }
            featured
          />

          <MonteCarloMetric
            label="75th percentile"
            value={
              monteCarlo.percentile75Date
            }
          />

          <MonteCarloMetric
            label="90th percentile"
            value={
              monteCarlo.percentile90Date
            }
          />
        </div>

        <p className="mt-7 max-w-4xl text-xs leading-6 text-white/35">
          The simulation repeatedly samples historical inter-goal time
          intervals from the selected recent window. It does not model
          injuries, minutes played, transfers, retirement, fixture
          difficulty or future match volume. The percentile range is
          therefore a statistical scenario envelope rather than a
          confidence interval about Haaland&apos;s actual future career.
        </p>
      </div>
    </section>
  )
}

function Control({
  label,
  value,
  minimum,
  maximum,
  step,
  rawValue,
  onChange,
}: {
  label: string
  value: string
  minimum: string
  maximum: string
  step: string
  rawValue: number
  onChange: (
    value: number,
  ) => void
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-white/55">
          {label}
        </span>

        <span className="text-xs font-black text-[#6CABDD]">
          {value}
        </span>
      </div>

      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={rawValue}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="mt-4 w-full accent-[#6CABDD]"
      />
    </label>
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

function MonteCarloMetric({
  label,
  value,
  featured = false,
}: {
  label: string
  value: string | null
  featured?: boolean
}) {
  return (
    <div
      className={[
        'p-5',
        featured
          ? 'bg-[#6CABDD]/10'
          : 'bg-[#080b0f]',
      ].join(' ')}
    >
      <p className="text-[9px] font-bold tracking-[0.16em] text-white/25 uppercase">
        {label}
      </p>

      <p
        className={[
          'mt-2 text-lg font-black',
          featured
            ? 'text-[#8FC9ED]'
            : 'text-white/70',
        ].join(' ')}
      >
        {value ?? 'N/A'}
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