import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

interface Location {
  id: string
  name: string
}

interface Slot {
  id: string
  slot_number: string
  available: boolean
  price_per_hour?: number
}

export function UserBook() {
  const [searchParams] = useSearchParams()
  const locationId = searchParams.get('location_id')
  const slotIdParam = searchParams.get('slot_id')
  const [locations, setLocations] = useState<Location[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState(locationId || '')
  const [selectedSlotId, setSelectedSlotId] = useState(slotIdParam || '')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [bookings, setBookings] = useState<Array<{ id: string; booking_id: string; start_time: string; end_time: string; status: string }>>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/parking').then((r) => setLocations(r.data || [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (locationId) setSelectedLocationId(locationId)
    if (slotIdParam) setSelectedSlotId(slotIdParam)
  }, [locationId, slotIdParam])

  useEffect(() => {
    if (!selectedLocationId) { setSlots([]); return }
    api.get(`/parking/${selectedLocationId}`).then((r) => setSlots(r.data?.slots || [])).catch(() => setSlots([]))
  }, [selectedLocationId])

  useEffect(() => {
    api.get('/bookings').then((r) => setBookings(r.data || []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    if (!selectedSlotId || !start || !end) {
      setMessage('Select slot, start and end time.')
      return
    }
    try {
      const res = await api.post('/bookings', {
        slot_id: selectedSlotId,
        location_id: selectedLocationId,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      })
      setMessage(`Booked! Booking ID: ${res.data?.booking_id || res.data?.id}`)
      setStart('')
      setEnd('')
      setSelectedSlotId('')
      api.get('/bookings').then((r) => setBookings(r.data || []))
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } }
      setMessage(ax?.response?.data?.detail || 'Booking failed')
    }
  }

  async function cancel(id: string) {
    try {
      await api.delete(`/bookings/${id}`)
      setBookings((prev) => prev.filter((b) => b.id !== id))
    } catch {}
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Book Parking</h1>
      <div className="card mb-6">
        <h2 className="mb-4 font-semibold">New Booking</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <select className="input-field" value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} required>
              <option value="">Select</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slot</label>
            <select className="input-field" value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)} required>
              <option value="">Select</option>
              {slots.filter((s) => s.available).map((s) => <option key={s.id} value={s.id}>{s.slot_number} {s.price_per_hour != null ? `$${s.price_per_hour}/hr` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Start</label>
            <input type="datetime-local" className="input-field" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End</label>
            <input type="datetime-local" className="input-field" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
          {message && <p className="col-span-2 text-sm text-slate-700">{message}</p>}
          <div className="col-span-2">
            <button type="submit" className="btn-primary">Confirm Booking</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h2 className="mb-4 font-semibold">Your Bookings</h2>
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id} className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="font-mono text-sm">{b.booking_id}</span>
              <span className="text-sm">{new Date(b.start_time).toLocaleString()} – {new Date(b.end_time).toLocaleString()}</span>
              <span>{b.status}</span>
              {b.status === 'confirmed' && (
                <button type="button" onClick={() => cancel(b.id)} className="text-sm text-rose-600 hover:underline">Cancel</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
