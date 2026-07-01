'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { getMenu } from '../../api/wordpress'
import { buildMenuTree } from '../../utils/menu'
import MenuLink from '../MenuLink/MenuLink'
import './Footer.scss'

const slugShop = process.env.NEXT_PUBLIC_SLUG_SHOP || 'boutique'
const slugCart = process.env.NEXT_PUBLIC_SLUG_CART || 'panier'

export default function Footer() {
  const { data: menuItems = [] } = useSWR('menu:footer', () => getMenu('footer'))
  const tree = buildMenuTree(menuItems)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <section className="site-footer__brand" aria-label="Magicieuse">
            <Link href="/" className="site-footer__logo">
              Magicieuse
            </Link>
            <p>
              Albums jeunesse, collections sensibles et univers d'artistes pour les
              petits lecteurs curieux.
            </p>
            <div className="site-footer__actions" aria-label="Acces rapides">
              <Link href={`/${slugShop}/`}>Boutique</Link>
              <Link href={`/${slugCart}/`}>Panier</Link>
            </div>
          </section>

          {tree.length > 0 && (
            <nav className="site-footer__nav" aria-label="Navigation secondaire">
              {tree.map((item) => (
                <div key={item.id} className="site-footer__section">
                  <MenuLink item={item} className="site-footer__section-title" />
                  {item.children.length > 0 && (
                    <ul className="site-footer__sublist">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <MenuLink item={child} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          )}

        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copy">
            © {currentYear} La Magicieuse — Maison d'edition jeunesse independante
          </p>
          <nav className="site-footer__legal" aria-label="Liens legaux">
            <Link href="/mentions-legales/">Mentions legales</Link>
            <Link href="/conditions-generales-de-vente/">CGV</Link>
            <Link href="/politique-de-confidentialite/">Confidentialite</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
