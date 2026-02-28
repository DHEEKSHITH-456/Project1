import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface Booking {
  id: string
  booking_id: string
  user_id: string
  location_id: string
  slot_id: string
  start_time: string
  end_time: string
  status: string
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    api.get('/bookings').then((r) => setBookings(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function cancel(b: Booking) {
    if (b.status === 'cancelled') return
    try {
      await api.delete(`/bookings/${b.id}`)
      load()
    } catch {}
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Booking Management</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Booking ID</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">User ID</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Start</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">End</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Status</th>
              <th className="p-3 text-right text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-slate-200">
                <td className="p-3 font-mono text-sm">{b.booking_id}</td>
                <td className="p-3 text-sm">{b.user_id}</td>
                <td className="p-3 text-sm">{new Date(b.start_time).toLocaleString()}</td>
                <td className="p-3 text-sm">{new Date(b.end_time).toLocaleString()}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3 text-right">
                  {b.status === 'confirmed' && (
                    <button type="button" onClick={() => cancel(b)} className="text-sm text-rose-600 hover:underline">Cancel</button>
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
