import { CACHE_TAGS, WP_CONTENT_REVALIDATE, fetchJson, type FetchJsonOptions } from './config'
import { getFallbackMenu } from './menuFallback'
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
  image: WpBlockImageData | null
  parent: number
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
  featured_image: WpBlockImageData | null
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

export type WpBlockCategoryData = {
  id: number
  name: string
  slug: string
  description: string
  count: number
  image: WpBlockImageData | null
}

export type WpBlockSlide = {
  title?: string
  text?: string
  imageId?: number
  image?: WpBlockImageData | null
  buttonLabel?: string
  buttonUrl?: string
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
    images?: WpBlockImageData[]
    button?: WpBlockButtonData | null
    buttons?: WpBlockButtonData[]
    products?: WooProduct[]
    product?: WooProduct | null
    categories?: WpBlockCategoryData[]
    slides?: WpBlockSlide[] | null
    priceRange?: { min: number; max: number }
    title?: string
    limit?: number
    themes?: Array<{ id: number; name: string; slug: string }>
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

export type InstagramItem = {
  id: string
  media_id: string
  media_type: string
  media_url: string
  permalink: string
  caption: string
  timestamp: string
  username: string
  aspect_ratio: number | null
}

export type InstagramFeed = {
  configured: boolean
  items: InstagramItem[]
}

export function getPages() {
  return fetchJson<WordPressPage[]>('/wp/v2/pages?per_page=100', {
    next: { revalidate: WP_CONTENT_REVALIDATE, tags: [CACHE_TAGS.pages] },
  })
}

export async function getPageBySlug(slug: string) {
  const pages = await fetchJson<WordPressPage[]>(
    `/wp/v2/pages?slug=${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: WP_CONTENT_REVALIDATE,
        tags: [CACHE_TAGS.pages, CACHE_TAGS.content(slug)],
      },
    },
  )

  return pages[0] ?? null
}

export type WpBrandPerson = {
  id: number
  name: string
  slug: string
}

export type WpProductBrandRole = {
  id: number
  name: string
  slug: string
  people: WpBrandPerson[]
}

export function getCollection(slug: string) {
  return fetchJson<WpCollection>(
    `/magicieuse/v1/collection/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: WP_CONTENT_REVALIDATE,
        tags: [CACHE_TAGS.productCategories, CACHE_TAGS.collection(slug)],
      },
    },
  )
}

export function getProductBrands(slug: string) {
  return fetchJson<WpProductBrandRole[]>(
    `/magicieuse/v1/product/${encodeURIComponent(slug)}/brands`,
    {
      next: {
        revalidate: WP_CONTENT_REVALIDATE,
        tags: [CACHE_TAGS.products, CACHE_TAGS.product(slug)],
      },
    },
  )
}

export function getInstagramFeed({
  limit = 8,
  feedId,
}: { limit?: number; feedId?: string } = {}) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (feedId) params.set('feed_id', feedId)

  return fetchJson<InstagramFeed>(`/magicieuse/v1/instagram?${params.toString()}`, {
    next: {
      revalidate: WP_CONTENT_REVALIDATE,
      tags: [CACHE_TAGS.instagram, CACHE_TAGS.front],
    },
  })
}

export function getInstagramProxyImageUrl(url: string) {
  if (!url) return ''

  return `/wp-json/magicieuse/v1/instagram/image?url=${encodeURIComponent(url)}`
}

/**
 * Endpoint custom pages uniquement (garde pour compatibilite).
 * Preferer getContent() qui gere aussi les articles.
 */
export function getPageContent(slug: string) {
  return fetchJson<WpPageContent>(
    `/magicieuse/v1/page/${encodeURIComponent(slug)}`,
    {
      next: {
        revalidate: WP_CONTENT_REVALIDATE,
        tags: [CACHE_TAGS.pages, CACHE_TAGS.content(slug)],
      },
    },
  )
}

/**
 * Endpoint generique : cherche une page puis un article WordPress.
 * Rend le contenu via apply_filters('the_content') cote PHP.
 */
export function getContent(slug: string, options: FetchJsonOptions = {}) {
  return fetchJson<WpContent>(
    `/magicieuse/v1/content/${encodeURIComponent(slug)}`,
    {
      ...options,
      next: {
        ...options.next,
        revalidate: WP_CONTENT_REVALIDATE,
        tags: [CACHE_TAGS.pages, CACHE_TAGS.content(slug), ...(options.next?.tags ?? [])],
      },
    },
  )
}

export type WpFrontData = {
  theme: string
  page: WpContent
  blocks: WpBlocksContent
}

export function getFront() {
  return fetchJson<WpFrontData>('/magicieuse/v1/front', {
    next: {
      revalidate: WP_CONTENT_REVALIDATE,
      tags: [CACHE_TAGS.front, CACHE_TAGS.products, CACHE_TAGS.productCategories],
    },
  })
}

export function getTheme() {
  return fetchJson<{ theme: string }>('/magicieuse/v1/theme', {
    next: {
      revalidate: WP_CONTENT_REVALIDATE,
      tags: [CACHE_TAGS.theme, CACHE_TAGS.front],
    },
  })
}

export function getFrontPage() {
  return fetchJson<WpContent>('/magicieuse/v1/front-page', {
    next: { revalidate: WP_CONTENT_REVALIDATE, tags: [CACHE_TAGS.front] },
  })
}

export function getFrontPageBlocks() {
  return fetchJson<WpBlocksContent>('/magicieuse/v1/front-page-blocks', {
    next: { revalidate: WP_CONTENT_REVALIDATE, tags: [CACHE_TAGS.front] },
  })
}

export function getPageBlocks(slug: string, options: FetchJsonOptions = {}) {
  return fetchJson<WpBlocksContent>(
    `/magicieuse/v1/page/${encodeURIComponent(slug)}/blocks`,
    {
      ...options,
      next: {
        ...options.next,
        revalidate: WP_CONTENT_REVALIDATE,
        tags: [
          CACHE_TAGS.pages,
          CACHE_TAGS.content(slug),
          CACHE_TAGS.pageBlocks(slug),
          CACHE_TAGS.products,
          CACHE_TAGS.productCategories,
          ...(options.next?.tags ?? []),
        ],
      },
    },
  )
}

export function getMedia() {
  return fetchJson<WordPressMedia[]>('/wp/v2/media', {
    next: { revalidate: WP_CONTENT_REVALIDATE, tags: [CACHE_TAGS.pages] },
  })
}

export async function getMenu(location: string): Promise<WpMenuItem[]> {
  try {
    return await fetchJson<WpMenuItem[]>(
      `/magicieuse/v1/menu/${encodeURIComponent(location)}`,
      {
        next: {
          revalidate: WP_CONTENT_REVALIDATE,
          tags: [CACHE_TAGS.menus, CACHE_TAGS.menu(location)],
        },
      },
    )
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[menu] Impossible de charger l'emplacement "${location}" :`, err)
    }
    return getFallbackMenu(location)
  }
}
