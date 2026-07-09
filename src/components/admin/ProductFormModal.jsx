import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, GPU_TYPES } from '../../lib/format'
import LaptopLid from '../LaptopLid'

const BLANK = {
  brand: '',
  model: '',
  price: '',
  category: 'Everyday',
  cpu: '',
  gpu: '',
  gpu_type: 'Integrated',
  ram_gb: '',
  storage_gb: '',
  display: '',
  battery: '',
  gradient_from: '#2b2f3d',
  gradient_to: '#0e1017',
  image_url: '',
  featured: false,
  in_stock: true,
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-mono text-[10px] text-mist">{hint}</span>}
    </label>
  )
}

export default function ProductFormModal({ product, onClose }) {
  const editing = Boolean(product)
  const [form, setForm] = useState(() =>
    editing
      ? {
          ...product,
          price: String(product.price),
          ram_gb: String(product.ram_gb),
          storage_gb: String(product.storage_gb),
          image_url: product.image_url ?? '',
        }
      : BLANK
  )
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const price = Number(form.price)
    const ram = parseInt(form.ram_gb, 10)
    const storage = parseInt(form.storage_gb, 10)

    for (const [field, label] of [
      ['brand', 'Brand'], ['model', 'Model'], ['cpu', 'CPU'], ['gpu', 'GPU'],
      ['display', 'Display'], ['battery', 'Battery'],
    ]) {
      if (!String(form[field]).trim()) {
        setError(`${label} is required.`)
        return
      }
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Price must be a positive number.')
      return
    }
    if (!Number.isInteger(ram) || ram <= 0 || !Number.isInteger(storage) || storage <= 0) {
      setError('RAM and storage must be positive whole numbers (in GB).')
      return
    }

    const row = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      price,
      category: form.category,
      cpu: form.cpu.trim(),
      gpu: form.gpu.trim(),
      gpu_type: form.gpu_type,
      ram_gb: ram,
      storage_gb: storage,
      display: form.display.trim(),
      battery: form.battery.trim(),
      gradient_from: form.gradient_from,
      gradient_to: form.gradient_to,
      image_url: form.image_url.trim() || null,
      featured: form.featured,
      in_stock: form.in_stock,
    }

    setPending(true)
    const query = editing
      ? supabase.from('products').update(row).eq('id', product.id)
      : supabase.from('products').insert(row)
    const { error: err } = await query
    setPending(false)

    if (err) {
      setError(
        err.code === '23505'
          ? 'A laptop with this brand and model already exists.'
          : err.message
      )
      return
    }
    // Realtime pushes the change into every session, including this one.
    onClose()
  }

  const preview = {
    brand: form.brand || 'Brand',
    model: form.model || 'Model',
    gradient_from: form.gradient_from,
    gradient_to: form.gradient_to,
    image_url: form.image_url.trim() || null,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? 'Edit laptop' : 'Add laptop'}
        className="glass w-full max-w-2xl rounded-2xl p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {editing ? `Edit — ${product.brand} ${product.model}` : 'Add a laptop'}
          </h2>
          <button onClick={onClose} className="btn-ghost h-9 w-9 text-lg leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <input className="field" value={form.brand} onChange={set('brand')} placeholder="ASUS" />
          </Field>
          <Field label="Model">
            <input className="field" value={form.model} onChange={set('model')} placeholder="ROG Zephyrus G14 (2025)" />
          </Field>
          <Field label="Price (USD)">
            <input className="field" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="2499" />
          </Field>
          <Field label="Purpose">
            <select className="field" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="CPU">
            <input className="field" value={form.cpu} onChange={set('cpu')} placeholder="AMD Ryzen AI 9 HX 370" />
          </Field>
          <Field label="GPU">
            <input className="field" value={form.gpu} onChange={set('gpu')} placeholder="NVIDIA GeForce RTX 5070 Ti 12GB" />
          </Field>
          <Field label="GPU type">
            <select className="field" value={form.gpu_type} onChange={set('gpu_type')}>
              {GPU_TYPES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="RAM (GB)">
            <input className="field" type="number" min="1" value={form.ram_gb} onChange={set('ram_gb')} placeholder="32" />
          </Field>
          <Field label="Storage (GB)" hint="Use 1024 for 1 TB, 2048 for 2 TB.">
            <input className="field" type="number" min="1" value={form.storage_gb} onChange={set('storage_gb')} placeholder="1024" />
          </Field>
          <Field label="Display">
            <input className="field" value={form.display} onChange={set('display')} placeholder='14" 3K OLED 2880×1800 120Hz' />
          </Field>
          <Field label="Battery">
            <input className="field" value={form.battery} onChange={set('battery')} placeholder="Up to 10 hr" />
          </Field>
          <Field label="Image URL (optional)" hint="Overrides the generated lid artwork.">
            <input className="field" type="url" value={form.image_url} onChange={set('image_url')} placeholder="https://…" />
          </Field>

          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-[1fr_1fr_180px]">
            <Field label="Lid gradient — from">
              <div className="flex items-center gap-2">
                <input type="color" value={form.gradient_from} onChange={set('gradient_from')} className="h-9 w-12 cursor-pointer rounded border border-line bg-transparent" aria-label="Gradient start color" />
                <input className="field font-mono" value={form.gradient_from} onChange={set('gradient_from')} />
              </div>
            </Field>
            <Field label="Lid gradient — to">
              <div className="flex items-center gap-2">
                <input type="color" value={form.gradient_to} onChange={set('gradient_to')} className="h-9 w-12 cursor-pointer rounded border border-line bg-transparent" aria-label="Gradient end color" />
                <input className="field font-mono" value={form.gradient_to} onChange={set('gradient_to')} />
              </div>
            </Field>
            <div>
              <span className="mb-1.5 block font-mono text-xs text-mist">Preview</span>
              <div className="group">
                <LaptopLid product={preview} className="aspect-[16/10] w-full rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={form.in_stock} onChange={set('in_stock')} className="h-4 w-4 appearance-none rounded border border-line checked:border-accent checked:bg-accent" />
              In stock
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={set('featured')} className="h-4 w-4 appearance-none rounded border border-line checked:border-accent checked:bg-accent" />
              Featured on homepage
            </label>
          </div>

          {error && <p className="text-sm text-accent-2 sm:col-span-2">{error}</p>}

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-ghost px-4 py-2.5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 text-sm">
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Add laptop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
