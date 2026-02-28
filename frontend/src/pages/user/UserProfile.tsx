import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { api } from '../../services/api'

export function UserProfile() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Array<{ booking_id: string; start_time: string; status: string }>>([])
  const [issues, setIssues] = useState<Array<{ vehicle_number: string; status: string; created_at: string }>>([])

  useEffect(() => {
    api.get('/bookings').then((r) => setBookings(r.data || []))
    api.get('/issues').then((r) => setIssues(r.data || []))
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Profile</h1>
      <div className="card mb-6">
        <h2 className="mb-4 font-semibold">Your Details</h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          <dt className="text-slate-600">Name</dt>
          <dd>{user?.name || '—'}</dd>
          <dt className="text-slate-600">Email</dt>
          <dd>{user?.email}</dd>
          <dt className="text-slate-600">Role</dt>
          <dd>{user?.role}</dd>
        </dl>
      </div>
      <div className="card">
        <h2 className="mb-4 font-semibold">Activity History</h2>
        <p className="mb-4 text-sm text-slate-600">Recent bookings and reports.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-medium">Bookings</h3>
            <ul className="space-y-1 text-sm">
              {bookings.slice(0, 10).map((b, i) => (
                <li key={i}>{b.booking_id} · {b.status} · {new Date(b.start_time).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Issues Reported</h3>
            <ul className="space-y-1 text-sm">
              {issues.slice(0, 10).map((i, idx) => (
                <li key={idx}>{i.vehicle_number} · {i.status} · {new Date(i.created_at).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
