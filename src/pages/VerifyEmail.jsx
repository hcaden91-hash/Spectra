import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const initialEmail =
    location.state?.email ||
    searchParams.get('email') ||
    sessionStorage.getItem('pending_verify_email') ||
    ''
  const next = location.state?.next || searchParams.get('next') || '/'

  const [email, setEmail] = useState(initialEmail)
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resent, setResent] = useState(false)
  const inputsRef = useRef([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const setDigit = (i, value) => {
    const v = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const copy = [...prev]
      copy[i] = v
      return copy
    })
    if (v && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus()
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) inputsRef.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus()
  }

  const onPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next6 = Array(CODE_LENGTH)
      .fill('')
      .map((_, i) => pasted[i] ?? '')
    setDigits(next6)
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  const code = digits.join('')

  const verify = async (e) => {
    e?.preventDefault()
    if (!email) {
      setError('Enter the email you signed up with.')
      return
    }
    if (code.length !== CODE_LENGTH) {
      setError('Enter all six digits.')
      return
    }
    setError('')
    setPending(true)
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    setPending(false)

    if (err) {
      setError(
        /expired|invalid/i.test(err.message)
          ? 'That code is invalid or expired — request a new one below.'
          : err.message
      )
      return
    }

    // Verified: Supabase returns a session, the account is now active.
    sessionStorage.removeItem('pending_verify_email')
    navigate(next)
  }

  const resend = async () => {
    if (!email) {
      setError('Enter the email you signed up with.')
      return
    }
    setError('')
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    if (err) {
      setError(err.message)
      return
    }
    setResent(true)
    setCooldown(RESEND_COOLDOWN)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="glass rise w-full rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">One more step</p>
        <h1 className="font-display mt-2 text-2xl font-semibold">Enter your 6-digit code</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          {location.state?.reason === 'unconfirmed'
            ? 'This account was never activated. '
            : ''}
          We sent a one-time code to{' '}
          {email ? <span className="font-mono text-fog">{email}</span> : 'your inbox'} — it activates
          your account.
        </p>

        <form onSubmit={verify} className="mt-6 space-y-5">
          {!initialEmail && (
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@example.com"
              aria-label="Email address"
            />
          )}

          <div className="flex justify-between gap-2" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className="field h-13 w-11 !p-0 text-center font-mono text-xl"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {error && <p className="text-sm text-accent-2">{error}</p>}
          {resent && !error && (
            <p className="text-sm text-accent">New code sent — check your inbox (and spam).</p>
          )}

          <button
            type="submit"
            disabled={pending || code.length !== CODE_LENGTH}
            className="btn-primary w-full px-4 py-3 text-sm"
          >
            {pending ? 'Verifying…' : 'Verify and activate'}
          </button>
        </form>

        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="mt-4 font-mono text-xs text-mist transition-colors hover:text-fog disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  )
}
