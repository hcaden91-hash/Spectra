import { useMemo } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { money } from '../../lib/format'

function Stat({ label, value }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">{label}</p>
      <p className="font-display mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default function OverviewTab() {
  const { products } = useProducts()

  const stats = useMemo(() => {
    if (products.length === 0) return null
    const prices = products.map((p) => Number(p.price))
    return {
      total: products.length,
      inStock: products.filter((p) => p.in_stock).length,
      outOfStock: products.filter((p) => !p.in_stock).length,
      featured: products.filter((p) => p.featured).length,
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      brands: new Set(products.map((p) => p.brand)).size,
    }
  }, [products])

  const recent = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5),
    [products]
  )

  if (!stats) {
    return (
      <div className="glass rounded-2xl p-8 text-sm text-mist">
        The catalog is empty. Seed it with <code className="font-mono text-fog">npm run seed</code>{' '}
        or paste <code className="font-mono text-fog">supabase/seed.sql</code> into the Supabase SQL
        Editor, then add or edit machines from the Inventory tab.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Models" value={stats.total} />
        <Stat label="In stock" value={stats.inStock} />
        <Stat label="Out of stock" value={stats.outOfStock} />
        <Stat label="Featured" value={stats.featured} />
        <Stat label="Brands" value={stats.brands} />
        <Stat label="Avg price" value={money(stats.avg)} />
      </div>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Recently updated</h2>
        <div className="glass overflow-hidden rounded-2xl">
          {recent.map((p) => (
            <div
              key={p.id}
              className="hairline flex items-center justify-between gap-4 border-b px-5 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">
                  <span className="font-mono text-xs text-mist">{p.brand}</span> {p.model}
                </p>
              </div>
              <p className="whitespace-nowrap font-mono text-xs text-mist">
                {new Date(p.updated_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
