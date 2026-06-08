import { useContext } from 'react'
import { CartContext } from './cartContext'

export function useCart() {
  return useContext(CartContext)
}
