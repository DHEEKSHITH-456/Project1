import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface Booking {
  id: string
  booking_id: string
  start_time: string
  end_time: string
  status: string
}

interface Issue {
  id: string
  vehicle_number: string
  status: string
}

export function UserDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    api.get('/bookings').then((r) => setBookings((r.data || []).slice(0, 5)))
    api.get('/issues').then((r) => setIssues((r.data || []).slice(0, 5)))
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Welcome, {user?.name || user?.email}</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link to="/user/parking" className="card border-2 border-emerald-200 bg-emerald-50/50 hover:border-emerald-400">
          <p className="font-semibold text-emerald-800">Find Parking</p>
          <p className="text-sm text-slate-600">Search and view nearby parking</p>
        </Link>
        <Link to="/user/book" className="card border-2 border-primary-200 bg-primary-50/50 hover:border-primary-400">
          <p className="font-semibold text-primary-800">Book Parking</p>
          <p className="text-sm text-slate-600">Reserve a slot</p>
        </Link>
        <Link to="/user/report" className="card border-2 border-amber-200 bg-amber-50/50 hover:border-amber-400">
          <p className="font-semibold text-amber-800">Report Issue</p>
          <p className="text-sm text-slate-600">Report blocked or wrong parking</p>
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-slate-500">No bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li key={b.id} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                  <span className="font-mono">{b.booking_id}</span>
                  <span>{b.status} · {new Date(b.start_time).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/user/book" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">View all / Book</Link>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Active Alerts / Issues</h2>
          {issues.length === 0 ? (
            <p className="text-slate-500">No reported issues.</p>
          ) : (
            <ul className="space-y-2">
              {issues.map((i) => (
                <li key={i.id} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                  <span className="font-mono">{i.vehicle_number}</span>
                  <span>{i.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/user/alerts" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">View alerts</Link>
        </div>
      </div>
    </div>
  )
}
