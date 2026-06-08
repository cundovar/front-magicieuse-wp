import useSWR from 'swr'
import { getMenu } from '../../api/wordpress'
import { buildMenuTree } from '../../utils/menu'
import MenuLink from '../MenuLink/MenuLink'
import './Footer.scss'

export default function Footer() {
  const { data: menuItems = [] } = useSWR('menu:footer', () => getMenu('footer'))
  const tree = buildMenuTree(menuItems)

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__copy">© {new Date().getFullYear()} Magicieuse</p>
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
    </footer>
  )
}
