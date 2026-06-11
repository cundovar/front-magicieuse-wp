import { fetchJson, fetchJsonMutation, getStoreApiHeaders } from './config'

const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'

export type WooImage = {
  id: number
  src: string
  thumbnail: string
  srcset: string
  sizes: string
  name: string
  alt: string
}

export type WooPrice = {
  price: string
  regular_price: string
  sale_price: string
  currency_code: string
  currency_symbol: string
  currency_minor_unit: number
}

export type WooProduct = {
  id: number
  name: string
  slug: string
  permalink: string
  type: string
  sku: string
  short_description: string
  description: string
  on_sale: boolean
  prices: WooPrice
  images: WooImage[]
  categories?: Array<{
    id: number
    name: string
    slug: string
  }>
  is_purchasable: boolean
  is_in_stock: boolean
  is_on_backorder: boolean
  low_stock_remaining: number | null
  stock_availability: {
    text: string
    class: string
  }
  formatted_weight: string
  formatted_dimensions: string
  add_to_cart: {
    text: string
    description: string
    url?: string
  }
}

export type WooCategory = {
  id: number
  name: string
  slug: string
  parent?: number
  count?: number
  image?: WooImage
}

export type WooCartItem = {
  key: string
  id: number
  quantity: number
  name: string
  short_description: string
  permalink?: string
  images: WooImage[]
  prices: WooPrice
}

export type WooCartCoupon = {
  code: string
  discount_type: string
  totals: {
    total_discount: string
    currency_code: string
    currency_minor_unit: number
  }
}

export type WooCartError = {
  code: string
  message: string
}

export type WooCart = {
  items: WooCartItem[]
  items_count: number
  coupons: WooCartCoupon[]
  errors: WooCartError[]
  totals: {
    total_items: string
    total_discount: string
    total_shipping: string | null
    total_price: string
    total_tax: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
}

function getProductSlug(product: WooProduct) {
  if (product.slug) {
    return product.slug
  }

  const slug = product.permalink.match(new RegExp(`/${slugProduct}/([^/]+)/?`))?.[1]

  return slug ?? String(product.id)
}

function normalizeProduct(product: WooProduct): WooProduct {
  return {
    ...product,
    slug: getProductSlug(product),
  }
}

export async function getProducts() {
  const products = await fetchJson<WooProduct[]>('/wc/store/products?per_page=100')

  return products.map(normalizeProduct)
}

export async function getProductsByCategory(categorySlug: string) {
  const products = await fetchJson<WooProduct[]>(
    `/wc/store/products?category=${encodeURIComponent(categorySlug)}&per_page=100`,
  )

  return products.map(normalizeProduct)
}

export async function getProductBySlug(slug: string) {
  const products = await fetchJson<WooProduct[]>(
    `/wc/store/products?slug=${encodeURIComponent(slug)}`,
  )

  return products[0] ? normalizeProduct(products[0]) : null
}

export async function getProductCategories() {
  try {
    return await fetchJson<WooCategory[]>('/wc/store/products/categories')
  } catch {
    const products = await getProducts()
    const categories = new Map<number, WooCategory>()

    for (const product of products) {
      if (!Array.isArray(product.categories)) {
        continue
      }

      for (const category of product.categories) {
        categories.set(category.id, category)
      }
    }

    return Array.from(categories.values())
  }
}

export function getCart() {
  return fetchJson<WooCart>('/wc/store/cart', {
    credentials: 'include',
    headers: getStoreApiHeaders(),
  })
}

export function addToCart(productId: number, quantity = 1) {
  return fetchJsonMutation<WooCart>('/wc/store/cart/add-item', {
    id: productId,
    quantity,
  })
}

export function removeFromCart(key: string) {
  return fetchJsonMutation<WooCart>('/wc/store/cart/remove-item', { key })
}

export function updateCartItem(key: string, quantity: number) {
  return fetchJsonMutation<WooCart>('/wc/store/cart/update-item', {
    key,
    quantity,
  })
}
