'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { WpMenuItem } from '../../api/wordpress'
import { decodeHtml } from '../../utils/html'
import { getWooUrl } from '../../utils/wooUrl'

type Props = {
  item: WpMenuItem
  /** true = lien avec classe active (header), false = lien simple (footer) */
  nav?: boolean
  className?: string
}

// Chemins geres par WooCommerce : doivent pointer vers le serveur WP,
// pas vers le routeur Next
const WC_PATHS = new Set([
  '/checkout/',
  '/my-account/',
  '/cart/',
  '/commande/',
  '/mon-compte/',
])

export default function MenuLink({ item, nav = false, className }: Props) {
  const pathname = usePathname()

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
    const isActive = pathname === item.path
    const navClassName = [className, isActive ? 'active' : ''].filter(Boolean).join(' ')
    return (
      <Link href={item.path} className={navClassName} aria-current={isActive ? 'page' : undefined}>
        {decodeHtml(item.title)}
      </Link>
    )
  }

  return (
    <Link href={item.path} className={className}>
      {decodeHtml(item.title)}
    </Link>
  )
}
