import useSWR from 'swr'
import { getFront, type WpFrontData } from '../../shared/api/wordpress'
import WpStructuredContent from '../../shared/components/WpBlocks/WpStructuredContent'
import { decodeHtml } from '../../shared/utils/html'
import { hasRenderableBlocks } from '../../shared/utils/wpBlocks'
import './HomePage.scss'

export default function HomePage() {
  const { data, error, isLoading } = useSWR<WpFrontData>('front', () => getFront())

  const status = isLoading
    ? 'loading'
    : error?.message?.includes('404')
      ? 'not-found'
      : error
        ? 'error'
        : 'success'

  const structuredPage =
    data && hasRenderableBlocks(data.blocks.blocks) ? data.blocks : null

  return (
    <main className="home-page">
      {status === 'loading' && <p>Chargement...</p>}
      {status === 'error' && <p role="alert">Erreur : {error?.message}</p>}
      {status === 'not-found' && (
        <p role="alert">Aucune page d'accueil WordPress n'est definie.</p>
      )}

      {status === 'success' && data && (
        <article className="home-page__article">
          <h1>{decodeHtml(data.page.title)}</h1>
          <div className="home-page__content wp-page__content wp-content">
            {structuredPage ? (
              <WpStructuredContent blocks={structuredPage.blocks} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: data.page.content }} />
            )}
          </div>
        </article>
      )}
    </main>
  )
}
