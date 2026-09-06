import { ArrowRight, Database, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { HeroSection } from '../components/home/HeroSection'

import { useFootballDataset } from '../hooks/useFootballDataset'
import {
  getCareerGoals,
  getLatestGoal,
  getNextMilestone,
  getProgressStats,
} from '../lib/statistics/careerStats'

export function HomePage() {
  const { data, loading, error } = useFootballDataset()
  const reduceMotion = useReducedMotion()

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <p className="text-sm tracking-[0.18em] text-white/40 uppercase">
          Loading verified dataset…
        </p>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-lg border border-red-400/20 bg-red-500/5 p-6 text-center">
          <p className="font-semibold text-white">
            Goal data could not be loaded.
          </p>

          <p className="mt-2 text-sm text-white/45">
            Check the local dataset and validation status.
          </p>
        </div>
      </section>
    )
  }

  const currentGoals = getCareerGoals(data.goals)
  const progress = getProgressStats(data.goals)
  const latestGoal = getLatestGoal(data.goals)
  const nextMilestone = getNextMilestone(data.goals, data.milestones)

  const hasVerifiedBaseline =
    data.dataVersion.latestGoalNumber !== null && data.goals.length > 0

  
  return (
    <>
      <HeroSection
        currentGoals={currentGoals}
        remainingGoals={progress.remainingGoals}
        progressPercentage={progress.progressPercentage}
        nextMilestone={nextMilestone}
        latestGoal={latestGoal}
        lastVerified={data.dataVersion.lastVerified}
/>
      <section className="relative overflow-hidden border-b border-white/8">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 75% 30%, rgba(108,171,221,0.14), transparent 30%), radial-gradient(circle at 15% 70%, rgba(255,255,255,0.04), transparent 22%)',
          }}
        />

      </section>

      <section className="border-b border-white/8">
        <div className="mx-auto grid max-w-[1440px] gap-px bg-white/8 sm:grid-cols-3">
          <StatusCard
            icon={<ShieldCheck size={18} />}
            label="Data status"
            value={
              hasVerifiedBaseline
                ? `Verified through ${data.dataVersion.lastVerified}`
                : 'Baseline pending'
            }
          />

          <StatusCard
            icon={<Database size={18} />}
            label="Dataset"
            value={`v${data.dataVersion.version}`}
          />

          <StatusCard
            icon={<ArrowRight size={18} />}
            label="Latest goal"
            value={
              latestGoal
                ? `Goal #${latestGoal.goalNumber}`
                : 'Not yet populated'
            }
          />
        </div>
      </section>

      <section className="border-t border-white/[0.07] bg-[#080b0f]">
  <div className="mx-auto max-w-[1680px] px-5 py-16 sm:px-8 lg:px-12 xl:px-16">
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-[10px] font-black tracking-[0.28em] text-[#6CABDD] uppercase">
          Why trust the tracker?
        </p>

        <h2 className="mt-4 max-w-[520px] text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white uppercase sm:text-5xl">
          Built on verified
          <span className="block text-white/30">
            football data.
          </span>
        </h2>

        <p className="mt-6 max-w-[520px] text-sm leading-7 text-white/40">
          Every published career goal is validated, ordered chronologically,
          and used as the single source of truth for totals, milestones and analytics.
        </p>
      </div>

      <div className="grid gap-px bg-white/[0.08] sm:grid-cols-2">
        <div className="bg-[#0a0f14] p-7">
          <p className="text-sm font-black text-white">
            Verified goal-by-goal data
          </p>

          <p className="mt-3 text-sm leading-6 text-white/40">
            Official senior club and Norway goals are stored in one canonical dataset.
          </p>
        </div>

        <div className="bg-[#0a0f14] p-7">
          <p className="text-sm font-black text-white">
            Transparent methodology
          </p>

          <p className="mt-3 text-sm leading-6 text-white/40">
            Inclusion, exclusion and verification rules are documented and visible.
          </p>
        </div>

        <div className="bg-[#0a0f14] p-7">
          <p className="text-sm font-black text-white">
            Automatic career numbering
          </p>

          <p className="mt-3 text-sm leading-6 text-white/40">
            Goal numbers are generated from chronological order, so the latest verified goal is always the highest number.
          </p>
        </div>

        <div className="bg-[#0a0f14] p-7">
          <p className="text-sm font-black text-white">
            Explainable projections
          </p>

          <p className="mt-3 text-sm leading-6 text-white/40">
            Projection models show assumptions and scenarios instead of presenting future totals as certainty.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
    </>
  )
}

interface StatusCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatusCard({ icon, label, value }: StatusCardProps) {
  return (
    <div className="bg-[#080b0f] px-5 py-6 sm:px-8">
      <div className="flex items-center gap-2 text-[#6CABDD]">{icon}</div>

      <p className="mt-5 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white/75">{value}</p>
    </div>
  )
}
