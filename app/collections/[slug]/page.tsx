import { getCollection } from '@/shared/api/wordpress'
import { getProductsByCategory, getProductCategories } from '@/shared/api/woocommerce'
import CollectionPage from '@/features/collection/CollectionPage'
import { SwrFallback } from '../../swr-fallback'

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await getProductCategories()
  return categories.map((c) => ({ slug: c.slug }))
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
