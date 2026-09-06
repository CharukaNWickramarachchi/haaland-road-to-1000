import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'

import { GoalCard } from '../components/goals/GoalCard'
import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  DEFAULT_GOAL_FILTERS,
  filterGoals,
  getUniqueValues,
  type GoalFilters,
} from '../lib/goals/filterGoals'

const PAGE_SIZE = 20

export function GoalsPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  const [filters, setFilters] =
    useState<GoalFilters>(
      DEFAULT_GOAL_FILTERS,
    )

  const [page, setPage] =
    useState(1)

  const filteredGoals =
    useMemo(() => {
      if (!data) {
        return []
      }

      return filterGoals(
        data.goals,
        filters,
      ).sort(
        (a, b) =>
          b.goalNumber -
          a.goalNumber,
      )
    }, [data, filters])

  const totalPages =
    Math.max(
      Math.ceil(
        filteredGoals.length /
          PAGE_SIZE,
      ),
      1,
    )

  const visibleGoals =
    filteredGoals.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE,
    )

  function updateFilter<
    K extends keyof GoalFilters,
  >(
    key: K,
    value: GoalFilters[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))

    setPage(1)
  }

  function resetFilters() {
    setFilters(
      DEFAULT_GOAL_FILTERS,
    )

    setPage(1)
  }

  if (loading) {
    return (
      <PageMessage text="Loading goal archive…" />
    )
  }

  if (error || !data) {
    return (
      <PageMessage text="Goal archive could not be loaded." />
    )
  }

  const clubs =
    getUniqueValues(
      data.goals,
      (goal) => goal.club,
    )

  const competitions =
    getUniqueValues(
      data.goals,
      (goal) =>
        goal.competition,
    )

  const seasons =
    getUniqueValues(
      data.goals,
      (goal) => goal.season,
    ).reverse()

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Goal by goal
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] uppercase sm:text-7xl">
          Every Goal
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-white/45">
          Explore the canonical goal history behind the Road to 1000.
          Search by opponent, club, competition, season, venue or goal
          number.
        </p>
      </header>

      <div className="mt-12 border border-white/8 bg-white/[0.015] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-white/40 uppercase">
          <SlidersHorizontal size={15} />
          Filters
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative md:col-span-2 xl:col-span-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                updateFilter(
                  'search',
                  event.target.value,
                )
              }
              placeholder="Search goals..."
              className="h-12 w-full border border-white/10 bg-[#080b0f] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#6CABDD]/50"
            />
          </label>

          <FilterSelect
            value={filters.club}
            onChange={(value) =>
              updateFilter(
                'club',
                value,
              )
            }
            options={clubs}
            label="All clubs"
          />

          <FilterSelect
            value={
              filters.competition
            }
            onChange={(value) =>
              updateFilter(
                'competition',
                value,
              )
            }
            options={competitions}
            label="All competitions"
          />

          <FilterSelect
            value={filters.season}
            onChange={(value) =>
              updateFilter(
                'season',
                value,
              )
            }
            options={seasons}
            label="All seasons"
          />

          <FilterSelect
            value={filters.venue}
            onChange={(value) =>
              updateFilter(
                'venue',
                value,
              )
            }
            options={[
              'Home',
              'Away',
              'Neutral',
            ]}
            label="All venues"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-white/50">
            <input
              type="checkbox"
              checked={
                filters.verifiedOnly
              }
              onChange={(event) =>
                updateFilter(
                  'verifiedOnly',
                  event.target.checked,
                )
              }
              className="h-4 w-4 accent-[#6CABDD]"
            />

            Verified only
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold tracking-[0.13em] text-white/35 uppercase transition hover:text-white"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-white/70">
            {filteredGoals.length}{' '}
            {filteredGoals.length ===
            1
              ? 'goal'
              : 'goals'}{' '}
            found
          </p>

          <p className="mt-1 text-xs text-white/30">
            Canonical dataset:{' '}
            {data.goals.length} goals
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/35">
          <Filter size={13} />
          Page {page} of{' '}
          {totalPages}
        </div>
      </div>

      {visibleGoals.length >
      0 ? (
        <div className="mt-6 grid gap-3">
          {visibleGoals.map(
            (goal) => (
              <GoalCard
                key={
                  goal.goalNumber
                }
                goal={goal}
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-6 border border-white/8 py-20 text-center">
          <p className="font-bold text-white/60">
            No goals found.
          </p>

          <p className="mt-2 text-sm text-white/30">
            Try changing or resetting
            the current filters.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-6">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            setPage((current) =>
              Math.max(
                current - 1,
                1,
              ),
            )
          }
          className="inline-flex items-center gap-2 border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        <button
          type="button"
          disabled={
            page >= totalPages
          }
          onClick={() =>
            setPage((current) =>
              Math.min(
                current + 1,
                totalPages,
              ),
            )
          }
          className="inline-flex items-center gap-2 border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  )
}

interface FilterSelectProps {
  value: string
  onChange: (
    value: string,
  ) => void
  options: string[]
  label: string
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="h-12 border border-white/10 bg-[#080b0f] px-4 text-sm text-white/60 outline-none transition focus:border-[#6CABDD]/50"
    >
      <option value="all">
        {label}
      </option>

      {options.map(
        (option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ),
      )}
    </select>
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