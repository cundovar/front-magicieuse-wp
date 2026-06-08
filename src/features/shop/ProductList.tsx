import type { WooProduct } from '../../shared/api/woocommerce'
import ProductCard from './ProductCard'
import './ProductList.scss'

type Props = {
  products: WooProduct[]
}

export default function ProductList({ products }: Props) {
  if (products.length === 0) {
    return <p>Aucun produit disponible.</p>
  }

  return (
    <ul className="product-list">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
