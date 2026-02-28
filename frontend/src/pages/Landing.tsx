import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Landing() {
  const { token, role, loading } = useAuth()

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (token && role === 'admin') return <Navigate to="/admin" replace />
  if (token && role === 'user') return <Navigate to="/user" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-12">
        <h1 className="mb-2 text-5xl font-bold tracking-tight">ZyPark</h1>
        <p className="mb-12 text-xl text-slate-300">Smart Parking Assistance & Management</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/login/admin"
            className="rounded-xl border-2 border-primary-400 bg-primary-600 px-8 py-4 text-center font-semibold shadow-lg transition hover:bg-primary-500"
          >
            Admin Login
          </Link>
          <Link
            to="/login/user"
            className="rounded-xl border-2 border-emerald-400 bg-emerald-600 px-8 py-4 text-center font-semibold shadow-lg transition hover:bg-emerald-500"
          >
            User Login
          </Link>
        </div>
        <p className="mt-8 text-slate-400">
          New user? <Link to="/register" className="text-primary-300 underline hover:text-primary-200">Register</Link>
        </p>
      </div>
    </div>
  )
}
