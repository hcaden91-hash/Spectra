import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let active = true

    supabase
      .from('products')
      .select('*')
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        else setProducts(data ?? [])
        setLoading(false)
      })

    // Live inventory: admin CRUD lands in every session the moment it commits.
    const channel = supabase
      .channel('products_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (p) =>
        setProducts((prev) =>
          prev.some((x) => x.id === p.new.id) ? prev : [...prev, p.new]
        )
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (p) =>
        setProducts((prev) => prev.map((x) => (x.id === p.new.id ? p.new : x)))
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, (p) =>
        setProducts((prev) => prev.filter((x) => x.id !== p.old.id))
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ProductsContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => useContext(ProductsContext)
