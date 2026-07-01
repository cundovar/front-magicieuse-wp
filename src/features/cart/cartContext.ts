'use client'

import { createContext } from 'react'

export type CartContextType = {
  itemCount: number
  refresh: () => void
}

export const CartContext = createContext<CartContextType>({
  itemCount: 0,
  refresh: () => {},
})
