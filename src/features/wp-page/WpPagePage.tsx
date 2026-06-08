import useSWR from 'swr'
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

type PageData = [WpContent, WpBlocksContent | null]

export default function WpPagePage() {
  const { slug } = useParams<{ slug: string }>()

  const { data, error, isLoading } = useSWR<PageData>(
    slug ? ['wp-page', slug] : null,
    ([, s]: [string, string]) =>
      Promise.all([getContent(s), getPageBlocks(s).catch(() => null)]),
  )

  const status = isLoading
    ? 'loading'
    : error?.message?.includes('404')
      ? 'not-found'
      : error
        ? 'error'
        : 'success'

  const page = data?.[0] ?? null
  const rawBlocks = data?.[1] ?? null
  const structuredPage = rawBlocks && hasRenderableBlocks(rawBlocks.blocks) ? rawBlocks : null

  return (
    <main className="wp-page">
      {status === 'loading' && <p>Chargement...</p>}
      {status === 'error' && <p role="alert">Erreur : {error?.message}</p>}
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
