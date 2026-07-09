import { useMemo, useState } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { supabase } from '../../lib/supabase'
import { money, storageLabel } from '../../lib/format'
import ProductFormModal from './ProductFormModal'

function Toggle({ on, onClick, label, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-40 ${
        on ? 'bg-accent' : 'bg-void'
      }`}
      style={{ border: '1px solid var(--line)' }}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-fog transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function InventoryTab() {
  const { products, loading } = useProducts()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | product
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = needle
      ? products.filter((p) => `${p.brand} ${p.model}`.toLowerCase().includes(needle))
      : products
    return [...list].sort((a, b) =>
      `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
    )
  }, [products, q])

  const patch = async (p, fields) => {
    setBusyId(p.id)
    setError('')
    const { error: err } = await supabase.from('products').update(fields).eq('id', p.id)
    if (err) setError(err.message)
    setBusyId(null)
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.brand} ${p.model}? This can't be undone.`)) return
    setBusyId(p.id)
    setError('')
    const { error: err } = await supabase.from('products').delete().eq('id', p.id)
    if (err) setError(err.message)
    setBusyId(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by brand or model…"
          className="field sm:max-w-xs"
          aria-label="Filter inventory"
        />
        <button onClick={() => setModal('new')} className="btn-primary px-4 py-2.5 text-sm">
          + Add laptop
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-line bg-void/40 px-4 py-2 text-sm text-accent-2">
          {error}
        </p>
      )}

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="hairline border-b font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
              <th className="px-4 py-3 font-medium">Machine</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Specs</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-mono text-xs text-mist">
                  Loading inventory…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-mono text-xs text-mist">
                  {q ? 'No machines match that filter.' : 'Inventory is empty — add a laptop or run the seed.'}
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="hairline border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-7 w-11 shrink-0 rounded-md"
                        style={{
                          background: `linear-gradient(145deg, ${p.gradient_from}, ${p.gradient_to})`,
                          border: '1px solid var(--line)',
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{p.brand}</p>
                        <p className="truncate">{p.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono">{money(p.price)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mist">
                    {p.ram_gb} GB · {storageLabel(p.storage_gb)} · {p.gpu_type}
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      on={p.in_stock}
                      busy={busyId === p.id}
                      onClick={() => patch(p, { in_stock: !p.in_stock })}
                      label={`Toggle stock for ${p.model}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      on={p.featured}
                      busy={busyId === p.id}
                      onClick={() => patch(p, { featured: !p.featured })}
                      label={`Toggle featured for ${p.model}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModal(p)} className="btn-ghost px-3 py-1.5 text-xs">
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        disabled={busyId === p.id}
                        className="btn-ghost px-3 py-1.5 text-xs hover:!border-accent-2/60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[11px] text-mist">
        {rows.length} shown · changes go live in every open session instantly.
      </p>

      {modal && (
        <ProductFormModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
