import { NavLink } from 'react-router-dom'
import { Home, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react'
import { useCart } from '../../../features/cart/useCart'
import { getWooUrl } from '../../utils/wooUrl'
import './BottomNav.scss'

const slugShop  = import.meta.env.VITE_SLUG_SHOP  || 'boutique'
const slugCart  = import.meta.env.VITE_SLUG_CART  || 'panier'

export default function BottomNav() {
  const { itemCount } = useCart()

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <NavLink to="/" end className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <Home size={22} aria-hidden="true" />
        <span>Accueil</span>
      </NavLink>

      <NavLink to={`/${slugShop}/`} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <ShoppingBag size={22} aria-hidden="true" />
        <span>Boutique</span>
      </NavLink>

      <NavLink to={`/${slugCart}/`} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <span className="bottom-nav__icon-wrap">
          <ShoppingCart size={22} aria-hidden="true" />
          {itemCount > 0 && (
            <span className="bottom-nav__badge" aria-label={`${itemCount} article${itemCount > 1 ? 's' : ''}`}>
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </span>
        <span>Panier</span>
      </NavLink>

      <a href={getWooUrl('/mon-compte/')} className="bottom-nav__item">
        <UserRound size={22} aria-hidden="true" />
        <span>Compte</span>
      </a>
    </nav>
  )
}
