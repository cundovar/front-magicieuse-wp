import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import {
  getContent,
  getPageBlocks,
  type WpBlocksContent,
  type WpContent,
} from '../../shared/api/wordpress'
import WpStructuredContent from '../../shared/components/WpBlocks/WpStructuredContent'
import SmartImage from '../../shared/components/SmartImage/SmartImage'
import { decodeHtml } from '../../shared/utils/html'
import { hasRenderableBlocks } from '../../shared/utils/wpBlocks'
import { LoadingState } from '../../shared/components/LoadingState/LoadingState'
import './WpPagePage.scss'

type PageData = [WpContent, WpBlocksContent | null]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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
      {status === 'loading' && <LoadingState />}
      {status === 'error' && <p role="alert">Erreur : {error?.message}</p>}
      {status === 'not-found' && <p>Page introuvable.</p>}

      {status === 'success' && page && (
        <article>
          <header className="wp-page__header">
            {page.featured_image && (
              <SmartImage
                className="wp-page__featured-image"
                src={page.featured_image.url}
                alt={page.featured_image.alt || decodeHtml(page.title)}
                width={page.featured_image.width}
                height={page.featured_image.height}
                srcSet={page.featured_image.srcset || undefined}
                sizes={page.featured_image.sizes || undefined}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            )}
            <h1 className="wp-page__title">{decodeHtml(page.title)}</h1>
            {page.date && (
              <time className="wp-page__date" dateTime={page.date}>
                {formatDate(page.date)}
              </time>
            )}
          </header>

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
