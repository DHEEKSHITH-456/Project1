import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface Issue {
  id: string
  user_id: string
  location_id: string
  vehicle_number: string
  description: string
  status: string
  admin_notes?: string
  created_at: string
}

export function AdminIssues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  function load() {
    const params = statusFilter ? { status_filter: statusFilter } : {}
    api.get('/issues', { params }).then((r) => setIssues(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  async function updateStatus(id: string, status: string) {
    await api.put(`/issues/${id}`, { status })
    load()
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Issue & Alert Monitoring</h1>
        <select className="input-field w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Vehicle</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Description</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Status</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Created</th>
              <th className="p-3 text-right text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i.id} className="border-t border-slate-200">
                <td className="p-3 font-mono">{i.vehicle_number}</td>
                <td className="p-3">{i.description}</td>
                <td className="p-3">{i.status}</td>
                <td className="p-3 text-sm">{new Date(i.created_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  {i.status === 'open' && (
                    <button type="button" onClick={() => updateStatus(i.id, 'in_progress')} className="mr-2 text-sm text-amber-600 hover:underline">In Progress</button>
                  )}
                  {i.status !== 'resolved' && (
                    <button type="button" onClick={() => updateStatus(i.id, 'resolved')} className="text-sm text-emerald-600 hover:underline">Resolve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
