import { useEffect, useState } from 'react'
import {
  getFrontPage,
  getFrontPageBlocks,
  type WpBlocksContent,
  type WpContent,
} from '../../shared/api/wordpress'
import WpStructuredContent from '../../shared/components/WpBlocks/WpStructuredContent'
import { decodeHtml } from '../../shared/utils/html'
import { hasRenderableBlocks } from '../../shared/utils/wpBlocks'
import './HomePage.scss'

type Status = 'loading' | 'success' | 'not-found' | 'error'

export default function HomePage() {
  const [status, setStatus] = useState<Status>('loading')
  const [page, setPage] = useState<WpContent | null>(null)
  const [structuredPage, setStructuredPage] = useState<WpBlocksContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadFrontPage() {
      setStatus('loading')
      setPage(null)
      setStructuredPage(null)
      setError(null)

      try {
        const [htmlData, blocksData] = await Promise.all([
          getFrontPage(),
          getFrontPageBlocks().catch(() => null),
        ])
        if (cancelled) return
        setPage(htmlData)
        setStructuredPage(
          blocksData && hasRenderableBlocks(blocksData.blocks) ? blocksData : null,
        )
        setStatus('success')
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Erreur API'
        setError(message)
        setStatus(message.includes('404') ? 'not-found' : 'error')
      }
    }

    void loadFrontPage()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="home-page">
      {status === 'loading' && <p>Chargement...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}
      {status === 'not-found' && (
        <p role="alert">Aucune page d'accueil WordPress n'est definie.</p>
      )}

      {status === 'success' && page && (
        <article className="home-page__article">
          <h1>{decodeHtml(page.title)}</h1>
          <div className="home-page__content wp-page__content wp-content">
            {structuredPage ? (
              <WpStructuredContent blocks={structuredPage.blocks} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            )}
          </div>
        </article>
      )}
    </main>
  )
}
