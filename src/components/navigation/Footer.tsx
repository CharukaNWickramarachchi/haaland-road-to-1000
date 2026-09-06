import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#06080b]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-lg font-black tracking-[0.15em]">
              HAALAND
            </p>

            <p className="mt-1 text-xs font-bold tracking-[0.28em] text-[#6CABDD]">
              ROAD TO 1000
            </p>

            <p className="mt-5 max-w-xl text-sm leading-6 text-white/45">
              An independent, data-driven football statistics and visualization
              project tracking Erling Haaland&apos;s senior career scoring
              journey.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 text-sm">
            <Link to="/sources" className="text-white/50 hover:text-white">
              Data methodology
            </Link>

            <Link to="/sources" className="text-white/50 hover:text-white">
              Sources
            </Link>

            <Link to="/analytics" className="text-white/50 hover:text-white">
              Analytics
            </Link>

            <Link to="/projection" className="text-white/50 hover:text-white">
              Projection
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-6 text-xs leading-5 text-white/30">
          This project is an independent statistics and visualization project
          and is not affiliated with Erling Haaland, Manchester City, or the
          Norwegian Football Federation.
        </div>
      </div>
    </footer>
  )
}