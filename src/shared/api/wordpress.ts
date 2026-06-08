import { fetchJson } from './config'
import type { WooProduct } from './woocommerce'

export type WordPressRendered = {
  rendered: string
}

export type WordPressPage = {
  id: number
  slug: string
  link: string
  parent: number
  menu_order: number
  title: WordPressRendered
  content: WordPressRendered
  excerpt: WordPressRendered
  featured_media: number
}

export type WordPressMedia = {
  id: number
  alt_text: string
  source_url: string
  media_details?: {
    width?: number
    height?: number
    sizes?: Record<
      string,
      {
        source_url: string
        width: number
        height: number
      }
    >
  }
}

export type WpMenuItem = {
  id: number
  title: string
  url: string
  path: string
  target: string | null
  parent: number
  order: number
  is_external: boolean
  object_type: string
}

export type WpCollection = {
  id: number
  name: string
  slug: string
  description: string
  count: number
  image: string | null
}

export type WpPageContent = {
  id: number
  slug: string
  title: string
  content: string
}

export type WpContent = {
  id: number
  slug: string
  type: 'page' | 'post'
  title: string
  content: string
  excerpt: string
  date: string
}

export type WpBlockImageData = {
  id: number
  url: string
  width: number
  height: number
  alt: string
  srcset: string
  sizes: string
  caption: string
}

export type WpBlockButtonData = {
  label: string
  url: string
  target: string | null
  rel: string | null
  className: string | null
}

export type WpBlock = {
  blockName: string | null
  attrs: Record<string, unknown>
  innerHTML: string
  innerContent: unknown[]
  innerBlocks: WpBlock[]
  renderedHTML: string
  data: {
    image?: WpBlockImageData | null
    button?: WpBlockButtonData | null
    buttons?: WpBlockButtonData[]
    products?: WooProduct[]
  } | null
}

export type WpBlocksContent = {
  meta: {
    id: number
    slug: string
    type: 'page' | 'post'
    title: string
    date: string
  }
  blocks: WpBlock[]
}

export function getPages() {
  return fetchJson<WordPressPage[]>('/wp/v2/pages')
}

export async function getPageBySlug(slug: string) {
  const pages = await fetchJson<WordPressPage[]>(
    `/wp/v2/pages?slug=${encodeURIComponent(slug)}`,
  )

  return pages[0] ?? null
}

export function getCollection(slug: string) {
  return fetchJson<WpCollection>(
    `/magicieuse/v1/collection/${encodeURIComponent(slug)}`,
  )
}

/**
 * Endpoint custom pages uniquement (garde pour compatibilite).
 * Preferer getContent() qui gere aussi les articles.
 */
export function getPageContent(slug: string) {
  return fetchJson<WpPageContent>(
    `/magicieuse/v1/page/${encodeURIComponent(slug)}`,
  )
}

/**
 * Endpoint generique : cherche une page puis un article WordPress.
 * Rend le contenu via apply_filters('the_content') cote PHP.
 */
export function getContent(slug: string) {
  return fetchJson<WpContent>(
    `/magicieuse/v1/content/${encodeURIComponent(slug)}`,
  )
}

export function getFrontPage() {
  return fetchJson<WpContent>('/magicieuse/v1/front-page')
}

export function getFrontPageBlocks() {
  return fetchJson<WpBlocksContent>('/magicieuse/v1/front-page-blocks')
}

export function getPageBlocks(slug: string) {
  return fetchJson<WpBlocksContent>(
    `/magicieuse/v1/page/${encodeURIComponent(slug)}/blocks`,
  )
}

export function getMedia() {
  return fetchJson<WordPressMedia[]>('/wp/v2/media')
}

// Cache par emplacement — les erreurs ne sont pas cachees pour permettre une nouvelle tentative
const _menuCache = new Map<string, WpMenuItem[]>()

export async function getMenu(location: string): Promise<WpMenuItem[]> {
  const cached = _menuCache.get(location)
  if (cached !== undefined) return cached

  try {
    const items = await fetchJson<WpMenuItem[]>(
      `/magicieuse/v1/menu/${encodeURIComponent(location)}`,
    )
    _menuCache.set(location, items)
    return items
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[menu] Impossible de charger l'emplacement "${location}" :`, err)
    }
    return []
  }
}
