import {
  motion,
  useReducedMotion,
} from 'framer-motion'

import {
  ArrowUpRight,
  CheckCircle2,
  Target,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import type {
  Goal,
} from '../../types/football'

import {
  AnimatedCounter,
} from './AnimatedCounter'

interface HeroSectionProps {
  currentGoals: number
  remainingGoals: number
  progressPercentage: number

  nextMilestone: {
    threshold: number
    goalsRemaining: number
  } | null

  latestGoal: Goal | null
  lastVerified: string
}

function formatDate(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    'en',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    },
  )
    .format(
      new Date(
        `${date}T00:00:00Z`,
      ),
    )
    .toUpperCase()
}

function formatMinute(
  minute: number | null,
  addedTimeMinute:
    | number
    | null,
): string {
  if (minute === null) {
    return '—'
  }

  if (
    addedTimeMinute !== null &&
    addedTimeMinute > 0
  ) {
    return `${minute}+${addedTimeMinute}'`
  }

  return `${minute}'`
}

export function HeroSection({
  currentGoals,
  remainingGoals,
  progressPercentage,
  nextMilestone,
  latestGoal,
  lastVerified,
}: HeroSectionProps) {
  const reduceMotion =
    useReducedMotion()

  const safeProgress =
    Math.min(
      Math.max(
        progressPercentage,
        0,
      ),
      100,
    )

  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.07] bg-[#070b0f]">
      {/* subtle background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-[#6CABDD]/[0.09] blur-[150px]" />

        <div className="absolute right-[5%] top-[10%] h-[420px] w-[420px] rounded-full bg-[#6CABDD]/[0.05] blur-[140px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16">

        {/* MAIN HERO */}
        <div className="relative grid min-h-[480px] items-center gap-10 border-b border-white/[0.08] py-1 lg:grid-cols-[1.18fr_0.82fr] lg:py-2">

          {/* LEFT */}
          <div className="relative z-20">
            <motion.p
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 12,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="text-[25px] font-black tracking-[0.34em] text-[#6CABDD] uppercase"
            >
              Erling Haaland
            </motion.p>

            {/* ROAD TO 1000 */}
            <motion.h1
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 18,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                delay: 0.05,
              }}
              className="mt-6 text-[clamp(3.1rem,7vw,5.4rem)] font-black leading-[0.88] tracking-[-0.065em] text-white uppercase"
            >
              Road to{' '}
              <span className="text-[#6CABDD]">
                1000
              </span>
            </motion.h1>

            <motion.p
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 14,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.12,
              }}
              className="mt-8 text-[10px] font-bold tracking-[0.24em] text-white/30 uppercase sm:text-xs"
            >
              Official senior career goals
            </motion.p>

            {/* BIG NUMBER */}
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 24,
                      scale: 0.98,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.85,
                delay: 0.12,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              className="-ml-[0.025em] mt-3"
            >
              <AnimatedCounter
                value={
                  currentGoals
                }
                duration={1.25}
                className="block text-[clamp(6.5rem,17vw,5rem)] font-black leading-[0.78] tracking-[-0.085em] text-white"
              />
            </motion.div>

            {/* SUBLINE */}
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 15,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.22,
              }}
              className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              <span className="text-sm font-black tracking-[0.08em] text-white uppercase">
                Career Goals
              </span>

              <span className="hidden h-4 w-px bg-white/15 sm:block" />

              <span className="text-[11px] font-bold tracking-[0.14em] text-white/35 uppercase">
                Follow every goal · Track the road
              </span>
            </motion.div>

            {/* BUTTONS */}
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 15,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.28,
              }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/goals"
                className="group inline-flex items-center gap-3 bg-[#6CABDD] px-5 py-3.5 text-[11px] font-black tracking-[0.16em] text-[#071019] uppercase transition hover:bg-[#8CCCF2]"
              >
                Explore all goals

                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                to="/projection"
                className="inline-flex items-center border border-white/12 bg-white/[0.02] px-5 py-3.5 text-[11px] font-black tracking-[0.16em] text-white/75 uppercase transition hover:border-[#6CABDD]/40 hover:text-white"
              >
                View projection
              </Link>
            </motion.div>
          </div>

          {/* RIGHT / HAALAND */}
          <div className="relative flex h-full items-end justify-center lg:justify-end">
            <div className="absolute bottom-[8%] right-[10%] h-[260px] w-[260px] rounded-full bg-[#6CABDD]/10 blur-[90px]" />

            <motion.img
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: 34,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.85,
                delay: 0.15,
              }}
              src={`${import.meta.env.BASE_URL}images/haaland-hero.png`}
              alt=""
              aria-hidden="true"
              className="relative z-10 h-[300px] w-auto object-contain object-bottom drop-shadow-[0_30px_45px_rgba(0,0,0,0.55)] sm:h-[330px] md:h-[320px] lg:h-[310px] xl:h-[450px]"
            />

            {/* VERIFIED */}
            <div className="absolute right-0 top-0 z-20 flex items-center gap-2">
              <CheckCircle2
                size={13}
                className="text-[#6CABDD]"
              />

              <span className="text-[9px] font-bold tracking-[0.14em] text-white/30 uppercase">
                Verified through{' '}
                {
                  lastVerified
                }
              </span>
            </div>
          </div>
        </div>

        {/* ROAD TRACKER */}
        <div className="grid gap-8 border-b border-white/[0.08] py-7 lg:grid-cols-[1fr_300px] lg:items-center">

          {/* LEFT TRACKER */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] text-white/30 uppercase">
                  Road Tracker
                </p>

                <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                  {
                    progressPercentage.toFixed(
                      1,
                    )
                  }
                  %
                  <span className="ml-3 text-sm font-semibold tracking-normal text-white/30">
                    complete
                  </span>
                </p>
              </div>

              <div className="flex gap-8 sm:gap-12">
                <div>
                  <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
                    Current
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {
                      currentGoals
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold tracking-[0.18em] text-white/25 uppercase">
                    Remaining
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {
                      remainingGoals
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* TRACK LINE */}
            <div className="relative mt-7 pb-6">
              <div className="relative h-[7px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={
                    reduceMotion
                      ? false
                      : {
                          width: 0,
                        }
                  }
                  animate={{
                    width: `${safeProgress}%`,
                  }}
                  transition={{
                    duration: 1.25,
                    delay: 0.35,
                    ease: 'easeOut',
                  }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,#6CABDD,#8CCCF2)]"
                />
              </div>

              {/* current marker */}
              <motion.div
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                      }
                }
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.9,
                }}
                style={{
                  left: `${safeProgress}%`,
                }}
                className="absolute top-[3.5px] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#070b0f] bg-white shadow-[0_0_0_4px_rgba(108,171,221,0.3),0_0_20px_rgba(108,171,221,0.45)]"
              />

              {/* milestones */}
              <div className="mt-4 flex justify-between text-[9px] font-bold tracking-[0.1em] text-white/25">
                <span>0</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>400</span>
                <span>500</span>
                <span>600</span>
                <span>700</span>
                <span>800</span>
                <span>900</span>
                <span>1000</span>
              </div>
            </div>
          </div>

          {/* NEXT MILESTONE */}
          {nextMilestone && (
            <div className="flex min-h-[130px] items-center gap-4 border border-white/[0.09] bg-white/[0.025] p-5">
              <Target
                size={20}
                className="text-[#6CABDD]"
              />

              <div>
                <p className="text-[9px] font-bold tracking-[0.18em] text-white/30 uppercase">
                  Next milestone
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                  {
                    nextMilestone.threshold
                  }{' '}
                  goals
                </p>

                <p className="mt-1 text-sm text-white/40">
                  {
                    nextMilestone.goalsRemaining
                  }{' '}
                  to go
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LATEST GOAL */}
      {latestGoal && (
        <Link
          to={`/goals/${latestGoal.goalNumber}`}
          className="group block border-b border-white/[0.07] bg-[#090e13] transition hover:bg-[#0d141b]"
        >
          <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5 sm:px-8 lg:px-12 xl:px-16">

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#6CABDD] shadow-[0_0_14px_rgba(108,171,221,0.8)]" />

              <span className="text-[9px] font-black tracking-[0.22em] text-[#6CABDD] uppercase">
                Latest Goal
              </span>
            </div>

            <span className="text-2xl font-black tracking-[-0.04em] text-white">
              #
              {
                latestGoal.goalNumber
              }
            </span>

            <span className="h-5 w-px bg-white/10" />

            <span className="text-xs font-black tracking-[0.08em] text-white/75 uppercase">
              {
                latestGoal.club
              }
            </span>

            <span className="text-white/20">
              —
            </span>

            <span className="text-xs font-black tracking-[0.08em] text-white/75 uppercase">
              vs{' '}
              {
                latestGoal.opponent
              }
            </span>

            <span className="text-xs font-black text-[#8CCCF2]">
              {formatMinute(
                latestGoal.minute,
                latestGoal.addedTimeMinute,
              )}
            </span>

            <span className="text-[10px] font-bold tracking-[0.1em] text-white/30 uppercase">
              {formatDate(
                latestGoal.date,
              )}
            </span>

            <ArrowUpRight
              size={15}
              className="ml-auto text-white/25 transition group-hover:text-[#6CABDD]"
            />
          </div>
        </Link>
      )}
    </section>
  )
}