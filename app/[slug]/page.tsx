import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getContent, getPageBlocks, getPages } from '@/shared/api/wordpress'
import WpPagePage from '@/features/wp-page/WpPagePage'
import { SITE_NAME, metaDescription } from '@/shared/seo'
import { decodeHtml } from '@/shared/utils/html'
import { SwrFallback } from '../swr-fallback'

export const revalidate = 60

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const content = await getContent(slug).catch(() => null)
  if (!content) return {}
  return {
    title: `${decodeHtml(content.title)} — ${SITE_NAME}`,
    description: metaDescription(content.excerpt || content.content),
    alternates: { canonical: `/${slug}/` },
  }
}

// Slugs pris en charge par des routes statiques dédiées → à exclure du catch-all.
const RESERVED = new Set(
  [
    process.env.NEXT_PUBLIC_SLUG_SHOP || 'boutique',
    process.env.NEXT_PUBLIC_SLUG_PRODUCT || 'produit',
    process.env.NEXT_PUBLIC_SLUG_COLLECTION || 'collections',
    process.env.NEXT_PUBLIC_SLUG_CART || 'panier',
    'api-check',
  ],
)

const REQUIRED_PAGE_SLUGS = [
  'conditions-generales-de-vente',
  'politique-de-confidentialite',
]

export async function generateStaticParams() {
  const pages = await getPages()
  const slugs = new Set(pages.map((page) => page.slug))
  REQUIRED_PAGE_SLUGS.forEach((slug) => slugs.add(slug))

  return Array.from(slugs)
    .filter((slug) => !RESERVED.has(slug))
    .map((slug) => ({ slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const content = await getContent(slug).catch(() => null)
  if (!content) notFound() // slug inconnu → vrai 404 (au lieu d'un 500)

  const blocks = await getPageBlocks(slug).catch(() => null)

  return (
    <SwrFallback entries={[[['wp-page', slug], [content, blocks]]]}>
      <WpPagePage />
    </SwrFallback>
  )
}
