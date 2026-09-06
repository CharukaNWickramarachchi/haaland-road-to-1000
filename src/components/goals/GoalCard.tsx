import {
  ArrowUpRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Goal } from '../../types/football'

interface GoalCardProps {
  goal: Goal
}

function formatMinute(goal: Goal): string {
  if (goal.minute === null) {
    return 'Minute unavailable'
  }

  if (goal.addedTimeMinute !== null) {
    return `${goal.minute}+${goal.addedTimeMinute}'`
  }

  return `${goal.minute}'`
}

export function GoalCard({
  goal,
}: GoalCardProps) {
  return (
    <article className="group border border-white/8 bg-white/[0.018] transition hover:border-[#6CABDD]/35 hover:bg-white/[0.03]">
      <Link
        to={`/goals/${goal.goalNumber}`}
        className="block p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black tracking-[0.18em] text-[#6CABDD] uppercase">
                Goal #{goal.goalNumber}
              </span>

              {goal.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-emerald-300/70 uppercase">
                  <CheckCircle2 size={12} />
                  Verified
                </span>
              )}
            </div>

            <h2 className="mt-4 text-xl font-black tracking-[-0.025em] text-white sm:text-2xl">
              {goal.club}
              <span className="mx-2 text-white/25">
                vs
              </span>
              {goal.opponent}
            </h2>
          </div>

          <ArrowUpRight
            size={18}
            className="shrink-0 text-white/25 transition group-hover:text-[#6CABDD]"
          />
        </div>

        <div className="mt-6 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-4">
          <Meta
            label="Date"
            value={goal.date}
          />

          <Meta
            label="Competition"
            value={goal.competition}
          />

          <Meta
            label="Minute"
            value={formatMinute(goal)}
          />

          <Meta
            label="Venue"
            value={goal.venue}
            icon={<MapPin size={12} />}
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
      <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-white/65">
        {icon}
        {value}
      </div>
    </div>
  )
}