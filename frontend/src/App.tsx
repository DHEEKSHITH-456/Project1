import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { AdminLayout } from './components/AdminLayout'
import { UserLayout } from './components/UserLayout'
import { Landing } from './pages/Landing'
import { LoginAdmin } from './pages/LoginAdmin'
import { LoginUser } from './pages/LoginUser'
import { Register } from './pages/Register'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminParking } from './pages/admin/AdminParking'
import { AdminBookings } from './pages/admin/AdminBookings'
import { AdminIssues } from './pages/admin/AdminIssues'
import { AdminAnalytics } from './pages/admin/AdminAnalytics'
import { UserDashboard } from './pages/user/UserDashboard'
import { UserParking } from './pages/user/UserParking'
import { UserBook } from './pages/user/UserBook'
import { UserReport } from './pages/user/UserReport'
import { UserAlerts } from './pages/user/UserAlerts'
import { UserProfile } from './pages/user/UserProfile'

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function ProtectedUser({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (role !== 'user') return <Navigate to="/" replace />
  return <>{children}</>
}

function RedirectIfAuth() {
  const { token, role } = useAuth()
  if (!token) return null
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/user" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/admin" element={<LoginAdmin />} />
      <Route path="/login/user" element={<LoginUser />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="parking" element={<AdminParking />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="issues" element={<AdminIssues />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="/user" element={<ProtectedUser><UserLayout /></ProtectedUser>}>
        <Route index element={<UserDashboard />} />
        <Route path="parking" element={<UserParking />} />
        <Route path="book" element={<UserBook />} />
        <Route path="report" element={<UserReport />} />
        <Route path="alerts" element={<UserAlerts />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
