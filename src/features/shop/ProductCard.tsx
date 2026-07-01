'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addToCart } from '../../shared/api/woocommerce'
import type { WooProduct } from '../../shared/api/woocommerce'
import { useCart } from '../cart/useCart'
import { decodeHtml } from '../../shared/utils/html'
import ProductImage from '../../shared/components/ProductImage/ProductImage'
import ProductPrice from '../../shared/components/ProductPrice/ProductPrice'
import { Button } from '../../shared/components/Button'
import './ProductCard.scss'

type Props = {
  product: WooProduct
}

type AddStatus = 'idle' | 'adding' | 'added' | 'error'

const slugProduct = process.env.NEXT_PUBLIC_SLUG_PRODUCT || 'produit'

export default function ProductCard({ product }: Props) {
  const [addStatus, setAddStatus] = useState<AddStatus>('idle')
  const { refresh: refreshCart } = useCart()

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
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
        ? 'Ajouté !'
        : addStatus === 'error'
          ? 'Erreur, réessayer'
          : product.add_to_cart.text ?? 'Ajouter au panier'

  const productPath = `/${slugProduct}/${product.slug}/`

  return (
    <article className="product-card">
      <Link href={productPath} className="product-card__image-link" tabIndex={-1} aria-hidden>
        <ProductImage
          images={product.images}
          name={product.name}
          className="product-card__image"
        />
      </Link>

      <div className="product-card__body">
        <Link href={productPath} className="product-card__name-link">
          <h2 className="product-card__name">{decodeHtml(product.name)}</h2>
        </Link>

        {product.short_description && (
          <div
            className="product-card__desc"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        <ProductPrice prices={product.prices} />

        <div className="product-card__footer">
          {!product.is_in_stock && (
            <span className="product-card__badge product-card__badge--out">Épuisé</span>
          )}
          {product.is_purchasable && product.is_in_stock && (
            <Button
              className="product-card__add-btn"
              size="sm"
              onClick={handleAddToCart}
              disabled={addStatus === 'adding'}
            >
              {addLabel}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
