import { useMemo } from 'react'

import { SeasonCard } from '../components/seasons/SeasonCard'
import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  getSeasonSummaries,
} from '../lib/seasons/seasonStats'

export function SeasonsPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  const seasons =
    useMemo(
      () =>
        data
          ? getSeasonSummaries(
              data.goals,
            )
          : [],
      [data],
    )

  if (loading) {
    return (
      <Message text="Loading seasons…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Season data could not be loaded." />
    )
  }

  const highestScoringSeason =
    [...seasons].sort(
      (a, b) =>
        b.goals - a.goals,
    )[0]

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="grid gap-10 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
            Season history
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
            Season
            <span className="block text-white/25">
              by season.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/45">
            Compare scoring output across every recorded season in the
            canonical dataset.
          </p>
        </div>

        {highestScoringSeason && (
          <div className="lg:text-right">
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
              Highest scoring season
            </p>

            <p className="mt-3 text-4xl font-black">
              {
                highestScoringSeason.season
              }
            </p>

            <p className="mt-1 text-lg font-bold text-[#6CABDD]">
              {
                highestScoringSeason.goals
              }{' '}
              goals
            </p>
          </div>
        )}
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {seasons.map(
          (season) => (
            <SeasonCard
              key={
                season.season
              }
              season={season}
            />
          ),
        )}
      </div>
    </section>
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