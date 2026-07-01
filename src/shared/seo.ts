import { decodeHtml } from './utils/html'

/** URL absolue du site (surchargée via NEXT_PUBLIC_SITE_URL sur Vercel si besoin). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://frontmagi.varascundo.com'
).replace(/\/$/, '')

export const SITE_NAME = 'La Magicieuse'

/**
 * Transforme du HTML WordPress en description meta propre :
 * retire les balises, décode les entités, compacte les espaces, tronque à ~160 car.
 */
export function metaDescription(html: string | undefined, max = 160): string {
  if (!html) return ''
  const text = decodeHtml(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/** Convertit un prix Woo (unités mineures) en montant décimal ("12.50"). */
export function decimalPrice(minor: string, minorUnit: number): string {
  const n = Number(minor)
  if (!Number.isFinite(n)) return '0.00'
  return (n / 10 ** minorUnit).toFixed(minorUnit)
}
