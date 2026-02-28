import { useEffect, useState } from 'react'
import { api } from '../../services/api'

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

export function AdminParking() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selected, setSelected] = useState<Location | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', lat: 40.71, lng: -74.00, total_slots: 0 })
  const [slotForm, setSlotForm] = useState({ slot_number: '', price_per_hour: '' })

  function loadLocations() {
    api.get('/parking').then((r) => setLocations(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { loadLocations() }, [])

  useEffect(() => {
    if (!selected) { setSlots([]); return }
    api.get(`/parking/${selected.id}`).then((r) => setSlots(r.data.slots || [])).catch(() => setSlots([]))
  }, [selected])

  async function handleCreateLocation(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/parking', {
      name: form.name,
      address: form.address,
      coordinates: { lat: form.lat, lng: form.lng },
      total_slots: form.total_slots,
    })
    setShowForm(false)
    setForm({ name: '', address: '', lat: 40.71, lng: -74.00, total_slots: 0 })
    loadLocations()
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    await api.post(`/parking/${selected.id}/slots`, {
      slot_number: slotForm.slot_number,
      price_per_hour: slotForm.price_per_hour ? parseFloat(slotForm.price_per_hour) : null,
    })
    setSlotForm({ slot_number: '', price_per_hour: '' })
    api.get(`/parking/${selected.id}`).then((r) => setSlots(r.data.slots || []))
  }

  async function toggleSlotAvailability(slot: Slot) {
    if (!selected) return
    await api.put(`/parking/${selected.id}/slots/${slot.id}`, { available: !slot.available })
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, available: !s.available } : s)))
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Parking Management</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">Add Location</button>
      </div>
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleCreateLocation} className="grid gap-4 sm:grid-cols-2">
            <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <input className="input-field" placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
            <input type="number" step="any" className="input-field" placeholder="Lat" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: parseFloat(e.target.value) || 0 }))} />
            <input type="number" step="any" className="input-field" placeholder="Lng" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: parseFloat(e.target.value) || 0 }))} />
            <input type="number" className="input-field" placeholder="Total slots" value={form.total_slots || ''} onChange={(e) => setForm((f) => ({ ...f, total_slots: parseInt(e.target.value, 10) || 0 }))} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Locations</h2>
          <ul className="space-y-2">
            {locations.map((loc) => (
              <li
                key={loc.id}
                onClick={() => setSelected(loc)}
                className={`cursor-pointer rounded-lg border p-3 ${selected?.id === loc.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <p className="font-medium">{loc.name}</p>
                <p className="text-sm text-slate-600">{loc.address}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          {selected ? (
            <>
              <h2 className="mb-4 font-semibold">Slots: {selected.name}</h2>
              <form onSubmit={handleAddSlot} className="mb-4 flex gap-2">
                <input className="input-field flex-1" placeholder="Slot number" value={slotForm.slot_number} onChange={(e) => setSlotForm((f) => ({ ...f, slot_number: e.target.value }))} required />
                <input className="input-field w-24" placeholder="Price/hr" type="number" step="0.01" value={slotForm.price_per_hour} onChange={(e) => setSlotForm((f) => ({ ...f, price_per_hour: e.target.value }))} />
                <button type="submit" className="btn-primary">Add</button>
              </form>
              <ul className="space-y-2">
                {slots.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded border border-slate-200 p-2">
                    <span>{s.slot_number} — {s.available ? 'Free' : 'Occupied'} {s.price_per_hour != null ? `$${s.price_per_hour}/hr` : ''}</span>
                    <button type="button" onClick={() => toggleSlotAvailability(s)} className="text-sm text-primary-600 hover:underline">
                      Mark {s.available ? 'Occupied' : 'Free'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-slate-500">Select a location to manage slots.</p>
          )}
        </div>
      </div>
    </div>
  )
}
