import {
  Flame,
  Trophy,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useFootballDataset } from '../hooks/useFootballDataset'

import {
  getFiveGoalMatches,
  getFourGoalMatches,
  getHatTricks,
  getMultiGoalMatches,
  getOpponentStats,
} from '../lib/analytics/advancedStats'

import {
  getGoalsByClub,
  getGoalsByCompetition,
  getGoalsBySeason,
} from '../lib/statistics'

export function RecordsPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <Message text="Loading records…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Records could not be loaded." />
    )
  }

  const hatTricks =
    getHatTricks(
      data.goals,
    )

  const fourGoalMatches =
    getFourGoalMatches(
      data.goals,
    )

  const fiveGoalMatches =
    getFiveGoalMatches(
      data.goals,
    )

  const multiGoalMatches =
    getMultiGoalMatches(
      data.goals,
    )

  const topOpponent =
    getOpponentStats(
      data.goals,
    )[0]

  const topSeason =
    [...getGoalsBySeason(
      data.goals,
    )].sort(
      (a, b) =>
        b.goals - a.goals,
    )[0]

  const topCompetition =
    getGoalsByCompetition(
      data.goals,
    )[0]

  const topClub =
    getGoalsByClub(
      data.goals,
    )[0]

  return (
    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="border-b border-white/8 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Records
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
          The big
          <span className="block text-white/25">
            numbers.
          </span>
        </h1>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RecordCard
          label="Hat-trick matches"
          value={hatTricks.length}
        />

        <RecordCard
          label="4+ goal matches"
          value={
            fourGoalMatches.length
          }
        />

        <RecordCard
          label="5+ goal matches"
          value={
            fiveGoalMatches.length
          }
        />

        <RecordCard
          label="Multi-goal matches"
          value={
            multiGoalMatches.length
          }
        />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Highlight
          title="Most goals vs one opponent"
          primary={
            topOpponent
              ?.opponent ??
            'N/A'
          }
          value={
            topOpponent?.goals ??
            0
          }
        />

        <Highlight
          title="Highest scoring season"
          primary={
            topSeason?.key ??
            'N/A'
          }
          value={
            topSeason?.goals ??
            0
          }
        />

        <Highlight
          title="Most productive competition"
          primary={
            topCompetition
              ?.key ?? 'N/A'
          }
          value={
            topCompetition
              ?.goals ?? 0
          }
        />

        <Highlight
          title="Most goals for one team"
          primary={
            topClub?.key ??
            'N/A'
          }
          value={
            topClub?.goals ??
            0
          }
        />
      </div>

      <div className="mt-20">
        <div className="flex items-center gap-3">
          <Flame className="text-[#6CABDD]" />

          <h2 className="text-3xl font-black uppercase">
            Hat-trick matches
          </h2>
        </div>

        <div className="mt-7 border-t border-white/8">
          {hatTricks.map(
            (match) => (
              <article
                key={
                  match.matchId
                }
                className="grid gap-4 border-b border-white/8 py-6 md:grid-cols-[100px_1fr_100px_auto] md:items-center"
              >
                <p className="text-sm text-white/35">
                  {match.date}
                </p>

                <div>
                  <p className="font-black">
                    {match.club}{' '}
                    vs{' '}
                    {
                      match.opponent
                    }
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {
                      match.competition
                    }
                  </p>
                </div>

                <p className="text-3xl font-black text-[#6CABDD]">
                  {match.goals}
                </p>

                <div className="flex flex-wrap gap-2">
                  {match.goalNumbers.map(
                    (
                      goalNumber,
                    ) => (
                      <Link
                        key={
                          goalNumber
                        }
                        to={`/goals/${goalNumber}`}
                        className="border border-white/10 px-2 py-1 text-[10px] font-bold text-white/50 hover:border-[#6CABDD]/40 hover:text-[#6CABDD]"
                      >
                        #
                        {
                          goalNumber
                        }
                      </Link>
                    ),
                  )}
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

function RecordCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <article className="border border-white/8 p-6">
      <Trophy
        size={17}
        className="text-[#6CABDD]"
      />

      <p className="mt-5 text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black">
        {value}
      </p>
    </article>
  )
}

function Highlight({
  title,
  primary,
  value,
}: {
  title: string
  primary: string
  value: number
}) {
  return (
    <article className="border border-white/8 p-6">
      <p className="text-[10px] font-bold tracking-[0.18em] text-white/30 uppercase">
        {title}
      </p>

      <div className="mt-5 flex items-end justify-between gap-5">
        <h2 className="text-xl font-black">
          {primary}
        </h2>

        <p className="text-4xl font-black text-[#6CABDD]">
          {value}
        </p>
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