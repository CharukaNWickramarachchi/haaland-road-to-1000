import { useMemo } from 'react'

import { ClubCard } from '../components/clubs/ClubCard'
import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  getClubSummaries,
} from '../lib/clubs/clubStats'

export function ClubsPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  const clubs =
    useMemo(
      () =>
        data
          ? getClubSummaries(
              data.goals,
            )
          : [],
      [data],
    )

  if (loading) {
    return (
      <Message text="Loading teams…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Team data could not be loaded." />
    )
  }

  const topTeam =
    clubs[0]

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="grid gap-10 border-b border-white/8 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
            Career teams
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
            Every
            <span className="block text-white/25">
              shirt.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/45">
            Explore every senior team represented in the canonical goal
            history, including Haaland's Norway international career.
          </p>
        </div>

        {topTeam && (
          <div className="lg:text-right">
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
              Most goals
            </p>

            <p className="mt-3 text-2xl font-black">
              {topTeam.club}
            </p>

            <p className="mt-2 text-4xl font-black text-[#6CABDD]">
              {topTeam.goals}
            </p>
          </div>
        )}
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map(
          (club) => (
            <ClubCard
              key={club.club}
              club={club}
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