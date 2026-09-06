import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="flex min-h-[75vh] items-center justify-center px-5 text-center">
      <div>
        <p className="text-xs font-bold tracking-[0.3em] text-[#6CABDD] uppercase">
          404
        </p>

        <h1 className="mt-5 text-5xl font-black tracking-[-0.04em] uppercase sm:text-7xl">
          You lost
          <span className="block text-white/30">the ball.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-white/40">
          The page you were looking for does not exist on this part of the
          road.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 border border-white/12 px-5 py-3 text-xs font-bold tracking-[0.15em] uppercase transition hover:border-[#6CABDD]/50 hover:text-[#8FC9ED]"
        >
          <ArrowLeft size={15} />
          Back to the road
        </Link>
      </div>
    </section>
  )
}