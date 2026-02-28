import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const nav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/parking', label: 'Parking' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/issues', label: 'Issues' },
  { to: '/admin/analytics', label: 'Analytics' },
]

export function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/admin" className="text-xl font-bold text-primary-600">ZyPark Admin</Link>
          <nav className="flex gap-4">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded px-3 py-1.5 text-sm font-medium ${location.pathname === to ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email}</span>
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
