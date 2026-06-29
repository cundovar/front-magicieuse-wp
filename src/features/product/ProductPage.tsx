import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import useSWR from 'swr'
import { Minus, Plus } from 'lucide-react'
import { addToCart } from '../../shared/api/woocommerce'
import { getProductBrands, getPageBlocks } from '../../shared/api/wordpress'
import { useCart } from '../cart/useCart'
import { useProduct } from './useProduct'
import ProductPrice from '../../shared/components/ProductPrice/ProductPrice'
import { LoadingState } from '../../shared/components/LoadingState/LoadingState'
import { Button, ButtonLink } from '../../shared/components/Button'
import WpStructuredContent from '../../shared/components/WpBlocks/WpStructuredContent'
import { hasRenderableBlocks } from '../../shared/utils/wpBlocks'
import './ProductPage.scss'
import ProductGallery from './ProductGallery'
import { ProductContext } from './ProductContext'
import RelatedProducts from './RelatedProducts'

type AddStatus = 'idle' | 'adding' | 'added' | 'error'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { status, product, error } = useProduct(slug)
  const { data: brands = [] } = useSWR(
    slug ? ['product-brands', slug] : null,
    ([, s]: [string, string]) => getProductBrands(s),
  )
  const [addStatus, setAddStatus] = useState<AddStatus>('idle')
  const [quantity, setQuantity] = useState(1)
  const { refresh: refreshCart } = useCart()
  const { data: pageBlocks } = useSWR(
    'page-blocks-template-produit',
    () => getPageBlocks('template-produit'),
  )

  async function handleAddToCart() {
    if (!product) return
    setAddStatus('adding')
    try {
      await addToCart(product.id, quantity)
      setAddStatus('added')
      refreshCart()
      setTimeout(() => setAddStatus('idle'), 2000)
    } catch {
      setAddStatus('error')
      setTimeout(() => setAddStatus('idle'), 2000)
    }
  }

  const addLabel =
    addStatus === 'adding'
      ? 'Ajout...'
      : addStatus === 'added'
        ? 'Ajoute !'
        : addStatus === 'error'
          ? 'Erreur, reessayer'
          : product?.add_to_cart.text ?? 'Ajouter au panier'

  return (
    <ProductContext.Provider value={product ?? null}>
    <main className="product-page">
      <Link to={`/${slugShop}/`} className="product-page__back">
        ← Boutique
      </Link>

      {status === 'loading' && <LoadingState message="Chargement du produit..." />}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}
      {status === 'not-found' && <p>Produit introuvable.</p>}

      {status === 'success' && product && (
        <div className="product-page__layout">
          <div className="product-page__gallery">
            <ProductGallery
              images={product.images}
              name={product.name}
              className="product-page__image"
            />
          </div>
          <div className="product-page__info">
            {Array.isArray(product.categories) && product.categories.length > 0 && (
              <div className="product-page__categories">
                {product.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/${slugCollection}/${cat.slug}/`}
                    className="product-page__category"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
            <h2>{product.name}</h2>
            {brands.length > 0 && (
              <dl className="product-page__brands">
                {brands.map((role) => (
                  <>
                    <dt key={`role-${role.id}`}>{role.name}</dt>
                    <dd key={`people-${role.id}`}>
                      {role.people.map((p) => p.name).join(', ')}
                    </dd>
                  </>
                ))}
              </dl>
            )}
            <div className="product-page__price">
              {product.on_sale && (
                <span className="product-page__badge product-page__badge--sale">Promo</span>
              )}
              <ProductPrice prices={product.prices} />
            </div>

            {product.short_description && (
              <div
                className="product-page__description"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {(product.formatted_dimensions || product.formatted_weight) && (
              <dl className="product-page__specs">
                {product.formatted_dimensions && (
                  <>
                    <dt>Format</dt>
                    <dd>{product.formatted_dimensions}</dd>
                  </>
                )}
                {product.formatted_weight && (
                  <>
                    <dt>Poids</dt>
                    <dd>{product.formatted_weight}</dd>
                  </>
                )}
              </dl>
            )}

            {product.low_stock_remaining !== null && (
              <p className="product-page__low-stock">
                Plus que {product.low_stock_remaining} en stock
              </p>
            )}

            {product.is_purchasable && product.is_in_stock ? (
              <div className="product-page__purchase">
                <div className="product-page__quantity" aria-label="Quantité">
                  <button
                    type="button"
                    className="product-page__quantity-btn"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    aria-label="Diminuer la quantité"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={quantity}
                    onChange={(event) => {
                      const next = Number.parseInt(event.target.value, 10)
                      setQuantity(Number.isFinite(next) && next > 0 ? next : 1)
                    }}
                    className="product-page__quantity-input"
                    inputMode="numeric"
                    aria-label="Quantité"
                  />
                  <button
                    type="button"
                    className="product-page__quantity-btn"
                    onClick={() => setQuantity((current) => current + 1)}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="product-page__actions">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addStatus === 'adding'}
                  >
                    {addLabel}
                  </Button>
                  {addStatus === 'added' && (
                    <ButtonLink to={`/${slugCart}/`} variant="link" className="product-page__cart-link">
                      Voir le panier →
                    </ButtonLink>
                  )}
                </div>
              </div>
            ) : (
              <p className="product-page__unavailable">
                {product.stock_availability.text || 'Produit indisponible'}
              </p>
            )}
          </div>
        </div>
      )}

      {pageBlocks && hasRenderableBlocks(pageBlocks.blocks) && (
        <WpStructuredContent blocks={pageBlocks.blocks} />
      )}

      {status === 'success' && product && (
        <RelatedProducts />
      )}
    </main>
    </ProductContext.Provider>
  )
}
