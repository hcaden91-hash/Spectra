import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import { RAM_BUCKETS, STORAGE_BUCKETS } from '../lib/format'

const EMPTY_FILTERS = {
  cats: [],
  brands: [],
  gpu: [],
  ram: [],
  storage: [],
  min: '',
  max: '',
  inStockOnly: false,
}

export default function Catalog() {
  const { products, loading, error } = useProducts()
  const [searchParams] = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState('featured')
  const [filters, setFilters] = useState(() => {
    const cat = searchParams.get('cat')
    return cat ? { ...EMPTY_FILTERS, cats: [cat] } : EMPTY_FILTERS
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b)),
    [products]
  )
  const brandCounts = useMemo(() => {
    const c = {}
    for (const p of products) c[p.brand] = (c[p.brand] ?? 0) + 1
    return c
  }, [products])
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 9999 }
    const prices = products.map((p) => Number(p.price))
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [products])

  const activeCount =
    filters.cats.length +
    filters.brands.length +
    filters.gpu.length +
    filters.ram.length +
    filters.storage.length +
    (filters.min !== '' ? 1 : 0) +
    (filters.max !== '' ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const min = filters.min === '' ? -Infinity : Number(filters.min)
    const max = filters.max === '' ? Infinity : Number(filters.max)
    const ramTests = RAM_BUCKETS.filter((b) => filters.ram.includes(b.label)).map((b) => b.test)
    const storageTests = STORAGE_BUCKETS.filter((b) => filters.storage.includes(b.label)).map(
      (b) => b.test
    )

    const filtered = products.filter((p) => {
      if (needle) {
        const haystack = `${p.brand} ${p.model} ${p.cpu} ${p.gpu} ${p.category}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (filters.cats.length && !filters.cats.includes(p.category)) return false
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false
      if (filters.gpu.length && !filters.gpu.includes(p.gpu_type)) return false
      if (ramTests.length && !ramTests.some((t) => t(p.ram_gb))) return false
      if (storageTests.length && !storageTests.some((t) => t(p.storage_gb))) return false
      const price = Number(p.price)
      if (price < min || price > max) return false
      if (filters.inStockOnly && !p.in_stock) return false
      return true
    })

    const sorted = [...filtered]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sort === 'name') sorted.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))
    return sorted
  }, [products, q, filters, sort])

  const clearAll = () => {
    setFilters(EMPTY_FILTERS)
    setQ('')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Catalog</p>
        <h1 className="font-display mt-1 text-3xl font-bold">The lineup</h1>
      </header>

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brand, model, CPU, GPU…"
            className="field !pl-9"
            aria-label="Search laptops"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="btn-ghost px-4 py-2.5 text-sm lg:hidden"
            aria-expanded={mobileFiltersOpen}
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="field w-auto"
            aria-label="Sort results"
          >
            <option value="featured">Featured first</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            brands={brands}
            brandCounts={brandCounts}
            priceBounds={priceBounds}
            onClear={clearAll}
            activeCount={activeCount}
          />
        </div>

        <div>
          <p className="mb-4 font-mono text-xs text-mist" role="status">
            {loading ? 'Loading catalog…' : `${results.length} of ${products.length} machines`}
          </p>

          {error && (
            <div className="glass mb-4 rounded-2xl p-4 text-sm text-mist">
              Couldn't load the catalog: <span className="text-fog">{error}</span>. Check that
              schema.sql has been run and your .env keys are correct.
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass h-72 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="font-display text-lg">No machines match those filters</p>
              <p className="mt-2 text-sm text-mist">Loosen a spec or two and try again.</p>
              <button onClick={clearAll} className="btn-ghost mt-4 px-4 py-2 text-sm">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
