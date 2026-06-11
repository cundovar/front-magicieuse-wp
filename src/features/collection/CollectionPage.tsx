import { useParams, Link } from 'react-router-dom'
import { decodeHtml } from '../../shared/utils/html'
import { useCollection } from './useCollection'
import ProductList from '../shop/ProductList'
import './CollectionPage.scss'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const { status, products, collection, error } = useCollection(slug)

  return (
    <main className="collection-page">
      <Link to={`/${slugShop}/`} className="collection-page__back">
        ← Boutique
      </Link>

      {status === 'loading' && <p>Chargement de la collection...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}
      {status === 'not-found' && <p>Collection introuvable.</p>}

      {status === 'success' && (
        <>
          <header className="collection-page__header">
            {collection?.image && (
              <img
                className="collection-page__image"
                src={collection.image.url}
                alt={collection.image.alt || decodeHtml(collection.name)}
                width={collection.image.width}
                height={collection.image.height}
                srcSet={collection.image.srcset || undefined}
                sizes={collection.image.sizes || undefined}
              />
            )}
            <div className="collection-page__intro">
              <h1>{collection ? decodeHtml(collection.name) : ''}</h1>
              {collection?.description && (
                <div
                  className="collection-page__description"
                  dangerouslySetInnerHTML={{
                    __html: decodeHtml(collection.description).replace(/\n/g, '<br />'),
                  }}
                />
              )}
              <p className="collection-page__count">
                {products.length} produit{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </header>

          {products.length === 0 ? (
            <p>Cette collection ne contient pas encore de produits.</p>
          ) : (
            <ProductList products={products} />
          )}
        </>
      )}
    </main>
  )
}
