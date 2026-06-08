import useSWR from 'swr'
import { getCollection, type WpCollection } from '../../shared/api/wordpress'
import { getProductsByCategory, type WooProduct } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'not-found' | 'error'
type CollectionData = [WpCollection, WooProduct[]]

export function useCollection(slug: string | undefined) {
  const { data, error, isLoading } = useSWR<CollectionData>(
    slug ? ['collection', slug] : null,
    ([, s]: [string, string]) =>
      Promise.all([getCollection(s), getProductsByCategory(s)]),
  )

  const status: Status = isLoading
    ? 'loading'
    : error?.message?.includes('404')
      ? 'not-found'
      : error
        ? 'error'
        : 'success'

  return {
    status,
    collection: data?.[0] ?? null,
    products: data?.[1] ?? [],
    error: error instanceof Error ? error.message : null,
  }
}
