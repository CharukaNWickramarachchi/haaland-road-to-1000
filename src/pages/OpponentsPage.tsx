import {
  Search,
  Target,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'

import { useFootballDataset } from '../hooks/useFootballDataset'
import { getOpponentStats } from '../lib/analytics/advancedStats'

export function OpponentsPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  const [search, setSearch] =
    useState('')

  const opponents =
    useMemo(() => {
      if (!data) {
        return []
      }

      const query =
        search
          .trim()
          .toLowerCase()

      return getOpponentStats(
        data.goals,
      ).filter(
        (item) =>
          !query ||
          item.opponent
            .toLowerCase()
            .includes(query),
      )
    }, [data, search])

  if (loading) {
    return (
      <Message text="Loading opponents…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Opponent data could not be loaded." />
    )
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="border-b border-white/8 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Opponent analysis
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
          Against
          <span className="block text-white/25">
            everyone.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-white/45">
          Ranking every opponent in the canonical dataset by goals scored.
        </p>
      </header>

      <label className="relative mt-8 block max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search opponent..."
          className="h-12 w-full border border-white/10 bg-[#080b0f] pl-11 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-[#6CABDD]/50"
        />
      </label>

      <div className="mt-8 border-t border-white/8">
        {opponents.map(
          (opponent, index) => (
            <article
              key={
                opponent.opponent
              }
              className="grid gap-5 border-b border-white/8 py-6 md:grid-cols-[60px_1fr_120px_140px] md:items-center"
            >
              <p className="text-xl font-black text-white/15">
                {String(
                  index + 1,
                ).padStart(
                  2,
                  '0',
                )}
              </p>

              <div>
                <h2 className="text-lg font-black">
                  {
                    opponent.opponent
                  }
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  {
                    opponent.clubs.join(
                      ' · ',
                    )
                  }
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] text-white/25 uppercase">
                  Goals
                </p>

                <p className="mt-1 text-3xl font-black text-[#6CABDD]">
                  {opponent.goals}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] text-white/25 uppercase">
                  Scoring matches
                </p>

                <p className="mt-1 flex items-center gap-2 text-lg font-black">
                  <Target
                    size={14}
                    className="text-[#6CABDD]"
                  />
                  {
                    opponent.matchesScoredIn
                  }
                </p>
              </div>
            </article>
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