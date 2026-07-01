import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts } from '@/shared/api/woocommerce'
import ProductPage from '@/features/product/ProductPage'
import { SITE_URL, SITE_NAME, metaDescription, decimalPrice } from '@/shared/seo'
import { decodeHtml } from '@/shared/utils/html'
import { SwrFallback } from '../../swr-fallback'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: `Produit introuvable — ${SITE_NAME}` }

  const name = decodeHtml(product.name)
  const description = metaDescription(product.short_description)
  const image = product.images?.[0]?.src

  return {
    title: `${name} — ${SITE_NAME}`,
    description,
    alternates: { canonical: `/produit/${slug}/` },
    openGraph: {
      title: name,
      description,
      type: 'website',
      url: `${SITE_URL}/produit/${slug}/`,
      images: image ? [{ url: image, alt: product.images[0].alt || name }] : [],
    },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: decodeHtml(product.name),
    description: metaDescription(product.short_description, 5000),
    image: product.images?.map((i) => i.src) ?? [],
    sku: product.sku || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.prices.currency_code || 'EUR',
      price: decimalPrice(product.prices.price, product.prices.currency_minor_unit),
      availability: product.is_in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/produit/${slug}/`,
    },
  }

  return (
    <SwrFallback entries={[[['product', slug], product]]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPage />
    </SwrFallback>
  )
}
