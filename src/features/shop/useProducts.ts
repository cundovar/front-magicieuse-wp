import useSWR from 'swr'
import { getProducts, type WooProduct } from '../../shared/api/woocommerce'

type Status = 'loading' | 'success' | 'error'

export function useProducts() {
  const { data, error, isLoading } = useSWR<WooProduct[]>('products', () => getProducts())

  const status: Status = isLoading ? 'loading' : error ? 'error' : 'success'

  return {
    status,
    products: data ?? [],
    error: error instanceof Error ? error.message : error ? String(error) : null,
  }
}
