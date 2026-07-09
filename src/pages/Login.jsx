import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setPending(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setPending(false)

    if (err) {
      // Account exists but never entered its 6-digit code — send them there.
      if (/confirm/i.test(err.message)) {
        sessionStorage.setItem('pending_verify_email', email)
        navigate('/verify', { state: { email, next, reason: 'unconfirmed' } })
        return
      }
      setError(err.message)
      return
    }
    navigate(next)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="glass rise w-full rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Welcome back</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">Sign in</h1>

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
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-accent-2">{error}</p>}

          <button type="submit" disabled={pending} className="btn-primary w-full px-4 py-3 text-sm">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-sm text-mist">
          New here?{' '}
          <Link
            to={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
