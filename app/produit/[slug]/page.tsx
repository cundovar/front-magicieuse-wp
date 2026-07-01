import { getProductBySlug, getProducts } from '@/shared/api/woocommerce'
import ProductPage from '@/features/product/ProductPage'
import { SwrFallback } from '../../swr-fallback'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  return (
    <SwrFallback entries={[[['product', slug], product]]}>
      <ProductPage />
    </SwrFallback>
  )
}
