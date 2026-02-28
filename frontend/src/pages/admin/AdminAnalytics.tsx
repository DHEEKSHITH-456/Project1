import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface UsageDay { date: string; count: number }
interface PeakHour { hour: number; count: number }
interface TopLocation { location_id: string; location_name: string; bookings: number }
interface Resolution { avg_resolution_hours: number }

export function AdminAnalytics() {
  const [usage, setUsage] = useState<UsageDay[]>([])
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])
  const [topLocations, setTopLocations] = useState<TopLocation[]>([])
  const [resolution, setResolution] = useState<Resolution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/usage?days=14').then((r) => setUsage(r.data)),
      api.get('/analytics/peak-hours').then((r) => setPeakHours(r.data)),
      api.get('/analytics/top-locations').then((r) => setTopLocations(r.data)),
      api.get('/analytics/issue-resolution').then((r) => setResolution(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading analytics...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Analytics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Daily usage (last 14 days)</h2>
          <ul className="space-y-1 text-sm">
            {usage.length ? usage.map((u) => (
              <li key={u.date} className="flex justify-between"><span>{u.date}</span><span>{u.count} bookings</span></li>
            )) : <li className="text-slate-500">No data</li>}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Peak booking hours</h2>
          <ul className="space-y-1 text-sm">
            {peakHours.length ? peakHours.map((p) => (
              <li key={p.hour} className="flex justify-between"><span>{p.hour}:00</span><span>{p.count} bookings</span></li>
            )) : <li className="text-slate-500">No data</li>}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Most used locations</h2>
          <ul className="space-y-1 text-sm">
            {topLocations.length ? topLocations.map((t) => (
              <li key={t.location_id} className="flex justify-between"><span>{t.location_name}</span><span>{t.bookings}</span></li>
            )) : <li className="text-slate-500">No data</li>}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Issue resolution</h2>
          <p className="text-slate-700">Avg. resolution time: <strong>{resolution?.avg_resolution_hours ?? 0}</strong> hours</p>
        </div>
      </div>
    </div>
  )
}
