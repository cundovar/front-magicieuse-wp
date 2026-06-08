import { Link } from 'react-router-dom'
import type { WooProduct } from '../../shared/api/woocommerce'
import { decodeHtml } from '../../shared/utils/html'
import ProductImage from '../../shared/components/ProductImage/ProductImage'
import ProductPrice from '../../shared/components/ProductPrice/ProductPrice'
import './ProductCard.scss'

type Props = {
  product: WooProduct
}

const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'

export default function ProductCard({ product }: Props) {
  return (
    <article className="product-card">
      <Link to={`/${slugProduct}/${product.slug}/`} className="product-card__link">
        <ProductImage
          images={product.images}
          name={product.name}
          className="product-card__image"
        />
        <div className="product-card__body">
          <h2 className="product-card__name">{decodeHtml(product.name)}</h2>
          <ProductPrice prices={product.prices} />
        </div>
      </Link>
    </article>
  )
}
