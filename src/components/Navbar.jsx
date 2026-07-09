import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSiteConfig } from '../context/SiteConfigContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ADMIN_ROUTE } from '../config'

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${isActive ? 'text-fog' : 'text-mist hover:text-fog'}`

export default function Navbar() {
  const { settings } = useSiteConfig()
  const { user, isAdmin, signOut } = useAuth()
  const { count, openCart } = useCart()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40">
      {settings.announcement?.trim() && (
        <div
          className="px-4 py-1.5 text-center font-mono text-[11px] tracking-wide"
          style={{
            background: 'color-mix(in srgb, var(--accent) 16%, var(--void))',
            color: 'color-mix(in srgb, var(--accent) 70%, var(--fog))',
          }}
        >
          {settings.announcement}
        </div>
      )}

      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label={`${settings.site_name} home`}>
            <svg viewBox="0 0 100 100" className="h-7 w-7" aria-hidden="true">
              <rect width="100" height="100" rx="22" fill="var(--panel)" stroke="var(--line)" />
              <path
                d="M28 64 L50 30 L72 64"
                stroke="var(--accent)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-lg font-semibold tracking-[0.18em]">
              {settings.site_name}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {isAdmin && (
              <Link
                to={ADMIN_ROUTE}
                title="Portal"
                aria-label="Admin portal"
                className="btn-ghost flex h-9 w-9 items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
                </svg>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden max-w-[160px] truncate font-mono text-xs text-mist md:inline" title={user.email}>
                  {user.email}
                </span>
                <button onClick={handleSignOut} className="btn-ghost px-3 py-2 text-sm">
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-ghost px-3 py-2 text-sm">
                Sign in
              </Link>
            )}

            <button
              onClick={openCart}
              className="btn-primary relative flex items-center gap-2 px-3.5 py-2 text-sm"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Cart
              {count > 0 && (
                <span className="rounded-full bg-void/25 px-1.5 font-mono text-xs">{count}</span>
              )}
            </button>
          </div>
        </div>

        <nav className="hairline flex items-center gap-6 border-t px-4 py-2 sm:hidden">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
