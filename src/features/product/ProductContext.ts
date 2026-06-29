import { createContext, useContext } from 'react'
import type { WooProduct } from '../../shared/api/woocommerce'

export const ProductContext = createContext<WooProduct | null>(null)

export function useProductContext() {
  return useContext(ProductContext)
}
