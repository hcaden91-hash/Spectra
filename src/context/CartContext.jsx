import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { CART_STORAGE_KEY } from '../config'
import { useProducts } from './ProductsContext'
import { useSiteConfig } from './SiteConfigContext'

const CartContext = createContext(null)

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.id && i.qty > 0) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  // items: [{ id, qty, snapshot: { brand, model, price } }]
  // The snapshot keeps the drawer rendering if a product is deleted mid-session;
  // live catalog data (price, stock) always wins when available.
  const [items, setItems] = useState(readStoredCart)
  const [isOpen, setIsOpen] = useState(false)
  const { products } = useProducts()
  const { settings } = useSiteConfig()

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [
        ...prev,
        {
          id: product.id,
          qty: 1,
          snapshot: { brand: product.brand, model: product.model, price: product.price },
        },
      ]
    })
    setIsOpen(true)
  }, [])

  const increment = useCallback((id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i)))
  }, [])

  const decrement = useCallback((id) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    )
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  // Resolve each line against the live catalog, then price the order using
  // the admin-controlled tax/shipping settings (all realtime).
  const { lines, count, subtotal, tax, shipping, total } = useMemo(() => {
    const resolved = items.map((item) => {
      const live = products.find((p) => p.id === item.id)
      return {
        ...item,
        brand: live?.brand ?? item.snapshot.brand,
        model: live?.model ?? item.snapshot.model,
        price: Number(live?.price ?? item.snapshot.price),
        in_stock: live ? live.in_stock : true,
        gradient_from: live?.gradient_from ?? '#2b2f3d',
        gradient_to: live?.gradient_to ?? '#0e1017',
      }
    })
    const sub = resolved.reduce((sum, l) => sum + l.price * l.qty, 0)
    const taxRate = Number(settings.tax_rate ?? 0.08)
    const flat = Number(settings.shipping_flat ?? 19)
    const freeAt = Number(settings.free_shipping_threshold ?? 999)
    const ship = resolved.length === 0 || sub >= freeAt ? 0 : flat
    const taxAmt = sub * taxRate
    return {
      lines: resolved,
      count: resolved.reduce((n, l) => n + l.qty, 0),
      subtotal: sub,
      tax: taxAmt,
      shipping: ship,
      total: sub + taxAmt + ship,
    }
  }, [items, products, settings.tax_rate, settings.shipping_flat, settings.free_shipping_threshold])

  const value = {
    lines,
    count,
    subtotal,
    tax,
    shipping,
    total,
    isOpen,
    openCart,
    closeCart,
    addItem,
    increment,
    decrement,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
