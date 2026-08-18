import type { Metadata } from 'next'
import { getCollection } from '@/shared/api/wordpress'
import { getProductsByCategory } from '@/shared/api/woocommerce'
import CollectionPage from '@/features/collection/CollectionPage'
import { SITE_NAME, metaDescription, breadcrumbJsonLd } from '@/shared/seo'
import { decodeHtml } from '@/shared/utils/html'
import { SwrFallback } from '../../swr-fallback'

export const revalidate = 60

// Les collections sont générées à la demande puis conservées par l'ISR.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollection(slug).catch(() => null)
  const name = collection ? decodeHtml(collection.name) : 'Collection'
  return {
    title: `${name} — ${SITE_NAME}`,
    description:
      metaDescription(collection?.description) ||
      `Découvrez la collection ${name} de La Magicieuse.`,
    alternates: { canonical: `/collections/${slug}/` },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [collection, products] = await Promise.all([
    getCollection(slug),
    getProductsByCategory(slug),
  ])

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Accueil', path: '/' },
    { name: 'Boutique', path: '/boutique/' },
    { name: collection ? decodeHtml(collection.name) : 'Collection', path: `/collections/${slug}/` },
  ])

  return (
    <SwrFallback entries={[[['collection', slug], [collection, products]]]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <CollectionPage />
    </SwrFallback>
  )
}
