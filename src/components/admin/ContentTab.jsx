import { useState } from 'react'
import { useSiteConfig } from '../../context/SiteConfigContext'

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-mono text-[10px] text-mist">{hint}</span>}
    </label>
  )
}

export default function ContentTab() {
  const { settings, saveSettings } = useSiteConfig()
  const [draft, setDraft] = useState({
    site_name: settings.site_name ?? '',
    announcement: settings.announcement ?? '',
    hero_title: settings.hero_title ?? '',
    hero_subtitle: settings.hero_subtitle ?? '',
    cta_text: settings.cta_text ?? '',
    banner_image_url: settings.banner_image_url ?? '',
  })
  const [status, setStatus] = useState('idle')

  const set = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }))
    setStatus('idle')
  }

  const save = async (e) => {
    e.preventDefault()
    setStatus('saving')
    const { error } = await saveSettings(draft)
    setStatus(error ? 'error' : 'saved')
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field label="Site name" hint="Navbar wordmark, footer, and browser tab title.">
        <input className="field" value={draft.site_name} onChange={set('site_name')} required />
      </Field>
      <Field label="Announcement bar" hint="Leave empty to hide the ribbon entirely.">
        <input className="field" value={draft.announcement} onChange={set('announcement')} />
      </Field>
      <Field label="Hero title">
        <input className="field" value={draft.hero_title} onChange={set('hero_title')} required />
      </Field>
      <Field label="Hero subtitle">
        <textarea className="field min-h-24" value={draft.hero_subtitle} onChange={set('hero_subtitle')} />
      </Field>
      <Field label="Primary button text">
        <input className="field" value={draft.cta_text} onChange={set('cta_text')} required />
      </Field>
      <Field
        label="Banner image URL"
        hint="Shown in the hero instead of the live catalog plate. Leave empty to keep the plate."
      >
        <input className="field" type="url" value={draft.banner_image_url} onChange={set('banner_image_url')} placeholder="https://…" />
      </Field>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={status === 'saving'} className="btn-primary px-5 py-2.5 text-sm">
          {status === 'saving' ? 'Saving…' : 'Save content'}
        </button>
        {status === 'saved' && (
          <span className="font-mono text-xs text-accent">Saved — live in every session.</span>
        )}
        {status === 'error' && (
          <span className="font-mono text-xs text-accent-2">Save failed — are you the admin?</span>
        )}
      </div>
    </form>
  )
}
