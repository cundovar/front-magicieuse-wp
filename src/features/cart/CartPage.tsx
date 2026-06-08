import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCart,
  removeFromCart,
  updateCartItem,
  type WooCart,
} from '../../shared/api/woocommerce'
import { useCart } from './useCart'
import { formatWooPrice } from '../../shared/utils/price'
import { getWooUrl } from '../../shared/utils/wooUrl'
import './CartPage.scss'

type Status = 'loading' | 'success' | 'error'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'

export default function CartPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [cart, setCart] = useState<WooCart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const { refresh: refreshCount } = useCart()

  // setState uniquement dans les callbacks .then()/.catch(), pas de facon synchrone
  useEffect(() => {
    getCart()
      .then((data) => {
        setCart(data)
        setStatus('success')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur API')
        setStatus('error')
      })
  }, [])

  async function handleRemove(key: string) {
    setBusyKey(key)
    try {
      setCart(await removeFromCart(key))
      refreshCount()
    } catch {
      // silent
    } finally {
      setBusyKey(null)
    }
  }

  async function handleQuantity(key: string, quantity: number) {
    if (quantity < 1) {
      await handleRemove(key)
      return
    }
    setBusyKey(key)
    try {
      setCart(await updateCartItem(key, quantity))
      refreshCount()
    } catch {
      // silent
    } finally {
      setBusyKey(null)
    }
  }

  const isEmpty = cart?.items.length === 0

  return (
    <main className="cart-page">
      <h1>Panier</h1>

      {status === 'loading' && <p>Chargement du panier...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}

      {status === 'success' && isEmpty && (
        <div className="cart-page__empty">
          <p>Votre panier est vide.</p>
          <Link to={`/${slugShop}/`} className="btn-primary">
            Voir la boutique
          </Link>
        </div>
      )}

      {status === 'success' && cart && !isEmpty && (
        <div className="cart-page__layout">
          <ul className="cart-page__items">
            {cart.items.map((item) => {
              const slug =
                item.permalink?.match(new RegExp(`/${slugProduct}/([^/]+)/?`))?.[1] ??
                String(item.id)
              const isBusy = busyKey === item.key

              return (
                <li key={item.key} className={`cart-item${isBusy ? ' cart-item--busy' : ''}`}>
                  {item.images[0] && (
                    <img
                      className="cart-item__image"
                      src={item.images[0].thumbnail || item.images[0].src}
                      alt={item.name}
                    />
                  )}
                  <div className="cart-item__info">
                    <Link to={`/${slugProduct}/${slug}/`} className="cart-item__name">
                      {item.name}
                    </Link>
                    <p className="cart-item__unit-price">
                      {formatWooPrice(
                        item.prices.price,
                        item.prices.currency_minor_unit,
                        item.prices.currency_code,
                      )}
                    </p>
                  </div>
                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => handleQuantity(item.key, item.quantity - 1)}
                      disabled={isBusy}
                      aria-label="Diminuer la quantite"
                    >
                      −
                    </button>
                    <span className="cart-item__qty-value">{item.quantity}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => handleQuantity(item.key, item.quantity + 1)}
                      disabled={isBusy}
                      aria-label="Augmenter la quantite"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item.key)}
                    disabled={isBusy}
                    aria-label={`Supprimer ${item.name}`}
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>

          <aside className="cart-page__summary">
            <h2>Recapitulatif</h2>
            <div className="cart-summary__row">
              <span>Total</span>
              <strong>
                {formatWooPrice(
                  cart.totals.total_price,
                  cart.totals.currency_minor_unit,
                  cart.totals.currency_code,
                )}
              </strong>
            </div>
            <a href={getWooUrl('/checkout/')} className="btn-primary cart-page__checkout">
              Passer commande
            </a>
            <Link to={`/${slugShop}/`} className="cart-page__continue">
              Continuer les achats
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}
