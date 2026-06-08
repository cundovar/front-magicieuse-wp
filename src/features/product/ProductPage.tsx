import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { addToCart } from '../../shared/api/woocommerce'
import { useCart } from '../cart/useCart'
import { useProduct } from './useProduct'
import ProductImage from '../../shared/components/ProductImage/ProductImage'
import ProductPrice from '../../shared/components/ProductPrice/ProductPrice'
import './ProductPage.scss'

type AddStatus = 'idle' | 'adding' | 'added' | 'error'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { status, product, error } = useProduct(slug)
  const [addStatus, setAddStatus] = useState<AddStatus>('idle')
  const { refresh: refreshCart } = useCart()

  async function handleAddToCart() {
    if (!product) return
    setAddStatus('adding')
    try {
      await addToCart(product.id)
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
    <main className="product-page">
      <Link to={`/${slugShop}/`} className="product-page__back">
        ← Boutique
      </Link>

      {status === 'loading' && <p>Chargement du produit...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}
      {status === 'not-found' && <p>Produit introuvable.</p>}

      {status === 'success' && product && (
        <div className="product-page__layout">
          <div className="product-page__gallery">
            <ProductImage
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
            <h1>{product.name}</h1>
            <div className="product-page__price">
              <ProductPrice prices={product.prices} />
            </div>
            {product.short_description && (
              <div
                className="product-page__description"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}
            {product.is_purchasable && product.is_in_stock ? (
              <div className="product-page__actions">
                <button
                  className="btn-primary"
                  onClick={handleAddToCart}
                  disabled={addStatus === 'adding'}
                >
                  {addLabel}
                </button>
                {addStatus === 'added' && (
                  <Link to={`/${slugCart}/`} className="product-page__cart-link">
                    Voir le panier →
                  </Link>
                )}
              </div>
            ) : (
              <p className="product-page__unavailable">Produit indisponible</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
