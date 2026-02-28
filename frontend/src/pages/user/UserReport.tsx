import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface Location { id: string; name: string }

interface Issue {
  id: string
  location_id: string
  vehicle_number: string
  description: string
  status: string
  created_at: string
}

export function UserReport() {
  const [locations, setLocations] = useState<Location[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [form, setForm] = useState({ location_id: '', vehicle_number: '', description: '', image_url: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/parking').then((r) => setLocations(r.data || []))
    api.get('/issues').then((r) => setIssues(r.data || [])).finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/issues', {
        location_id: form.location_id,
        vehicle_number: form.vehicle_number,
        description: form.description,
        image_url: form.image_url || undefined,
      })
      setMessage('Issue reported successfully.')
      setForm({ location_id: '', vehicle_number: '', description: '', image_url: '' })
      api.get('/issues').then((r) => setIssues(r.data || []))
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } }
      setMessage(ax?.response?.data?.detail || 'Failed to report')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Report Parking Issue</h1>
      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Parking Location</label>
            <select className="input-field" value={form.location_id} onChange={(e) => setForm((f) => ({ ...f, location_id: e.target.value }))} required>
              <option value="">Select</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Vehicle Number</label>
            <input className="input-field" placeholder="e.g. ABC-1234" value={form.vehicle_number} onChange={(e) => setForm((f) => ({ ...f, vehicle_number: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className="input-field min-h-[100px]" placeholder="Describe the issue (blocked slot, wrong parking, etc.)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Image URL (optional)</label>
            <input className="input-field" placeholder="https://..." value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
          </div>
          {message && <p className="text-sm text-slate-700">{message}</p>}
          <button type="submit" className="btn-primary">Submit Report</button>
        </form>
      </div>
      <div className="card">
        <h2 className="mb-4 font-semibold">Your Reported Issues</h2>
        <ul className="space-y-2">
          {issues.map((i) => (
            <li key={i.id} className="flex justify-between border-b border-slate-100 py-2 text-sm">
              <span className="font-mono">{i.vehicle_number}</span>
              <span>{i.description.slice(0, 40)}…</span>
              <span>{i.status}</span>
              <span>{new Date(i.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
