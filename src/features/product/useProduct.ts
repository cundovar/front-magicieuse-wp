import { useEffect, useState } from 'react'
import { getProductBySlug, type WooProduct } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'not-found' | 'error'

export function useProduct(slug: string | undefined) {
  const [status, setStatus] = useState<Status>('loading')
  const [product, setProduct] = useState<WooProduct | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const productSlug = slug
    let cancelled = false

    async function load() {
      // setStatus a l'interieur de la fonction async, pas dans le corps direct de l'effet
      setStatus('loading')
      try {
        const data = await getProductBySlug(productSlug)
        if (cancelled) return
        if (!data) {
          setStatus('not-found')
        } else {
          setProduct(data)
          setStatus('success')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur API')
          setStatus('error')
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return { status, product, error }
}
