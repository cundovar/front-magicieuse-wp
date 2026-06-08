import { useProducts } from './useProducts'
import ProductList from './ProductList'
import './ShopPage.scss'

export default function ShopPage() {
  const { status, products, error } = useProducts()

  return (
    <main className="shop-page">
      <header className="shop-page__header">
        <h1>Boutique</h1>
      </header>
      {status === 'loading' && <p>Chargement des produits...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}
      {status === 'success' && <ProductList products={products} />}
    </main>
  )
}
