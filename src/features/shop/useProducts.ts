import useSWR from 'swr'
import { getProducts, type WooProduct, type ProductQueryParams } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'error'

function buildKey(filters?: ProductQueryParams): string {
  if (!filters || Object.keys(filters).length === 0) return 'products'
  return `products|${[
    filters.category ?? '',
    filters.minPrice ?? '',
    filters.maxPrice ?? '',
    filters.orderby ?? '',
    filters.order ?? '',
  ].join('|')}`
}

export function useProducts(filters?: ProductQueryParams) {
  const key = buildKey(filters)
  const { data, error, isLoading } = useSWR<WooProduct[]>(key, () => getProducts(filters))

  const status: Status = isLoading ? 'loading' : error ? 'error' : 'success'

  return {
    status,
    products: data ?? [],
    error: error instanceof Error ? error.message : error ? String(error) : null,
  }
}
