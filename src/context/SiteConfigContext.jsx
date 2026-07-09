import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { DEFAULTS } from '../config'

const SiteConfigContext = createContext(null)

const FALLBACK = {
  ...DEFAULTS,
  color_accent: '#4f8dff',
  color_accent_2: '#22d3ee',
  color_void: '#0a0c10',
  checkout_url: '',
}

export function SiteConfigProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)
  const [loaded, setLoaded] = useState(false)

  // Initial load + realtime subscription: any admin save UPDATEs the row and
  // Supabase pushes the new record to every open session — no reload needed.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true

    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (active && data) setSettings(data)
        if (active) setLoaded(true)
      })

    const channel = supabase
      .channel('site_settings_live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => setSettings(payload.new)
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  // Theme engine: push admin-chosen colors into the CSS variables that every
  // Tailwind token resolves to.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', settings.color_accent || FALLBACK.color_accent)
    root.style.setProperty('--accent2', settings.color_accent_2 || FALLBACK.color_accent_2)
    root.style.setProperty('--void', settings.color_void || FALLBACK.color_void)
    document.title = `${settings.site_name || 'SPECTRA'} — Laptops`
  }, [settings.color_accent, settings.color_accent_2, settings.color_void, settings.site_name])

  /** Admin-only (enforced by RLS). Returns { error }. */
  const saveSettings = useCallback(async (patch) => {
    const { error } = await supabase.from('site_settings').update(patch).eq('id', 1)
    return { error }
  }, [])

  return (
    <SiteConfigContext.Provider value={{ settings, loaded, saveSettings }}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export const useSiteConfig = () => useContext(SiteConfigContext)
