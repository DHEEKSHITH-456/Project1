import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface Issue {
  id: string
  location_id: string
  vehicle_number: string
  description: string
  status: string
  admin_notes?: string
  created_at: string
}

export function UserAlerts() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/issues').then((r) => setIssues(r.data || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Alerts & Responses</h1>
      <p className="mb-4 text-slate-600">Your reported issues and their status. (Notifications are mock — status updates appear here.)</p>
      <div className="card">
        <ul className="space-y-4">
          {issues.length === 0 ? (
            <li className="text-slate-500">No alerts or issues.</li>
          ) : (
            issues.map((i) => (
              <li key={i.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between">
                  <span className="font-mono font-medium">{i.vehicle_number}</span>
                  <span className={`rounded px-2 py-0.5 text-sm ${i.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{i.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{i.description}</p>
                {i.admin_notes && <p className="mt-2 text-sm text-primary-700">Admin: {i.admin_notes}</p>}
                <p className="mt-2 text-xs text-slate-500">Reported {new Date(i.created_at).toLocaleString()}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
