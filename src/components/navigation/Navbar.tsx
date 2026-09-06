import { Menu } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'Goals', path: '/goals' },
  { label: 'Career', path: '/career' },
  { label: 'Seasons', path: '/seasons' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Opponents', path: '/opponents' },
  { label: 'Projection', path: '/projection' },
  { label: 'Records', path: '/records' },
  { label: 'Sources', path: '/sources' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080b0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <NavLink to="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#6CABDD]/40 bg-[#6CABDD]/8">
            <span className="text-xs font-black tracking-tight text-[#6CABDD]">
              H
            </span>
          </div>

          <div className="leading-none">
            <p className="text-sm font-black tracking-[0.16em] text-white">
              HAALAND
            </p>
            <p className="mt-1 text-[9px] font-bold tracking-[0.28em] text-white/40">
              ROAD TO 1000
            </p>
          </div>
        </NavLink>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 xl:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors',
                  isActive
                    ? 'text-[#6CABDD]'
                    : 'text-white/45 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to="/projection"
            className="hidden border border-[#6CABDD]/30 bg-[#6CABDD]/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-[#9FD8F7] uppercase transition hover:bg-[#6CABDD]/16 sm:block"
          >
            Road to 1000
          </NavLink>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/70 transition hover:border-white/20 hover:text-white xl:hidden"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/8 bg-[#080b0f] px-5 py-5 xl:hidden"
        >
          <div className="mx-auto grid max-w-[1440px] gap-1 sm:grid-cols-2">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'border-b border-white/6 px-2 py-3 text-xs font-semibold tracking-[0.14em] uppercase',
                    isActive ? 'text-[#6CABDD]' : 'text-white/55',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}