const DEFAULT_API_BASE = '/wp-json'

// Base relative côté client : proxifiée same-origin par next.config (cookies panier OK).
const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE?.replace(/\/$/, '') || DEFAULT_API_BASE

// Côté serveur (RSC/SSG/ISR), fetch exige une URL absolue → on préfixe l'origine WordPress.
const SERVER_ORIGIN = (process.env.NEXT_PUBLIC_WP_SITE_URL || '').replace(/\/$/, '')

export const WP_API_BASE =
  typeof window === 'undefined' ? `${SERVER_ORIGIN}${CLIENT_API_BASE}` : CLIENT_API_BASE

const CART_TOKEN_STORAGE_KEY = 'magicieuse_cart_token'

let cachedCartToken: string | null = null

function getStoredCartToken(): string | null {
  if (cachedCartToken) return cachedCartToken
  if (typeof window === 'undefined') return null

  cachedCartToken = window.localStorage.getItem(CART_TOKEN_STORAGE_KEY)
  return cachedCartToken
}

export function hasCartToken(): boolean {
  return !!getStoredCartToken()
}

function storeCartToken(token: string | null) {
  if (!token) return

  cachedCartToken = token

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CART_TOKEN_STORAGE_KEY, token)
  }
}

export function getStoreApiHeaders(): HeadersInit {
  const cartToken = getStoredCartToken()

  return cartToken ? { 'Cart-Token': cartToken } : {}
}

export async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Serveur : force-cache => les lectures participent au SSG/ISR (revalidate défini au niveau route).
  // Client : cache HTTP standard.
  const defaultCache: RequestCache =
    typeof window === 'undefined' ? 'force-cache' : 'default'
  const response = await fetch(`${WP_API_BASE}${path}`, { cache: defaultCache, ...options })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

let cachedNonce: string | null = null

function readStoreApiNonce(response: Response): string | null {
  return (
    response.headers.get('Nonce') ??
    response.headers.get('X-WC-Store-API-Nonce')
  )
}

function rememberStoreApiSession(response: Response) {
  storeCartToken(response.headers.get('Cart-Token'))
}

async function resolveNonce(): Promise<string | null> {
  if (cachedNonce) return cachedNonce
  const response = await fetch(`${WP_API_BASE}/wc/store/cart`, {
    credentials: 'include',
    headers: getStoreApiHeaders(),
  })
  rememberStoreApiSession(response)
  cachedNonce = readStoreApiNonce(response)
  return cachedNonce
}

export function invalidateNonce() {
  cachedNonce = null
}

export async function fetchJsonMutation<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const nonce = await resolveNonce()

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  Object.assign(headers, getStoreApiHeaders())
  if (nonce) headers['Nonce'] = nonce

  const response = await fetch(`${WP_API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  })

  rememberStoreApiSession(response)
  const freshNonce = readStoreApiNonce(response)
  if (freshNonce) cachedNonce = freshNonce

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message = (errorData as { message?: string }).message
    throw new Error(
      message ?? `API request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}
