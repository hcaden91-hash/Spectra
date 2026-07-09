import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setPending(true)
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    setPending(false)

    if (err) {
      setError(err.message)
      return
    }

    // Supabase quirk: signing up an existing confirmed email returns a user
    // with an empty identities array instead of an error. Route to sign-in.
    if (data?.user && data.user.identities?.length === 0) {
      setError('An account with this email already exists — sign in instead.')
      return
    }

    // If "Confirm email" is off in Supabase, signUp returns a session already —
    // the account is live, so skip the verification screen entirely.
    if (data?.session) {
      navigate(next)
      return
    }

    // Account created, inactive until the emailed 6-digit code is entered.
    sessionStorage.setItem('pending_verify_email', email)
    navigate('/verify', { state: { email, next } })
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="glass rise w-full rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Join the store</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-mist">
          We'll email you a one-time 6-digit code to activate it.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block font-mono text-xs text-mist">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block font-mono text-xs text-mist">
              Password <span className="normal-case">(8+ characters)</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block font-mono text-xs text-mist">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="field"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-accent-2">{error}</p>}

          <button type="submit" disabled={pending} className="btn-primary w-full px-4 py-3 text-sm">
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-sm text-mist">
          Already registered?{' '}
          <Link
            to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
