import { useEffect, useState } from 'react'
import { api } from '../../services/api'

interface UserRow {
  id: string
  email: string
  name: string
  role: string
  enabled: boolean
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'user' as 'user' | 'admin' })
  const [error, setError] = useState('')

  function load() {
    api.get('/users').then((r) => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/users', form)
      setShowForm(false)
      setForm({ email: '', password: '', name: '', role: 'user' })
      load()
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: string } } }
      setError(ax?.response?.data?.detail || 'Failed')
    }
  }

  async function toggleEnabled(u: UserRow) {
    try {
      await api.put(`/users/${u.id}`, { enabled: !u.enabled })
      load()
    } catch {}
  }

  if (loading) return <p>Loading users...</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">Add User</button>
      </div>
      {showForm && (
        <div className="card mb-6">
          <h2 className="mb-4 font-semibold">New User</h2>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
            <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            <input className="input-field" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
            <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <select className="input-field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'user' | 'admin' }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Name</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Email</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Role</th>
              <th className="p-3 text-left text-sm font-medium text-slate-700">Status</th>
              <th className="p-3 text-right text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-200">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.enabled ? 'Active' : 'Disabled'}</td>
                <td className="p-3 text-right">
                  <button type="button" onClick={() => toggleEnabled(u)} className="text-sm text-primary-600 hover:underline">
                    {u.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
