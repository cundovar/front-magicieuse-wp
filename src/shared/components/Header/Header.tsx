import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getMenu } from '../../api/wordpress'
import { useCart } from '../../../features/cart/useCart'
import { buildMenuTree, type MenuItem } from '../../utils/menu'
import MenuLink from '../MenuLink/MenuLink'
import './Header.scss'

const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'
const CART_PATHS = new Set([`/${slugCart}/`, '/cart/'])

function Dropdown({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fermer en cliquant en dehors
  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  // Fermer avec Echap
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div ref={ref} className={`site-header__dropdown${open ? ' is-open' : ''}`}>
      <button
        className="site-header__dropdown-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.title}
        <span className="site-header__dropdown-arrow" aria-hidden="true">
          ▾
        </span>
      </button>

      <ul className="site-header__submenu" role="list">
        {item.children.map((child) => (
          <li key={child.id} onClick={() => setOpen(false)}>
            <MenuLink item={child} nav />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Header() {
  const { itemCount } = useCart()
  const [tree, setTree] = useState<MenuItem[]>([])

  useEffect(() => {
    void getMenu('primary').then((items) =>
      setTree(buildMenuTree(items.filter((item) => !CART_PATHS.has(item.path)))),
    )
  }, [])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-header__logo">
          Magicieuse
        </NavLink>
        <nav className="site-header__nav" aria-label="Navigation principale">
          {tree.map((item) =>
            item.children.length > 0 ? (
              <Dropdown key={item.id} item={item} />
            ) : (
              <MenuLink key={item.id} item={item} nav />
            ),
          )}
          <NavLink to={`/${slugCart}/`} className="site-header__cart">
            Panier
            {itemCount > 0 && (
              <span className="site-header__cart-count">{itemCount}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
