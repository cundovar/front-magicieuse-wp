import useSWR from 'swr'
import { NavLink } from 'react-router-dom'
import { getMenu } from '../../api/wordpress'
import { buildMenuTree } from '../../utils/menu'
import MenuLink from '../MenuLink/MenuLink'
import './Footer.scss'

const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'

export default function Footer() {
  const { data: menuItems = [] } = useSWR('menu:footer', () => getMenu('footer'))
  const tree = buildMenuTree(menuItems)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <section className="site-footer__brand" aria-label="Magicieuse">
            <NavLink to="/" className="site-footer__logo">
              Magicieuse
            </NavLink>
            <p>
              Albums jeunesse, collections sensibles et univers d'artistes pour les
              petits lecteurs curieux.
            </p>
            <div className="site-footer__actions" aria-label="Acces rapides">
              <NavLink to={`/${slugShop}/`}>Boutique</NavLink>
              <NavLink to={`/${slugCart}/`}>Panier</NavLink>
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
            <NavLink to="/mentions-legales/">Mentions legales</NavLink>
            <NavLink to="/conditions-generales-de-vente/">CGV</NavLink>
            <NavLink to="/politique-de-confidentialite/">Confidentialite</NavLink>
          </nav>
        </div>
      </div>
    </footer>
  )
}
