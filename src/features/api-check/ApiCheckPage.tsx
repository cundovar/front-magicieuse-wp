import { useEffect, useState } from 'react'
import {
  getProductCategories,
  getProducts,
  type WooCategory,
  type WooProduct,
} from '../../shared/api/woocommerce'
import { getPages, type WordPressPage } from '../../shared/api/wordpress'
import './ApiCheckPage.scss'

type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export default function ApiCheckPage() {
  const [status, setStatus] = useState<ApiStatus>('idle')
  const [products, setProducts] = useState<WooProduct[]>([])
  const [categories, setCategories] = useState<WooCategory[]>([])
  const [pages, setPages] = useState<WordPressPage[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadApiData() {
      try {
        setStatus('loading')
        const [productList, categoryList, pageList] = await Promise.all([
          getProducts(),
          getProductCategories(),
          getPages(),
        ])
        setProducts(productList)
        setCategories(categoryList)
        setPages(pageList)
        setStatus('success')
      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : 'Erreur API')
        setStatus('error')
      }
    }
    void loadApiData()
  }, [])

  return (
    <main className="api-check">
      <header className="api-check__header">
        <p className="api-check__eyebrow">Headless WordPress + WooCommerce</p>
        <h1>Controle API</h1>
        <p>
          Cette page sert uniquement a verifier que React recupere les donnees
          WordPress et WooCommerce avant de travailler les routes et le style.
        </p>
      </header>

      {status === 'loading' && <p>Chargement des donnees...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}

      {status === 'success' && (
        <section className="api-check__grid" aria-label="Resultats API">
          <article>
            <h2>Produits</h2>
            <p>{products.length} produit(s) recuperes.</p>
            <ul>
              {products.slice(0, 6).map((product) => (
                <li key={product.id}>
                  <span>{product.name}</span>
                  <small>/produit/{product.slug}/</small>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h2>Categories</h2>
            <p>{categories.length} categorie(s) recuperees.</p>
            <ul>
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <span>{category.name}</span>
                  <small>/collections/{category.slug}/</small>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h2>Pages WordPress</h2>
            <p>{pages.length} page(s) recuperees.</p>
            <ul>
              {pages.slice(0, 6).map((page) => (
                <li key={page.id}>
                  <span dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
                  <small>/{page.slug}/</small>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </main>
  )
}
