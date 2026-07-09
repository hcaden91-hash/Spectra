import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSiteConfig } from '../context/SiteConfigContext'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'
import { money, CATEGORIES } from '../lib/format'

export default function Home() {
  const { settings } = useSiteConfig()
  const { products, loading } = useProducts()

  const stats = useMemo(() => {
    if (products.length === 0) return null
    const prices = products.map((p) => Number(p.price))
    const flagship = [...products].sort((a, b) => b.price - a.price)[0]
    return {
      models: products.length,
      brands: new Set(products.map((p) => p.brand)).size,
      inStock: products.filter((p) => p.in_stock).length,
      span: `${money(Math.min(...prices))} – ${money(Math.max(...prices))}`,
      flagship: flagship ? `${flagship.brand} ${flagship.model}` : '—',
    }
  }, [products])

  const featured = useMemo(
    () => products.filter((p) => p.featured).slice(0, 8),
    [products]
  )

  const catCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
    for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1
    return counts
  }, [products])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ── Hero ── */}
      <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div className="rise">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            Spec-first laptop outfitter
          </p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            {settings.hero_title}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-mist">
            {settings.hero_subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/shop" className="btn-primary px-6 py-3 text-sm">
              {settings.cta_text}
            </Link>
            <Link to="/shop?cat=Gaming" className="btn-ghost px-6 py-3 text-sm">
              Gaming rigs
            </Link>
          </div>
        </div>

        <div className="rise" style={{ animationDelay: '120ms' }}>
          {settings.banner_image_url?.trim() ? (
            <img
              src={settings.banner_image_url}
              alt="Store banner"
              className="hairline w-full rounded-2xl border object-cover"
            />
          ) : (
            <div className="glass overflow-hidden rounded-2xl">
              <p className="px-5 pb-2 pt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-mist">
                Catalog · live
              </p>
              <div className="spec-plate !text-[0.8rem]">
                <div>
                  Models <b>{stats ? stats.models : '—'}</b>
                </div>
                <div>
                  Brands <b>{stats ? stats.brands : '—'}</b>
                </div>
                <div>
                  In stock <b>{stats ? stats.inStock : '—'}</b>
                </div>
                <div>
                  Price span <b>{stats ? stats.span : '—'}</b>
                </div>
                <div>
                  Silicon <b>Intel · AMD · Apple · Qualcomm</b>
                </div>
                <div>
                  Flagship <b title={stats?.flagship}>{stats ? stats.flagship : '—'}</b>
                </div>
              </div>
              <p className="px-5 py-3 font-mono text-[10px] text-mist">
                Figures update in real time as inventory changes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Purpose tiles ── */}
      <section aria-label="Shop by purpose" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            to={`/shop?cat=${encodeURIComponent(c)}`}
            className="glass group rounded-2xl p-5 transition-colors hover:border-accent/40"
          >
            <p className="font-display text-lg font-semibold group-hover:text-accent">{c}</p>
            <p className="mt-1 font-mono text-xs text-mist">
              {catCounts[c]} machine{catCounts[c] === 1 ? '' : 's'}
            </p>
          </Link>
        ))}
      </section>

      {/* ── Featured ── */}
      <section className="py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Curated</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">Featured machines</h2>
          </div>
          <Link to="/shop" className="font-mono text-xs text-accent hover:underline">
            View all {products.length || ''} →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass h-72 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-mist">
            No featured machines yet — the catalog may not be seeded. Run{' '}
            <code className="font-mono text-fog">npm run seed</code> or paste{' '}
            <code className="font-mono text-fog">supabase/seed.sql</code> into the SQL Editor.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
