import { useState } from 'react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import {
  getCart,
  removeFromCart,
  updateCartItem,
  type WooCart,
} from '../../shared/api/woocommerce'
import { getPageBlocks, type WpBlock } from '../../shared/api/wordpress'
import { formatWooPrice } from '../../shared/utils/price'
import { getWooUrl } from '../../shared/utils/wooUrl'
import { LoadingState } from '../../shared/components/LoadingState/LoadingState'
import SmartImage from '../../shared/components/SmartImage/SmartImage'
import { ButtonLink, SmartButtonLink } from '../../shared/components/Button'
import WpStructuredContent from '../../shared/components/WpBlocks/WpStructuredContent'
import './CartPage.scss'

type Status = 'loading' | 'success' | 'error'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
const slugCheckout = import.meta.env.VITE_SLUG_CHECKOUT || 'commande'
const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'

function fmtPrice(cart: WooCart, amount: string) {
  return formatWooPrice(amount, cart.totals.currency_minor_unit, cart.totals.currency_code)
}

export default function CartPage() {
  const { data: cart, error, mutate: mutateCart } = useSWR<WooCart>('cart', getCart)
  const { data: pageBlocks } = useSWR(`page-blocks-${slugCart}`, () => getPageBlocks(slugCart))
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const status: Status = cart !== undefined ? 'success' : error ? 'error' : 'loading'
  const errorMessage = error instanceof Error ? error.message : 'Erreur API'

  async function handleRemove(key: string) {
    setBusyKey(key)
    try {
      const updated = await removeFromCart(key)
      void mutateCart(updated, { revalidate: false })
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
      const updated = await updateCartItem(key, quantity)
      void mutateCart(updated, { revalidate: false })
    } catch {
      // silent
    } finally {
      setBusyKey(null)
    }
  }

  const isEmpty = cart?.items.length === 0
  const reusableBlocks = pageBlocks?.blocks.filter((block: WpBlock) => block.blockName === 'core/block') ?? []

  return (
    <main className="cart-page">
      <div className="cart-page__wrap">
        <span className="cart-page__surtitre" aria-hidden="true">Mon panier</span>
        <h1>Votre sélection</h1>

        {status === 'loading' && <LoadingState message="Chargement du panier..." />}
        {status === 'error' && <p role="alert">Erreur : {errorMessage}</p>}

        {status === 'success' && cart && cart.errors.length > 0 && (
          <ul className="cart-page__errors">
            {cart.errors.map((err, i) => (
              <li
                key={i}
                className="cart-error"
                role="alert"
                dangerouslySetInnerHTML={{ __html: err.message }}
              />
            ))}
          </ul>
        )}

        {status === 'success' && isEmpty && (
          <div className="cart-page__empty">
            <span className="cart-page__tampon" aria-hidden="true">
            <ShoppingBag size={32} strokeWidth={1.5} />
          </span>
            <h2>Rien à lire pour l'instant</h2>
            <p>Ajoutez un livre depuis le catalogue pour démarrer votre commande.</p>
            <ButtonLink to={`/${slugShop}/`}>
              Voir la boutique
            </ButtonLink>
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
                      <SmartImage
                        className="cart-item__image"
                        src={item.images[0].thumbnail || item.images[0].src}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
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
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span className="cart-item__qty-value">{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => handleQuantity(item.key, item.quantity + 1)}
                        disabled={isBusy}
                        aria-label="Augmenter la quantite"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => handleRemove(item.key)}
                      disabled={isBusy}
                      aria-label={`Supprimer ${item.name}`}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <aside className="cart-page__summary">
              <h2>Résumé</h2>

              {cart.coupons.length > 0 && (
                <ul className="cart-page__coupons">
                  {cart.coupons.map((coupon) => (
                    <li key={coupon.code} className="cart-coupon">
                      <span className="cart-coupon__code">{coupon.code}</span>
                      <span className="cart-coupon__discount">
                        −{formatWooPrice(
                          coupon.totals.total_discount,
                          coupon.totals.currency_minor_unit,
                          coupon.totals.currency_code,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="cart-summary__lines">
                <div className="cart-summary__line">
                  <span>Sous-total</span>
                  <span>{fmtPrice(cart, cart.totals.total_items)}</span>
                </div>

                {parseInt(cart.totals.total_discount) > 0 && (
                  <div className="cart-summary__line cart-summary__line--discount">
                    <span>Remise</span>
                    <span>−{fmtPrice(cart, cart.totals.total_discount)}</span>
                  </div>
                )}

                {parseInt(cart.totals.total_tax) > 0 && (
                  <div className="cart-summary__line">
                    <span>TVA</span>
                    <span>{fmtPrice(cart, cart.totals.total_tax)}</span>
                  </div>
                )}

              </div>

              <div className="cart-summary__row">
                <span>Total estimé</span>
                <strong>{fmtPrice(cart, String(
                  parseInt(cart.totals.total_items) -
                  parseInt(cart.totals.total_discount) +
                  parseInt(cart.totals.total_tax)
                ))}</strong>
              </div>

              <SmartButtonLink
                href={getWooUrl(`/${slugCheckout}/`)}
                className="cart-page__checkout"
                size="lg"
                fullWidth
              >
                Passer commande
              </SmartButtonLink>
              <p className="cart-page__mention">Frais de livraison calculés à l'étape suivante</p>
              <p className="cart-page__mention">paiement sécurisé, promis ✶</p>
              <Link to={`/${slugShop}/`} className="cart-page__continue">
                Continuer les achats
              </Link>
            </aside>
          </div>
        )}

        {reusableBlocks.length > 0 && (
          <div className="cart-page__gutenberg">
            <WpStructuredContent blocks={reusableBlocks} />
          </div>
        )}
      </div>
    </main>
  )
}
