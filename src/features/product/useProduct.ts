import useSWR from 'swr'
import { getProductBySlug, type WooProduct } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'not-found' | 'error'

export function useProduct(slug: string | undefined) {
  const { data, error, isLoading } = useSWR<WooProduct | null>(
    slug ? ['product', slug] : null,
    ([, s]: [string, string]) => getProductBySlug(s),
  )

  const status: Status = isLoading
    ? 'loading'
    : error?.message?.includes('404')
      ? 'not-found'
      : error
        ? 'error'
        : data === null
          ? 'not-found'
          : 'success'

  return {
    status,
    product: data ?? null,
    error: error instanceof Error ? error.message : null,
  }
}
