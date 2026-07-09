import { useMemo, useState } from 'react'
import { useSiteConfig } from '../../context/SiteConfigContext'
import { DEFAULT_CHECKOUT_URL } from '../../config'
import { money } from '../../lib/format'

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-mono text-[10px] leading-relaxed text-mist">{hint}</span>}
    </label>
  )
}

export default function SystemTab() {
  const { settings, saveSettings } = useSiteConfig()
  const [draft, setDraft] = useState({
    checkout_url: settings.checkout_url ?? '',
    tax_pct: String((Number(settings.tax_rate ?? 0.08) * 100).toFixed(2)).replace(/\.00$/, ''),
    shipping_flat: String(settings.shipping_flat ?? 19),
    free_shipping_threshold: String(settings.free_shipping_threshold ?? 999),
  })
  const [status, setStatus] = useState('idle')

  const set = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }))
    setStatus('idle')
  }

  const example = useMemo(() => {
    const sub = 1500
    const tax = sub * (Number(draft.tax_pct) / 100 || 0)
    const ship = sub >= Number(draft.free_shipping_threshold || 0) ? 0 : Number(draft.shipping_flat || 0)
    return { sub, tax, ship, total: sub + tax + ship }
  }, [draft])

  const save = async (e) => {
    e.preventDefault()
    const taxPct = Number(draft.tax_pct)
    const flat = Number(draft.shipping_flat)
    const freeAt = Number(draft.free_shipping_threshold)

    if (!Number.isFinite(taxPct) || taxPct < 0 || taxPct >= 100) {
      setStatus('invalid')
      return
    }
    if (!Number.isFinite(flat) || flat < 0 || !Number.isFinite(freeAt) || freeAt < 0) {
      setStatus('invalid')
      return
    }

    setStatus('saving')
    const { error } = await saveSettings({
      checkout_url: draft.checkout_url.trim(),
      tax_rate: Number((taxPct / 100).toFixed(4)),
      shipping_flat: flat,
      free_shipping_threshold: freeAt,
    })
    setStatus(error ? 'error' : 'saved')
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field
        label="Checkout redirect URL"
        hint={`Where "Proceed to checkout" sends shoppers — paste a live Stripe or PayPal Payment Link here to go to production. Empty falls back to the config.js constant: ${DEFAULT_CHECKOUT_URL}`}
      >
        <input
          className="field font-mono"
          type="url"
          value={draft.checkout_url}
          onChange={set('checkout_url')}
          placeholder="https://buy.stripe.com/…"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Tax rate (%)">
          <input className="field" type="number" min="0" max="99.99" step="0.01" value={draft.tax_pct} onChange={set('tax_pct')} />
        </Field>
        <Field label="Flat shipping (USD)">
          <input className="field" type="number" min="0" step="0.01" value={draft.shipping_flat} onChange={set('shipping_flat')} />
        </Field>
        <Field label="Free shipping over (USD)">
          <input className="field" type="number" min="0" step="1" value={draft.free_shipping_threshold} onChange={set('free_shipping_threshold')} />
        </Field>
      </div>

      <div className="glass rounded-2xl p-4 font-mono text-xs text-mist">
        <p className="mb-2 uppercase tracking-[0.25em]">Worked example — {money(example.sub)} cart</p>
        <p>
          Tax {money(example.tax)} · Shipping {example.ship === 0 ? 'Free' : money(example.ship)} ·{' '}
          <span className="text-fog">Total {money(example.total)}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={status === 'saving'} className="btn-primary px-5 py-2.5 text-sm">
          {status === 'saving' ? 'Saving…' : 'Save system settings'}
        </button>
        {status === 'saved' && (
          <span className="font-mono text-xs text-accent">Saved — carts everywhere reprice instantly.</span>
        )}
        {status === 'error' && (
          <span className="font-mono text-xs text-accent-2">Save failed — are you the admin?</span>
        )}
        {status === 'invalid' && (
          <span className="font-mono text-xs text-accent-2">Check the numbers — no negatives, tax under 100%.</span>
        )}
      </div>
    </form>
  )
}
