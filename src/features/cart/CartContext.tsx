import { useCallback } from 'react'
import useSWR from 'swr'
import { getCart } from '../../shared/api/woocommerce'
import { hasCartToken } from '../../shared/api/config'
import { CartContext } from './cartContext'

export { CartContext }

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Abonné à la clé 'cart' pour recevoir toutes les mises à jour (CartPage, addToCart…).
  // Mais ne lance un fetch au montage que si un token existe déjà (client de retour).
  // Un nouveau visiteur ne fait aucun appel réseau jusqu'à sa première interaction.
  const { data, mutate } = useSWR('cart', getCart, {
    revalidateOnMount: hasCartToken(),
  })

  const refresh = useCallback(() => { void mutate() }, [mutate])

  return (
    <CartContext.Provider value={{ itemCount: data?.items_count ?? 0, refresh }}>
      {children}
    </CartContext.Provider>
  )
}
