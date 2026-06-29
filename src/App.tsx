import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SWRConfig } from 'swr'
import useSWR from 'swr'
import ThemeLoader from './ThemeLoader'
import { CartProvider } from './features/cart/CartContext'
import { getTheme } from './shared/api/wordpress'
import { applyThemeFromApi } from './shared/utils/theme'
import Header from './shared/components/Header/Header'
import Footer from './shared/components/Footer/Footer'
import BottomNav from './shared/components/BottomNav/BottomNav'
import { LoadingState } from './shared/components/LoadingState/LoadingState'

const HomePage       = lazy(() => import('./features/home/HomePage'))
const ShopPage       = lazy(() => import('./features/shop/ShopPage'))
const ProductPage    = lazy(() => import('./features/product/ProductPage'))
const CollectionPage = lazy(() => import('./features/collection/CollectionPage'))
const CartPage       = lazy(() => import('./features/cart/CartPage'))
const WpPagePage     = lazy(() => import('./features/wp-page/WpPagePage'))
const ApiCheckPage   = lazy(() => import('./features/api-check/ApiCheckPage'))

const slugShop       = import.meta.env.VITE_SLUG_SHOP       || 'boutique'
const slugProduct    = import.meta.env.VITE_SLUG_PRODUCT    || 'produit'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugCart       = import.meta.env.VITE_SLUG_CART       || 'panier'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppInner() {
  const { data } = useSWR('theme', getTheme)

  useEffect(() => {
    if (data?.theme) applyThemeFromApi(data.theme)
  }, [data?.theme])

  return (
    <CartProvider>
      <ScrollToTop />
      <ThemeLoader />
      <Header />
      <Suspense fallback={<LoadingState />}>
        <Routes>
          <Route path="/"                            element={<HomePage />} />
          <Route path={`/${slugShop}/`}              element={<ShopPage />} />
          <Route path={`/${slugProduct}/:slug/`}     element={<ProductPage />} />
          <Route path={`/${slugCollection}/:slug/`}  element={<CollectionPage />} />
          <Route path={`/${slugCart}/`}              element={<CartPage />} />
          <Route path="/api-check/"                  element={<ApiCheckPage />} />
          <Route path="/:slug/"                      element={<WpPagePage />} />
        </Routes>
      </Suspense>
      <Footer />
      <BottomNav />
    </CartProvider>
  )
}

export default function App() {
  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60_000,
    }}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </SWRConfig>
  )
}
