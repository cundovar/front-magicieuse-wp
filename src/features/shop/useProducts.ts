import { useEffect, useState } from 'react'
import { getProducts, type WooProduct } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'error'

export function useProducts() {
  const [status, setStatus] = useState<Status>('loading')
  const [products, setProducts] = useState<WooProduct[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getProducts()
        if (cancelled) return
        setProducts(data)
        setStatus('success')
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erreur API')
        setStatus('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { status, products, error }
}
