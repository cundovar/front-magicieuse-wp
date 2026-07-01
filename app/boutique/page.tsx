import { getProducts } from '@/shared/api/woocommerce'
import { getPageBlocks } from '@/shared/api/wordpress'
import ShopPage from '@/features/shop/ShopPage'
import { SwrFallback } from '../swr-fallback'

const slugShop = process.env.NEXT_PUBLIC_SLUG_SHOP || 'boutique'

export const revalidate = 3600

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
