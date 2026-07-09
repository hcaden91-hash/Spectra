import { Link, useParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import LaptopLid from '../components/LaptopLid'
import { money, storageLabel } from '../lib/format'

function SpecRow({ name, value }) {
  return (
    <div className="hairline grid grid-cols-[110px_1fr] gap-4 border-b py-3 last:border-b-0">
      <dt className="font-mono text-xs uppercase tracking-[0.2em] text-mist">{name}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { addItem, lines } = useCart()

  const product = products.find((p) => p.id === id)
  const inCart = lines.find((l) => l.id === id)?.qty ?? 0

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="glass h-96 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Not found</p>
        <h1 className="font-display mt-3 text-2xl font-semibold">That machine isn't in the catalog</h1>
        <p className="mt-2 text-sm text-mist">It may have been removed by the store admin.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-block px-5 py-2.5 text-sm">
          Back to the lineup
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/shop" className="font-mono text-xs text-mist transition-colors hover:text-fog">
        ← Back to the lineup
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="group">
          <LaptopLid product={product} className="aspect-[16/10] w-full rounded-2xl" />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">{product.brand}</p>
            <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">
              {product.category}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                product.in_stock ? 'bg-accent/15 text-accent' : 'bg-void text-mist'
              }`}
            >
              {product.in_stock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <h1 className="font-display mt-2 text-3xl font-bold leading-tight">{product.model}</h1>
          <p className="mt-3 font-mono text-2xl">{money(product.price)}</p>

          <dl className="glass mt-6 rounded-2xl px-5 py-2">
            <SpecRow name="Processor" value={product.cpu} />
            <SpecRow name="Graphics" value={product.gpu} />
            <SpecRow name="Memory" value={`${product.ram_gb} GB`} />
            <SpecRow name="Storage" value={`${storageLabel(product.storage_gb)} SSD`} />
            <SpecRow name="Display" value={product.display} />
            <SpecRow name="Battery" value={product.battery} />
          </dl>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => addItem(product)}
              disabled={!product.in_stock}
              className="btn-primary px-6 py-3 text-sm"
            >
              {product.in_stock ? 'Add to cart' : 'Out of stock'}
            </button>
            {inCart > 0 && (
              <span className="font-mono text-xs text-mist">
                {inCart} in cart
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
