import { useState } from 'react'
import { useSiteConfig } from '../../context/SiteConfigContext'

const THEME_DEFAULTS = {
  color_accent: '#4f8dff',
  color_accent_2: '#22d3ee',
  color_void: '#0a0c10',
}

// Preview locally (this tab only) before committing; Save broadcasts to all.
const applyPreview = (draft) => {
  const root = document.documentElement
  root.style.setProperty('--accent', draft.color_accent)
  root.style.setProperty('--accent2', draft.color_accent_2)
  root.style.setProperty('--void', draft.color_void)
}

function ColorField({ label, value, onChange, hint }) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-xs text-mist">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-line bg-transparent"
          aria-label={`${label} color picker`}
        />
        <input
          className="field font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          aria-label={`${label} hex value`}
        />
      </div>
      {hint && <p className="mt-1 font-mono text-[10px] text-mist">{hint}</p>}
    </div>
  )
}

export default function ThemeTab() {
  const { settings, saveSettings } = useSiteConfig()
  const [draft, setDraft] = useState({
    color_accent: settings.color_accent ?? THEME_DEFAULTS.color_accent,
    color_accent_2: settings.color_accent_2 ?? THEME_DEFAULTS.color_accent_2,
    color_void: settings.color_void ?? THEME_DEFAULTS.color_void,
  })
  const [status, setStatus] = useState('idle')

  const setColor = (key) => (value) => {
    const nextDraft = { ...draft, [key]: value }
    setDraft(nextDraft)
    setStatus('idle')
    if (/^#[0-9a-fA-F]{6}$/.test(value)) applyPreview(nextDraft)
  }

  const reset = () => {
    setDraft(THEME_DEFAULTS)
    applyPreview(THEME_DEFAULTS)
    setStatus('idle')
  }

  const save = async (e) => {
    e.preventDefault()
    for (const [key, val] of Object.entries(draft)) {
      if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
        setStatus('invalid-' + key)
        return
      }
    }
    setStatus('saving')
    const { error } = await saveSettings(draft)
    setStatus(error ? 'error' : 'saved')
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      <p className="text-sm leading-relaxed text-mist">
        Colors preview instantly in this tab as you pick them. Saving writes them to the database
        and restyles every open session over realtime.
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        <ColorField
          label="Accent"
          value={draft.color_accent}
          onChange={setColor('color_accent')}
          hint="Buttons, links, highlights."
        />
        <ColorField
          label="Accent 2"
          value={draft.color_accent_2}
          onChange={setColor('color_accent_2')}
          hint="Warnings and secondary glow."
        />
        <ColorField
          label="Background"
          value={draft.color_void}
          onChange={setColor('color_void')}
          hint="Page base. Keep it dark for contrast."
        />
      </div>

      {/* Live sample of the tokens in use */}
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <button type="button" className="btn-primary px-4 py-2 text-sm">Primary button</button>
        <button type="button" className="btn-ghost px-4 py-2 text-sm">Ghost button</button>
        <span className="font-mono text-xs text-accent">accent text</span>
        <span className="font-mono text-xs text-accent-2">accent-2 text</span>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={status === 'saving'} className="btn-primary px-5 py-2.5 text-sm">
          {status === 'saving' ? 'Saving…' : 'Save theme'}
        </button>
        <button type="button" onClick={reset} className="btn-ghost px-4 py-2.5 text-sm">
          Reset to defaults
        </button>
        {status === 'saved' && (
          <span className="font-mono text-xs text-accent">Saved — every session restyled.</span>
        )}
        {status === 'error' && (
          <span className="font-mono text-xs text-accent-2">Save failed — are you the admin?</span>
        )}
        {status.startsWith('invalid') && (
          <span className="font-mono text-xs text-accent-2">Hex values must look like #4f8dff.</span>
        )}
      </div>
    </form>
  )
}
