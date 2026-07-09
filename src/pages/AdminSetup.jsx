import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ADMIN_ROUTE, ADMIN_SETUP_ROUTE } from '../config'

function Shell({ children }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4">
      <div className="glass rise w-full rounded-2xl p-8">{children}</div>
    </div>
  )
}

export default function AdminSetup() {
  const { user, isAdmin, adminClaimed, adminStatusLoaded, refreshAdminStatus } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const claim = async () => {
    setPending(true)
    setError('')
    const { data, error: err } = await supabase.rpc('claim_admin')
    if (err) {
      setError(err.message)
      setPending(false)
      return
    }
    // Refresh status either way: data === true means we hold the seat,
    // false means someone beat us to it and the route is now locked.
    await refreshAdminStatus()
    setPending(false)
    if (data === true) navigate(ADMIN_ROUTE)
  }

  if (!adminStatusLoaded) {
    return (
      <Shell>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Checking seat status…</p>
      </Shell>
    )
  }

  // Seat already taken by someone else: permanently locked.
  if (adminClaimed && !isAdmin) {
    return (
      <Shell>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Locked</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">Setup is closed</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          The master admin seat for this store was claimed and this route is permanently locked.
          The lock lives in the database, so it holds on every device and platform.
        </p>
        <Link to="/" className="btn-ghost mt-6 inline-block px-4 py-2 text-sm">
          Back to the store
        </Link>
      </Shell>
    )
  }

  // Current user already holds the seat.
  if (isAdmin) {
    return (
      <Shell>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">You're the admin</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">This seat is yours</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Your account holds the one master admin seat. Sign in anywhere with{' '}
          <span className="font-mono text-fog">{user?.email}</span> and the panel unlocks —
          the seat is stored centrally, not on this device.
        </p>
        <Link to={ADMIN_ROUTE} className="btn-primary mt-6 inline-block px-5 py-2.5 text-sm">
          Open the admin portal
        </Link>
      </Shell>
    )
  }

  // Seat unclaimed, nobody signed in: route through verified registration.
  if (!user) {
    return (
      <Shell>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">First-time setup</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">Claim the master admin seat</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          This store has exactly one admin seat, and it hasn't been claimed yet. Create an account
          (you'll verify it with a 6-digit email code), come back here, and claim it. The moment
          it's claimed, this route locks forever.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to={`/register?next=${encodeURIComponent(ADMIN_SETUP_ROUTE)}`}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Create an account
          </Link>
          <Link
            to={`/login?next=${encodeURIComponent(ADMIN_SETUP_ROUTE)}`}
            className="btn-ghost px-5 py-2.5 text-sm"
          >
            I already have one
          </Link>
        </div>
      </Shell>
    )
  }

  // Signed in, seat unclaimed: the claim button.
  return (
    <Shell>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">First-time setup</p>
      <h1 className="font-display mt-2 text-2xl font-semibold">Claim the master admin seat</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist">
        Signed in as <span className="font-mono text-fog">{user.email}</span>. Claiming binds the
        seat to this account permanently — the claim is atomic in the database, so only the first
        account can ever win it, and this route locks the instant it happens.
      </p>
      {error && <p className="mt-3 text-sm text-accent-2">{error}</p>}
      <button onClick={claim} disabled={pending} className="btn-primary mt-6 px-5 py-2.5 text-sm">
        {pending ? 'Claiming…' : 'Claim master admin'}
      </button>
    </Shell>
  )
}
