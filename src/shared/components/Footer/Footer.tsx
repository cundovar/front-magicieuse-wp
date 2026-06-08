import { useEffect, useState } from 'react'
import { getMenu } from '../../api/wordpress'
import { buildMenuTree, type MenuItem } from '../../utils/menu'
import MenuLink from '../MenuLink/MenuLink'
import './Footer.scss'

export default function Footer() {
  const [tree, setTree] = useState<MenuItem[]>([])

  useEffect(() => {
    void getMenu('footer').then((items) => setTree(buildMenuTree(items)))
  }, [])

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
