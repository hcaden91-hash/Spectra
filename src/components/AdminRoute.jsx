import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Client-side guard for the hidden admin route. This is a UX layer — the
 * real enforcement is Row Level Security in Postgres, which rejects every
 * write from a non-admin session no matter what runs in the browser.
 * Non-admins are bounced to the homepage with no hint the route exists.
 */
export default function AdminRoute({ children }) {
  const { user, isAdmin, authLoading, adminStatusLoaded } = useAuth()
  const location = useLocation()

  if (authLoading || (user && !adminStatusLoaded)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Checking access…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
