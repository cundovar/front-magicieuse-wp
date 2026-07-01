'use client'

import { SWRConfig } from 'swr'
import { CartProvider } from '@/features/cart/CartContext'
import { ThemeSync } from './theme-sync'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 5 * 60_000,
      }}
    >
      <CartProvider>
        <ThemeSync />
        {children}
      </CartProvider>
    </SWRConfig>
  )
}
