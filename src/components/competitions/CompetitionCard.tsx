import {
  ArrowUpRight,
  Trophy,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import {
  competitionToSlug,
  type CompetitionSummary,
} from '../../lib/competitions/competitionStats'

interface CompetitionCardProps {
  competition: CompetitionSummary
}

export function CompetitionCard({
  competition,
}: CompetitionCardProps) {
  return (
    <article className="group border border-white/8 bg-white/[0.018] transition hover:border-[#6CABDD]/35 hover:bg-white/[0.03]">
      <Link
        to={`/competitions/${competitionToSlug(
          competition.competition,
        )}`}
        className="block p-6"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[#6CABDD]">
              <Trophy size={16} />

              <p className="text-[10px] font-bold tracking-[0.18em] uppercase">
                {
                  competition.competitionType
                }
              </p>
            </div>

            <h2 className="mt-4 text-xl font-black tracking-[-0.025em] sm:text-2xl">
              {
                competition.competition
              }
            </h2>
          </div>

          <ArrowUpRight
            size={18}
            className="shrink-0 text-white/25 transition group-hover:text-[#6CABDD]"
          />
        </div>

        <p className="mt-8 text-6xl font-black tracking-[-0.06em]">
          {competition.goals}
        </p>

        <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          Career goals
        </p>

        <div className="mt-7 grid grid-cols-3 gap-4 border-t border-white/8 pt-5">
          <Meta
            label="Seasons"
            value={competition.seasons}
          />

          <Meta
            label="Teams"
            value={
              competition.clubs.length
            }
          />

          <Meta
            label="Opponents"
            value={
              competition.opponents
            }
          />
        </div>
      </Link>
    </article>
  )
}

function Meta({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.16em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-black text-white/65">
        {value}
      </p>
    </div>
  )
}