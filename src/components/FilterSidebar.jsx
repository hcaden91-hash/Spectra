import { CATEGORIES, GPU_TYPES, RAM_BUCKETS, STORAGE_BUCKETS } from '../lib/format'

function Section({ title, children }) {
  return (
    <fieldset className="hairline border-t pt-4">
      <legend className="mb-2 pr-3 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
        {title}
      </legend>
      <div className="flex flex-col gap-1.5">{children}</div>
    </fieldset>
  )
}

function Check({ label, checked, onChange, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fog">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer appearance-none rounded border border-line bg-transparent transition-colors checked:border-accent checked:bg-accent"
      />
      <span className="flex-1">{label}</span>
      {typeof count === 'number' && <span className="font-mono text-xs text-mist">{count}</span>}
    </label>
  )
}

const toggle = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

/**
 * Controlled filter rail. `filters` shape:
 * { cats: [], brands: [], gpu: [], ram: [], storage: [], min: '', max: '', inStockOnly: false }
 */
export default function FilterSidebar({ filters, setFilters, brands, brandCounts, priceBounds, onClear, activeCount }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  return (
    <aside className="glass flex flex-col gap-4 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em]">Filters</h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="font-mono text-xs text-accent hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <Section title="Purpose">
        {CATEGORIES.map((c) => (
          <Check
            key={c}
            label={c}
            checked={filters.cats.includes(c)}
            onChange={() => set({ cats: toggle(filters.cats, c) })}
          />
        ))}
      </Section>

      <Section title="Price (USD)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder={String(priceBounds.min)}
            value={filters.min}
            onChange={(e) => set({ min: e.target.value })}
            className="field"
            aria-label="Minimum price"
          />
          <span className="text-mist">–</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder={String(priceBounds.max)}
            value={filters.max}
            onChange={(e) => set({ max: e.target.value })}
            className="field"
            aria-label="Maximum price"
          />
        </div>
      </Section>

      <Section title="Brand">
        <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
          {brands.map((b) => (
            <Check
              key={b}
              label={b}
              count={brandCounts[b]}
              checked={filters.brands.includes(b)}
              onChange={() => set({ brands: toggle(filters.brands, b) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Memory">
        {RAM_BUCKETS.map((r) => (
          <Check
            key={r.label}
            label={r.label}
            checked={filters.ram.includes(r.label)}
            onChange={() => set({ ram: toggle(filters.ram, r.label) })}
          />
        ))}
      </Section>

      <Section title="Storage">
        {STORAGE_BUCKETS.map((s) => (
          <Check
            key={s.label}
            label={s.label}
            checked={filters.storage.includes(s.label)}
            onChange={() => set({ storage: toggle(filters.storage, s.label) })}
          />
        ))}
      </Section>

      <Section title="Graphics">
        {GPU_TYPES.map((g) => (
          <Check
            key={g}
            label={g === 'Integrated' ? 'Integrated' : `${g} discrete`}
            checked={filters.gpu.includes(g)}
            onChange={() => set({ gpu: toggle(filters.gpu, g) })}
          />
        ))}
      </Section>

      <Section title="Availability">
        <Check
          label="In stock only"
          checked={filters.inStockOnly}
          onChange={() => set({ inStockOnly: !filters.inStockOnly })}
        />
      </Section>
    </aside>
  )
}
