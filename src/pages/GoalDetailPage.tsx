import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import { useFootballDataset } from '../hooks/useFootballDataset'

function formatMinute(
  minute: number | null,
  addedTimeMinute:
    | number
    | null,
): string {
  if (minute === null) {
    return 'Not available'
  }

  if (
    addedTimeMinute !== null
  ) {
    return `${minute}+${addedTimeMinute}'`
  }

  return `${minute}'`
}

export function GoalDetailPage() {
  const { goalNumber } =
    useParams()

  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <Message text="Loading goal…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Goal data could not be loaded." />
    )
  }

  const parsedGoalNumber =
    Number(goalNumber)

  const goal =
    data.goals.find(
      (item) =>
        item.goalNumber ===
        parsedGoalNumber,
    )

  if (!goal) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-[#6CABDD] uppercase">
            Goal not found
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] uppercase">
            No record.
          </h1>

          <Link
            to="/goals"
            className="mt-7 inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to goals
          </Link>
        </div>
      </section>
    )
  }

  const previousGoal =
    data.goals.find(
      (item) =>
        item.goalNumber ===
        goal.goalNumber - 1,
    )

  const nextGoal =
    data.goals.find(
      (item) =>
        item.goalNumber ===
        goal.goalNumber + 1,
    )

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <Link
        to="/goals"
        className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-white/35 uppercase transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Goal archive
      </Link>

      <div className="mt-10 border-b border-white/8 pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-black tracking-[0.28em] text-[#6CABDD] uppercase">
            Career Goal #
            {goal.goalNumber}
          </p>

          {goal.verified && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-emerald-300/70 uppercase">
              <CheckCircle2 size={13} />
              Verified
            </span>
          )}
        </div>

        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.055em] text-white uppercase sm:text-7xl">
          {goal.club}
          <span className="block text-white/25">
            vs {goal.opponent}
          </span>
        </h1>

        <p className="mt-5 text-sm font-semibold tracking-[0.1em] text-white/40 uppercase">
          {goal.date} ·{' '}
          {goal.competition}
        </p>
      </div>

      <div className="mt-10 grid gap-px bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Minute"
          value={formatMinute(
            goal.minute,
            goal.addedTimeMinute,
          )}
        />

        <Stat
          label="Season"
          value={goal.season}
        />

        <Stat
          label="Venue"
          value={goal.venue}
        />

        <Stat
          label="Result"
          value={
            goal.teamResult ??
            'Not available'
          }
        />

        <Stat
          label="Goal type"
          value={
            goal.goalType ??
            'Not available'
          }
        />

        <Stat
          label="Body part"
          value={
            goal.bodyPart ??
            'Not available'
          }
        />

        <Stat
          label="Assist"
          value={
            goal.assist ??
            'Not available'
          }
        />

        <Stat
          label="Score after goal"
          value={
            goal.scoreAfterGoal ??
            'Not available'
          }
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="border border-white/8 p-6 sm:p-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
            Verification
          </p>

          <h2 className="mt-3 text-xl font-black">
            Source record
          </h2>

          <div className="mt-6 space-y-5">
            <Info
              label="Source"
              value={
                goal.sourceName ??
                'Not available'
              }
            />

            <Info
              label="Source ID"
              value={
                goal.sourceId ??
                'Not available'
              }
            />

            <Info
              label="Match ID"
              value={
                goal.matchId ??
                'Not available'
              }
            />

            {goal.verificationNotes && (
              <Info
                label="Notes"
                value={
                  goal.verificationNotes
                }
              />
            )}
          </div>

          {goal.sourceUrl && (
            <a
              href={goal.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-[#6CABDD] uppercase"
            >
              Open source
              <ExternalLink size={14} />
            </a>
          )}
        </article>

        <article className="border border-white/8 p-6 sm:p-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
            Record metadata
          </p>

          <div className="mt-6 space-y-5">
            <Info
              label="Competition type"
              value={
                goal.competitionType
              }
            />

            <Info
              label="Penalty"
              value={
                goal.penalty
                  ? 'Yes'
                  : 'No'
              }
            />

            <Info
              label="Free kick"
              value={
                goal.freeKick
                  ? 'Yes'
                  : 'No'
              }
            />

            <Info
              label="Verified"
              value={
                goal.verified
                  ? 'Yes'
                  : 'No'
              }
            />
          </div>
        </article>
      </div>

      <div className="mt-12 grid gap-3 border-t border-white/8 pt-8 sm:grid-cols-2">
        {previousGoal ? (
          <Link
            to={`/goals/${previousGoal.goalNumber}`}
            className="group border border-white/8 p-5 transition hover:border-[#6CABDD]/30"
          >
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">
              <ArrowLeft size={13} />
              Previous
            </p>

            <p className="mt-3 font-bold text-white/70 group-hover:text-white">
              Goal #
              {
                previousGoal.goalNumber
              }{' '}
              vs{' '}
              {
                previousGoal.opponent
              }
            </p>
          </Link>
        ) : (
          <div />
        )}

        {nextGoal && (
          <Link
            to={`/goals/${nextGoal.goalNumber}`}
            className="group border border-white/8 p-5 text-right transition hover:border-[#6CABDD]/30"
          >
            <p className="flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">
              Next
              <ArrowRight size={13} />
            </p>

            <p className="mt-3 font-bold text-white/70 group-hover:text-white">
              Goal #
              {nextGoal.goalNumber}{' '}
              vs {nextGoal.opponent}
            </p>
          </Link>
        )}
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="bg-[#080b0f] p-5">
      <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 font-bold text-white/75">
        {value}
      </p>
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
      <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm leading-6 text-white/60">
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