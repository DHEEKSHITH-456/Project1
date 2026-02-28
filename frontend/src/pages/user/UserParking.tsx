import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Link } from 'react-router-dom'

interface Location {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  total_slots: number
}

interface Slot {
  id: string
  slot_number: string
  available: boolean
  price_per_hour?: number
}

export function UserParking() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selected, setSelected] = useState<Location | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/parking').then((r) => setLocations(r.data || [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) { setSlots([]); return }
    api.get(`/parking/${selected.id}`).then((r) => setSlots(r.data?.slots || [])).catch(() => setSlots([]))
  }, [selected])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Find Parking</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Parking Locations</h2>
          <ul className="space-y-2">
            {locations.map((loc) => (
              <li
                key={loc.id}
                onClick={() => setSelected(loc)}
                className={`cursor-pointer rounded-lg border p-3 ${selected?.id === loc.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <p className="font-medium">{loc.name}</p>
                <p className="text-sm text-slate-600">{loc.address}</p>
                <p className="text-xs text-slate-500">Slots: {loc.total_slots}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          {selected ? (
            <>
              <h2 className="mb-4 font-semibold">Slots: {selected.name}</h2>
              <ul className="space-y-2">
                {slots.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded border border-slate-200 p-3">
                    <span>{s.slot_number} — {s.available ? 'Available' : 'Occupied'} {s.price_per_hour != null ? `$${s.price_per_hour}/hr` : ''}</span>
                    {s.available && (
                      <Link to={`/user/book?location_id=${selected.id}&slot_id=${s.id}`} className="btn-primary text-sm">Book</Link>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-slate-500">Select a location to see slots.</p>
          )}
        </div>
      </div>
    </div>
  )
}
