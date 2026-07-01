import type { Metadata } from 'next'
import { getCollection } from '@/shared/api/wordpress'
import { getProductsByCategory, getProductCategories } from '@/shared/api/woocommerce'
import CollectionPage from '@/features/collection/CollectionPage'
import { SITE_NAME, metaDescription } from '@/shared/seo'
import { decodeHtml } from '@/shared/utils/html'
import { SwrFallback } from '../../swr-fallback'

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await getProductCategories()
  return categories.map((c) => ({ slug: c.slug }))
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

  return (
    <SwrFallback entries={[[['collection', slug], [collection, products]]]}>
      <CollectionPage />
    </SwrFallback>
  )
}
