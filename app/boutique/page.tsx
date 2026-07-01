import type { Metadata } from 'next'
import { getProducts } from '@/shared/api/woocommerce'
import { getPageBlocks } from '@/shared/api/wordpress'
import ShopPage from '@/features/shop/ShopPage'
import { SITE_NAME } from '@/shared/seo'
import { SwrFallback } from '../swr-fallback'

const slugShop = process.env.NEXT_PUBLIC_SLUG_SHOP || 'boutique'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `Boutique — ${SITE_NAME}`,
  description:
    'Découvrez tous les albums et livres jeunesse de La Magicieuse : collections, nouveautés et univers d’artistes.',
  alternates: { canonical: '/boutique/' },
}

export default async function Page() {
  const [products, pageBlocks] = await Promise.all([
    getProducts(),
    getPageBlocks(slugShop).catch(() => null),
  ])

  return (
    <SwrFallback
      entries={[
        ['products', products],
        [`page-blocks-${slugShop}`, pageBlocks],
      ]}
    >
      <ShopPage />
    </SwrFallback>
  )
}
