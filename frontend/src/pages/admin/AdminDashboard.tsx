import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface Overview {
  total_users: number
  total_locations: number
  total_bookings: number
  active_issues: number
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/overview').then((r) => {
      setOverview(r.data)
    }).catch(() => setOverview({
      total_users: 0,
      total_locations: 0,
      total_bookings: 0,
      active_issues: 0,
    })).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading dashboard...</p>

  const cards = [
    { label: 'Total Users', value: overview?.total_users ?? 0, color: 'bg-primary-500' },
    { label: 'Parking Locations', value: overview?.total_locations ?? 0, color: 'bg-emerald-500' },
    { label: 'Total Bookings', value: overview?.total_bookings ?? 0, color: 'bg-amber-500' },
    { label: 'Active Issues', value: overview?.active_issues ?? 0, color: 'bg-rose-500' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl ${c.color} p-6 text-white shadow`}>
            <p className="text-sm opacity-90">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
