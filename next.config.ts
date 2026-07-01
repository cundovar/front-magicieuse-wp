import type { NextConfig } from 'next'

// Origine WordPress (dev: http://localhost/MAGICIEUSE/htdocs, prod: https://backmagi.varascundo.com)
const WP_ORIGIN = (process.env.NEXT_PUBLIC_WP_SITE_URL || '').replace(/\/$/, '')
const WP_API_BASE = (process.env.NEXT_PUBLIC_WP_API_BASE || '/wp-json').replace(/\/$/, '')

const nextConfig: NextConfig = {
  // URLs canoniques avec slash final (comme WordPress) → évite les 308 sur la nav interne.
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'backmagi.varascundo.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  // Proxy same-origin des appels API côté client (équivalent du proxy Vite).
  // Indispensable pour le panier (credentials: 'include' / cookies WP).
  async rewrites() {
    if (!WP_ORIGIN) return []
    return [
      {
        source: `${WP_API_BASE}/:path*`,
        destination: `${WP_ORIGIN}${WP_API_BASE}/:path*`,
      },
    ]
  },
}

export default nextConfig
