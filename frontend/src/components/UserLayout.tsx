import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const nav = [
  { to: '/user', label: 'Dashboard' },
  { to: '/user/parking', label: 'Find Parking' },
  { to: '/user/book', label: 'Book' },
  { to: '/user/report', label: 'Report Issue' },
  { to: '/user/alerts', label: 'Alerts' },
  { to: '/user/profile', label: 'Profile' },
]

export function UserLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/user" className="text-xl font-bold text-zypark-green">ZyPark</Link>
          <nav className="flex gap-2">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded px-3 py-1.5 text-sm font-medium ${location.pathname === to ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.name || user?.email}</span>
            <button type="button" onClick={logout} className="btn-secondary text-sm">Logout</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
