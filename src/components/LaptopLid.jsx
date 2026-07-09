/**
 * Generated "anodized lid" artwork used everywhere a product appears.
 * Keeps the catalog fully self-contained (no external photo dependencies);
 * admins can attach a real image per product via image_url, which wins.
 */
export default function LaptopLid({ product, className = '', label = true }) {
  if (product?.image_url) {
    return (
      <div className={`lid ${className}`}>
        <img
          src={product.image_url}
          alt={`${product.brand} ${product.model}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  const from = product?.gradient_from || '#2b2f3d'
  const to = product?.gradient_to || '#0e1017'

  return (
    <div
      className={`lid ${className}`}
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
      role="img"
      aria-label={`${product?.brand ?? ''} ${product?.model ?? ''}`.trim()}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -18px 30px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      />
      {label && (
        <span
          className="font-display absolute inset-0 flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.4em]"
          style={{ color: 'rgba(255,255,255,0.62)', textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
        >
          {product?.brand}
        </span>
      )}
      <div
        className="absolute bottom-0 left-1/2 h-[3px] w-1/3 -translate-x-1/2 rounded-t-sm"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      />
    </div>
  )
}
