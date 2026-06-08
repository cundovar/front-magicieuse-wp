import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './features/cart/CartContext'
import Header from './shared/components/Header/Header'
import Footer from './shared/components/Footer/Footer'
import HomePage from './features/home/HomePage'
import ShopPage from './features/shop/ShopPage'
import ProductPage from './features/product/ProductPage'
import CollectionPage from './features/collection/CollectionPage'
import CartPage from './features/cart/CartPage'
import WpPagePage from './features/wp-page/WpPagePage'
import ApiCheckPage from './features/api-check/ApiCheckPage'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path={`/${slugShop}/`} element={<ShopPage />} />
          <Route path={`/${slugProduct}/:slug/`} element={<ProductPage />} />
          <Route path={`/${slugCollection}/:slug/`} element={<CollectionPage />} />
          <Route path={`/${slugCart}/`} element={<CartPage />} />
          <Route path="/api-check/" element={<ApiCheckPage />} />
          <Route path="/:slug/" element={<WpPagePage />} />
        </Routes>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  )
}
