import { Link } from 'react-router-dom'
import { useSiteConfig } from '../context/SiteConfigContext'

export default function Footer() {
  const { settings } = useSiteConfig()
  return (
    <footer className="hairline mt-20 border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 font-mono text-xs text-mist sm:flex-row sm:items-center sm:px-6">
        <p>
          © 2026 {settings.site_name} · Every machine ships spec-verified.
        </p>
        <nav className="flex gap-6">
          <Link to="/" className="transition-colors hover:text-fog">Home</Link>
          <Link to="/shop" className="transition-colors hover:text-fog">Shop</Link>
        </nav>
      </div>
    </footer>
  )
}
