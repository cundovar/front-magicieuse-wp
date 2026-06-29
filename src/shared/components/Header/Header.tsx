import { useEffect, useRef, useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import useSWR from 'swr'
import { ChevronDown, ShoppingBag, X } from 'lucide-react'
import { getMenu } from '../../api/wordpress'
import { useCart } from '../../../features/cart/useCart'
import { buildMenuTree, type MenuItem } from '../../utils/menu'
import { decodeHtml } from '../../utils/html'
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
      if (window.matchMedia('(max-width: 920px)').matches) return
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
          <ChevronDown size={14} />
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

function MobileMenuEntry({
  item,
  open,
  onToggle,
}: {
  item: MenuItem
  open: boolean
  onToggle: () => void
}) {
  if (item.children.length === 0) {
    return <MenuLink item={item} nav className="site-header__mobile-link" />
  }

  return (
    <section className={`site-header__mobile-section${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="site-header__mobile-section-btn"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{decodeHtml(item.title)}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <ul className="site-header__mobile-submenu" role="list">
        {item.children.map((child) => (
          <li key={child.id}>
            <MenuLink item={child} nav />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMobileSections, setOpenMobileSections] = useState<Set<number>>(() => new Set())
  const mobileSectionsInitialized = useRef(false)
  const { itemCount } = useCart()
  const { data: menuItems = [] } = useSWR('menu:primary', () => getMenu('primary'))
  const tree = buildMenuTree(menuItems.filter((item) => !CART_PATHS.has(item.path)))
  const mainItems = tree.slice(0, 2)
  const actionItems = tree.slice(2)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const location = useLocation()

  useEffect(() => {
    if (mobileSectionsInitialized.current || tree.length === 0) return
    mobileSectionsInitialized.current = true
    setOpenMobileSections(new Set(tree.filter((item) => item.children.length > 0).slice(0, 2).map((item) => item.id)))
  }, [tree])

  // Fermer le menu à chaque changement de page
  useEffect(() => {
    closeMenu()
  }, [location.pathname, closeMenu])

  // Escape key
  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, closeMenu])

  // Swipe depuis le bord gauche pour ouvrir, swipe gauche pour fermer
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
      if (dy > 80) return
      if (!menuOpen && touchStartX.current < 32 && dx > 56) setMenuOpen(true)
      if (menuOpen && dx < -56) closeMenu()
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [menuOpen, closeMenu])

  // Scroll lock quand menu ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function renderMenuItem(item: MenuItem) {
    return item.children.length > 0 ? (
      <Dropdown key={item.id} item={item} />
    ) : (
      <MenuLink key={item.id} item={item} nav />
    )
  }

  function renderMobileMenuItem(item: MenuItem) {
    return (
      <MobileMenuEntry
        key={item.id}
        item={item}
        open={openMobileSections.has(item.id)}
        onToggle={() => {
          setOpenMobileSections((current) => {
            const next = new Set(current)
            if (next.has(item.id)) {
              next.delete(item.id)
            } else {
              next.add(item.id)
            }
            return next
          })
        }}
      />
    )
  }

  return (
    <header className="site-header">
      {menuOpen && (
        <div className="site-header__overlay" aria-hidden="true" onClick={closeMenu} />
      )}

      <button
        className={`site-header__langette${menuOpen ? ' is-hidden' : ''}`}
        type="button"
        aria-label="Ouvrir le menu"
        onClick={() => setMenuOpen(true)}
      />

      <div className="site-header__inner">
        <NavLink to="/" className="site-header__logo">
          Magicieuse
        </NavLink>
        <button
          className="site-header__toggle"
          type="button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-controls="site-header-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav
          id="site-header-nav"
          className={`site-header__nav${menuOpen ? ' is-open' : ''}`}
          aria-label="Navigation principale"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) closeMenu()
          }}
        >
          <div className="site-header__mobile-panel-header">
            <NavLink to="/" className="site-header__mobile-logo">
              La Magicieuse<span>.</span>
            </NavLink>
            <button
              className="site-header__mobile-close"
              type="button"
              aria-label="Fermer le menu"
              onClick={closeMenu}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="site-header__mobile-separator" />
          <div className="site-header__menu">
            {mainItems.map(renderMenuItem)}
          </div>
          <div className="site-header__actions">
            {actionItems.map(renderMenuItem)}
            <NavLink to={`/${slugCart}/`} className="site-header__cart">
              <ShoppingBag size={16} aria-hidden="true" />
              Panier
              {itemCount > 0 && (
                <span className="site-header__cart-count">{itemCount}</span>
              )}
            </NavLink>
          </div>
          <div className="site-header__mobile-menu">
            {tree.map(renderMobileMenuItem)}
            <NavLink to={`/${slugCart}/`} className="site-header__mobile-link site-header__cart">
              <ShoppingBag size={16} aria-hidden="true" />
              Panier
              {itemCount > 0 && (
                <span className="site-header__cart-count">{itemCount}</span>
              )}
            </NavLink>
          </div>
          <div className="site-header__mobile-footer" aria-hidden="true">
            <span />
          </div>
        </nav>
      </div>
    </header>
  )
}
