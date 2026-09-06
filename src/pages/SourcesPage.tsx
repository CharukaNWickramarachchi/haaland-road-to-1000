import {
  ExternalLink,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'

import { useFootballDataset } from '../hooks/useFootballDataset'

export function SourcesPage() {
  const {
    data,
    loading,
    error,
  } = useFootballDataset()

  if (loading) {
    return (
      <Message text="Loading sources…" />
    )
  }

  if (error || !data) {
    return (
      <Message text="Sources could not be loaded." />
    )
  }

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="border-b border-white/8 pb-12">
        <p className="text-xs font-bold tracking-[0.28em] text-[#6CABDD] uppercase">
          Methodology & evidence
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-[-0.055em] uppercase sm:text-7xl">
          Sources
          <span className="block text-white/25">
            before claims.
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-7 text-white/45">
          Every published career total is reconciled against authoritative
          aggregate records. Granular goal events may use statistical
          providers, but no aggregate total is accepted without
          reconciliation.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={<FileCheck2 size={17} />}
          label="Registered sources"
          value={data.sources.length}
        />

        <Metric
          icon={<ShieldCheck size={17} />}
          label="Dataset status"
          value={
            data.dataVersion.datasetMode
          }
        />

        <Metric
          icon={<ShieldCheck size={17} />}
          label="Verified through"
          value={
            data.dataVersion.lastVerified
          }
        />
      </div>

      <div className="mt-16">
        <p className="text-xs font-bold tracking-[0.23em] text-[#6CABDD] uppercase">
          Source hierarchy
        </p>

        <div className="mt-6 border-t border-white/8">
          {[
            'Official club',
            'Official national association',
            'Official competition',
            'Reliable statistical provider',
            'Reputable news organization',
            'Secondary database',
          ].map(
            (item, index) => (
              <div
                key={item}
                className="grid grid-cols-[45px_1fr] gap-5 border-b border-white/8 py-5"
              >
                <span className="font-black text-white/20">
                  {String(
                    index + 1,
                  ).padStart(
                    2,
                    '0',
                  )}
                </span>

                <span className="font-semibold text-white/65">
                  {item}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-16">
        <p className="text-xs font-bold tracking-[0.23em] text-[#6CABDD] uppercase">
          Registered evidence
        </p>

        <div className="mt-6 grid gap-4">
          {data.sources.map(
            (source) => (
              <article
                key={source.id}
                className="border border-white/8 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#6CABDD] uppercase">
                      {
                        source.sourceType
                      }
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      {source.name}
                    </h2>
                  </div>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-white/40 uppercase transition hover:text-[#6CABDD]"
                  >
                    Open
                    <ExternalLink size={13} />
                  </a>
                </div>

                <p className="mt-5 text-sm leading-6 text-white/40">
                  {source.purpose}
                </p>

                <div className="mt-5 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-2">
                  <Info
                    label="Coverage"
                    value={
                      source.coverage
                    }
                  />

                  <Info
                    label="Last verified"
                    value={
                      source.lastVerified
                    }
                  />
                </div>

                {source.notes && (
                  <div className="mt-5">
                    <Info
                      label="Notes"
                      value={
                        source.notes
                      }
                    />
                  </div>
                )}
              </article>
            ),
          )}
        </div>
      </div>

      <article className="mt-16 border border-[#6CABDD]/20 bg-[#6CABDD]/5 p-6">
        <p className="text-xs font-bold tracking-[0.18em] text-[#6CABDD] uppercase">
          Career-goal definition
        </p>

        <p className="mt-4 max-w-4xl text-sm leading-7 text-white/50">
          The project counts official senior goals for senior club first
          teams and the Norway senior national team. Youth, academy,
          reserve, club friendly and penalty-shootout goals are excluded.
          Unknown fields remain unknown rather than being inferred.
        </p>
      </article>
    </section>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value:
    | string
    | number
}) {
  return (
    <article className="border border-white/8 p-5">
      <div className="text-[#6CABDD]">
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-bold tracking-[0.17em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>
    </article>
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
      <p className="text-[9px] font-bold tracking-[0.16em] text-white/25 uppercase">
        {label}
      </p>

      <p className="mt-1.5 text-sm leading-6 text-white/50">
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