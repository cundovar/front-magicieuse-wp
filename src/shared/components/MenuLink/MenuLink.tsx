import { NavLink, Link } from 'react-router-dom'
import type { WpMenuItem } from '../../api/wordpress'
import { decodeHtml } from '../../utils/html'
import { getWooUrl } from '../../utils/wooUrl'

type Props = {
  item: WpMenuItem
  /** true = NavLink avec classe active (header), false = Link simple (footer) */
  nav?: boolean
  className?: string
}

// Chemins geres par WooCommerce : doivent pointer vers le serveur WP,
// pas vers le routeur React
const WC_PATHS = new Set([
  '/checkout/',
  '/my-account/',
  '/cart/',
  '/commande/',
  '/mon-compte/',
])

export default function MenuLink({ item, nav = false, className }: Props) {
  if (item.is_external) {
    return (
      <a
        href={item.url}
        target={item.target ?? '_blank'}
        rel="noopener noreferrer"
        className={className}
      >
        {decodeHtml(item.title)}
      </a>
    )
  }

  if (WC_PATHS.has(item.path)) {
    return (
      <a href={getWooUrl(item.path)} className={className}>
        {decodeHtml(item.title)}
      </a>
    )
  }

  if (nav) {
    return (
      <NavLink to={item.path} className={className}>
        {decodeHtml(item.title)}
      </NavLink>
    )
  }

  return (
    <Link to={item.path} className={className}>
      {decodeHtml(item.title)}
    </Link>
  )
}
