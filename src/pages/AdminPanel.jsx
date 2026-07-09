import { useState } from 'react'
import { useSiteConfig } from '../context/SiteConfigContext'
import OverviewTab from '../components/admin/OverviewTab'
import InventoryTab from '../components/admin/InventoryTab'
import ContentTab from '../components/admin/ContentTab'
import ThemeTab from '../components/admin/ThemeTab'
import SystemTab from '../components/admin/SystemTab'

const TABS = [
  { id: 'overview', label: 'Overview', component: OverviewTab },
  { id: 'inventory', label: 'Inventory', component: InventoryTab },
  { id: 'content', label: 'Content', component: ContentTab },
  { id: 'theme', label: 'Theme', component: ThemeTab },
  { id: 'system', label: 'System', component: SystemTab },
]

export default function AdminPanel() {
  const { settings } = useSiteConfig()
  const [active, setActive] = useState('overview')
  const ActiveComponent = TABS.find((t) => t.id === active).component

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">Portal</p>
        <h1 className="font-display mt-1 text-3xl font-bold">{settings.site_name} control room</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          Every save here writes straight to the database and broadcasts over realtime — open the
          storefront in a second tab and watch edits land without a reload.
        </p>
      </header>

      <nav className="hairline mb-8 flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
              active === t.id
                ? 'border-accent text-fog'
                : 'border-transparent text-mist hover:text-fog'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <ActiveComponent />
    </div>
  )
}
