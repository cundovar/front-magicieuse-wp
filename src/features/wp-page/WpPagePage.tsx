import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getContent,
  getPageBlocks,
  type WpBlocksContent,
  type WpContent,
} from '../../shared/api/wordpress'
import WpStructuredContent from '../../shared/components/WpBlocks/WpStructuredContent'
import { decodeHtml } from '../../shared/utils/html'
import { hasRenderableBlocks } from '../../shared/utils/wpBlocks'
import './WpPagePage.scss'

type Status = 'loading' | 'success' | 'not-found' | 'error'

export default function WpPagePage() {
  const { slug } = useParams<{ slug: string }>()
  const [status, setStatus] = useState<Status>('loading')
  const [page, setPage] = useState<WpContent | null>(null)
  const [structuredPage, setStructuredPage] = useState<WpBlocksContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    const contentSlug = slug
    let cancelled = false

    async function load() {
      setStatus('loading')
      setPage(null)
      setStructuredPage(null)
      try {
        const [htmlData, blocksData] = await Promise.all([
          getContent(contentSlug),
          getPageBlocks(contentSlug).catch(() => null),
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
        if (message.includes('404')) {
          setStatus('not-found')
        } else {
          setError(message)
          setStatus('error')
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <main className="wp-page">
      {status === 'loading' && <p>Chargement...</p>}
      {status === 'error' && <p role="alert">Erreur : {error}</p>}
      {status === 'not-found' && <p>Page introuvable.</p>}

      {status === 'success' && page && (
        <article className="wp-page__article">
          <h1>{decodeHtml(page.title)}</h1>
          <div className="wp-page__content wp-content">
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
