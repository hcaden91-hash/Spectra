import { Link } from 'react-router-dom'
import LaptopLid from './LaptopLid'
import { useCart } from '../context/CartContext'
import { money, storageLabel } from '../lib/format'

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()

  return (
    <article
      className="group glass rise flex flex-col overflow-hidden rounded-2xl"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <Link to={`/product/${product.id}`} className="relative block">
        <LaptopLid product={product} className="aspect-[16/10] w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-void/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fog backdrop-blur">
          {product.category}
        </span>
        {!product.in_stock && (
          <span className="absolute right-3 top-3 rounded-full bg-void/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-mist backdrop-blur">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">{product.brand}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <Link
            to={`/product/${product.id}`}
            className="font-display text-[15px] font-semibold leading-snug transition-colors hover:text-accent"
          >
            {product.model}
          </Link>
          <span className="whitespace-nowrap font-mono text-sm text-fog">{money(product.price)}</span>
        </div>
      </div>

      <div className="spec-plate">
        <div>
          CPU <b title={product.cpu}>{product.cpu}</b>
        </div>
        <div>
          GPU <b title={product.gpu}>{product.gpu}</b>
        </div>
        <div>
          RAM <b>{product.ram_gb} GB</b>
        </div>
        <div>
          SSD <b>{storageLabel(product.storage_gb)}</b>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => addItem(product)}
          disabled={!product.in_stock}
          className="btn-primary flex-1 px-3 py-2 text-sm"
        >
          {product.in_stock ? 'Add to cart' : 'Out of stock'}
        </button>
        <Link to={`/product/${product.id}`} className="btn-ghost px-3 py-2 text-sm">
          Specs
        </Link>
      </div>
    </article>
  )
}
