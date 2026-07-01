'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react'
import { useCart } from '../../../features/cart/useCart'
import { getWooUrl } from '../../utils/wooUrl'
import './BottomNav.scss'

const slugShop  = process.env.NEXT_PUBLIC_SLUG_SHOP  || 'boutique'
const slugCart  = process.env.NEXT_PUBLIC_SLUG_CART  || 'panier'

export default function BottomNav() {
  const { itemCount } = useCart()
  const pathname = usePathname()

  const homeActive = pathname === '/'
  const shopActive = pathname.startsWith(`/${slugShop}/`)
  const cartActive = pathname.startsWith(`/${slugCart}/`)

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <Link href="/" className={`bottom-nav__item${homeActive ? ' is-active' : ''}`}>
        <Home size={22} aria-hidden="true" />
        <span>Accueil</span>
      </Link>

      <Link href={`/${slugShop}/`} className={`bottom-nav__item${shopActive ? ' is-active' : ''}`}>
        <ShoppingBag size={22} aria-hidden="true" />
        <span>Boutique</span>
      </Link>

      <Link href={`/${slugCart}/`} className={`bottom-nav__item${cartActive ? ' is-active' : ''}`}>
        <span className="bottom-nav__icon-wrap">
          <ShoppingCart size={22} aria-hidden="true" />
          {itemCount > 0 && (
            <span className="bottom-nav__badge" aria-label={`${itemCount} article${itemCount > 1 ? 's' : ''}`}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </span>
        <span>Panier</span>
      </Link>

      <a href={getWooUrl('/mon-compte/')} className="bottom-nav__item">
        <UserRound size={22} aria-hidden="true" />
        <span>Compte</span>
      </a>
    </nav>
  )
}
