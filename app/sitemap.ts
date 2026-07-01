import type { MetadataRoute } from 'next'
import { getProducts } from '@/shared/api/woocommerce'
import { getProductCategories } from '@/shared/api/woocommerce'
import { getPages } from '@/shared/api/wordpress'
import { SITE_URL } from '@/shared/seo'

const RESERVED = new Set(
  [
    process.env.NEXT_PUBLIC_SLUG_SHOP || 'boutique',
    process.env.NEXT_PUBLIC_SLUG_PRODUCT || 'produit',
    process.env.NEXT_PUBLIC_SLUG_COLLECTION || 'collections',
    process.env.NEXT_PUBLIC_SLUG_CART || 'panier',
    'api-check',
  ],
)

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    getProducts().catch(() => []),
    getProductCategories().catch(() => []),
    getPages().catch(() => []),
  ])

  const now = new Date()

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/boutique/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...products.map((p) => ({
      url: `${SITE_URL}/produit/${p.slug}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/collections/${c.slug}/`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...pages
      .filter((p) => !RESERVED.has(p.slug))
      .map((p) => ({
        url: `${SITE_URL}/${p.slug}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  ]
}
