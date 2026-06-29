import { useSearchParams } from 'react-router-dom'
import useSWR from 'swr'
import { useProducts } from './useProducts'
import ProductList from './ProductList'
import ShopFilters from './ShopFilters'
import { LoadingState } from '../../shared/components/LoadingState/LoadingState'
import { getPageBlocks } from '../../shared/api/wordpress'
import type { ProductQueryParams } from '../../shared/api/woocommerce'
import './ShopPage.scss'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'

function parseFilters(params: URLSearchParams): ProductQueryParams {
  const f: ProductQueryParams = {}
  if (params.has('cat'))  f.category = params.get('cat')!
  if (params.has('min'))  f.minPrice  = Math.round(Number(params.get('min')) * 100)
  if (params.has('max'))  f.maxPrice  = Math.round(Number(params.get('max')) * 100)
  const sort = params.get('sort') ?? ''
  if (sort === 'price-asc')  { f.orderby = 'price';      f.order = 'asc' }
  if (sort === 'price-desc') { f.orderby = 'price';      f.order = 'desc' }
  if (sort === 'popularity') { f.orderby = 'popularity'; f.order = 'desc' }
  return f
}

function filtersToParams(f: ProductQueryParams): URLSearchParams {
  const p = new URLSearchParams()
  if (f.category)                      p.set('cat',  f.category)
  if (f.minPrice != null)              p.set('min',  String(Math.round(f.minPrice  / 100)))
  if (f.maxPrice != null)              p.set('max',  String(Math.round(f.maxPrice  / 100)))
  if (f.orderby === 'price' && f.order === 'asc')  p.set('sort', 'price-asc')
  if (f.orderby === 'price' && f.order === 'desc') p.set('sort', 'price-desc')
  if (f.orderby === 'popularity')                  p.set('sort', 'popularity')
  return p
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const hasFilters = Object.keys(filters).length > 0

  const { data: pageBlocks } = useSWR(
    `page-blocks-${slugShop}`,
    () => getPageBlocks(slugShop),
    { revalidateOnFocus: false },
  )

  const shopFiltersBlock = pageBlocks?.blocks.find(b => b.blockName === 'magicieuse/shop-filters')
  const layout = (shopFiltersBlock?.attrs?.layout as string) ?? 'drawer'

  const { status, products, error } = useProducts(hasFilters ? filters : undefined)

  function handleFiltersChange(f: ProductQueryParams) {
    setSearchParams(filtersToParams(f), { replace: true })
  }

  const productArea = (
    <>
      {status === 'loading' && <LoadingState message="Chargement des produits..." />}
      {status === 'error'   && <p role="alert">Erreur : {error}</p>}
      {status === 'success' && <ProductList products={products} />}
    </>
  )

  if (shopFiltersBlock && layout === 'sidebar') {
    return (
      <main className="shop-page shop-page--with-sidebar">
        <header className="shop-page__header">
          <h1>Boutique</h1>
        </header>
        <div className="shop-page__sidebar-layout">
          <ShopFilters
            block={shopFiltersBlock}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
          <div className="shop-page__content">{productArea}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="shop-page">
      <header className="shop-page__header">
        <div className="shop-page__header-row">
          <h1>Boutique</h1>
          {shopFiltersBlock && (
            <ShopFilters
              block={shopFiltersBlock}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          )}
        </div>
      </header>
      {productArea}
    </main>
  )
}
