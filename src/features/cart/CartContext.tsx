import { useCallback, useEffect, useState } from 'react'
import { getCart } from '../../shared/api/woocommerce'
import { CartContext } from './cartContext'

export { CartContext }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0)

  const refresh = useCallback(() => {
    getCart()
      .then((cart) => setItemCount(cart.items_count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    getCart()
      .then((cart) => setItemCount(cart.items_count))
      .catch(() => {})
  }, [])

  return (
    <CartContext.Provider value={{ itemCount, refresh }}>
      {children}
    </CartContext.Provider>
  )
}
