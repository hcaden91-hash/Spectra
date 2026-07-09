import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSiteConfig } from '../context/SiteConfigContext'
import { money } from '../lib/format'
import { DEFAULT_CHECKOUT_URL } from '../config'

function QtyButton({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="btn-ghost h-7 w-7 rounded-md font-mono text-sm leading-none"
    >
      {children}
    </button>
  )
}

export default function CartDrawer() {
  const {
    lines, count, subtotal, tax, shipping, total,
    isOpen, closeCart, increment, decrement, removeItem, clearCart,
  } = useCart()
  const { settings } = useSiteConfig()

  // Lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, closeCart])

  const checkout = () => {
    // Admin-panel value wins; the config.js constant is the fallback.
    const url = settings.checkout_url?.trim() || DEFAULT_CHECKOUT_URL
    window.location.assign(url)
  }

  const taxPct = (Number(settings.tax_rate ?? 0.08) * 100).toFixed(2).replace(/\.?0+$/, '')
  const freeAt = Number(settings.free_shipping_threshold ?? 999)
  const toFree = Math.max(0, freeAt - subtotal)
  const hasOutOfStock = lines.some((l) => !l.in_stock)

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`glass fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col rounded-none border-y-0 border-r-0 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="hairline flex items-center justify-between border-b p-4">
          <h2 className="font-display text-lg font-semibold">
            Cart <span className="font-mono text-sm text-mist">({count})</span>
          </h2>
          <button onClick={closeCart} className="btn-ghost h-9 w-9 text-lg leading-none" aria-label="Close cart">
            ×
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="font-display text-lg">Your cart is empty</p>
            <p className="text-sm text-mist">Fifty machines are waiting to be measured up.</p>
            <Link to="/shop" onClick={closeCart} className="btn-primary mt-2 px-4 py-2 text-sm">
              Browse the lineup
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto p-4">
              {lines.map((line) => (
                <li key={line.id} className="hairline flex gap-3 border-b py-3 first:pt-0 last:border-b-0">
                  <div
                    className="lid h-12 w-20 shrink-0 rounded-lg"
                    style={{
                      background: `linear-gradient(145deg, ${line.gradient_from}, ${line.gradient_to})`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">{line.brand}</p>
                    <Link
                      to={`/product/${line.id}`}
                      onClick={closeCart}
                      className="block truncate text-sm font-medium hover:text-accent"
                    >
                      {line.model}
                    </Link>
                    {!line.in_stock && (
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-accent-2">
                        Now out of stock — remove to check out
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <QtyButton onClick={() => decrement(line.id)} label={`Decrease ${line.model} quantity`}>
                        −
                      </QtyButton>
                      <span className="w-6 text-center font-mono text-sm">{line.qty}</span>
                      <QtyButton onClick={() => increment(line.id)} label={`Increase ${line.model} quantity`}>
                        +
                      </QtyButton>
                      <button
                        onClick={() => removeItem(line.id)}
                        className="ml-auto font-mono text-xs text-mist transition-colors hover:text-fog"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-nowrap font-mono text-sm">{money(line.price * line.qty)}</div>
                </li>
              ))}
            </ul>

            <footer className="hairline border-t p-4">
              {toFree > 0 ? (
                <p className="mb-3 font-mono text-[11px] text-mist">
                  {money(toFree)} away from free shipping
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-void">
                    <span
                      className="block h-full bg-accent transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / freeAt) * 100)}%` }}
                    />
                  </span>
                </p>
              ) : (
                <p className="mb-3 font-mono text-[11px] text-accent-2">Free shipping unlocked</p>
              )}

              <dl className="space-y-1.5 font-mono text-sm">
                <div className="flex justify-between text-mist">
                  <dt>Subtotal</dt>
                  <dd className="text-fog">{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-mist">
                  <dt>Tax ({taxPct}%)</dt>
                  <dd className="text-fog">{money(tax)}</dd>
                </div>
                <div className="flex justify-between text-mist">
                  <dt>Shipping</dt>
                  <dd className="text-fog">{shipping === 0 ? 'Free' : money(shipping)}</dd>
                </div>
                <div className="hairline flex justify-between border-t pt-2 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold">{money(total)}</dd>
                </div>
              </dl>

              <button
                onClick={checkout}
                disabled={hasOutOfStock}
                className="btn-primary mt-4 w-full px-4 py-3 text-sm"
              >
                Proceed to checkout
              </button>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-mono text-[10px] text-mist">Redirects to the payment provider.</p>
                <button onClick={clearCart} className="font-mono text-[10px] text-mist hover:text-fog">
                  Clear cart
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
