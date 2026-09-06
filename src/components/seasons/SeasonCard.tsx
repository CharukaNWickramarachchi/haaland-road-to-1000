import {
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  seasonToSlug,
  type SeasonSummary,
} from '../../lib/seasons/seasonStats'

interface SeasonCardProps {
  season: SeasonSummary
}

export function SeasonCard({
  season,
}: SeasonCardProps) {
  return (
    <article className="group border border-white/8 bg-white/[0.018] transition hover:border-[#6CABDD]/35 hover:bg-white/[0.03]">
      <Link
        to={`/seasons/${seasonToSlug(
          season.season,
        )}`}
        className="block p-6"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#6CABDD] uppercase">
              Season
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              {season.season}
            </h2>
          </div>

          <ArrowUpRight
            size={18}
            className="text-white/25 transition group-hover:text-[#6CABDD]"
          />
        </div>

        <p className="mt-8 text-6xl font-black tracking-[-0.06em] text-white">
          {season.goals}
        </p>

        <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          Verified goals
        </p>

        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/8 pt-5">
          <Meta
            label="Teams"
            value={String(
              season.clubs.length,
            )}
          />

          <Meta
            label="Competitions"
            value={String(
              season.competitions,
            )}
          />

          <Meta
            label="Opponents"
            value={String(
              season.opponents,
            )}
          />

          <Meta
            label="Goal span"
            value={
              season.firstGoalDate &&
              season.lastGoalDate
                ? `${season.firstGoalDate} → ${season.lastGoalDate}`
                : 'Not available'
            }
            icon={
              <CalendarDays size={12} />
            }
          />
        </div>
      </Link>
    </article>
  )
}

interface MetaProps {
  label: string
  value: string
  icon?: React.ReactNode
}

function Meta({
  label,
  value,
  icon,
}: MetaProps) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.17em] text-white/25 uppercase">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/55">
        {icon}
        {value}
      </div>
    </div>
  )
}