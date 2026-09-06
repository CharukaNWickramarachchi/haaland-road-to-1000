import { Outlet } from 'react-router-dom'

import { Footer } from '../components/navigation/Footer'
import { Navbar } from '../components/navigation/Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#080b0f] text-white">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}