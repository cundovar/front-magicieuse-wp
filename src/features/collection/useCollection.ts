import { useEffect, useState } from 'react'
import { getCollection, type WpCollection } from '../../shared/api/wordpress'
import { getProductsByCategory, type WooProduct } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'not-found' | 'error'

export function useCollection(slug: string | undefined) {
  const [status, setStatus] = useState<Status>('loading')
  const [products, setProducts] = useState<WooProduct[]>([])
  const [collection, setCollection] = useState<WpCollection | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const collectionSlug = slug
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const [info, productList] = await Promise.all([
          getCollection(collectionSlug),
          getProductsByCategory(collectionSlug),
        ])
        if (cancelled) return
        setCollection(info)
        setProducts(productList)
        setStatus('success')
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Erreur API'
        if (message.includes('404')) {
          setStatus('not-found')
        } else {
          setError(message)
          setStatus('error')
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return { status, products, collection, error }
}
