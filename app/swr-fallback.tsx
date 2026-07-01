'use client'

import { SWRConfig, unstable_serialize } from 'swr'
import type { Key } from 'swr'

type Entry = [Key, unknown]

/**
 * Injecte des données pré-fetchées côté serveur (RSC/SSG) dans le cache SWR
 * via `fallback`, pour que les composants client rendent le contenu dès le
 * premier paint (SEO/SSG) sans état de chargement, puis revalident.
 * Fusionne avec la config SWR globale (Providers) au lieu de la remplacer.
 */
export function SwrFallback({
  entries,
  children,
}: {
  entries: Entry[]
  children: React.ReactNode
}) {
  const fallback: Record<string, unknown> = {}
  for (const [key, data] of entries) {
    fallback[unstable_serialize(key)] = data
  }
  return <SWRConfig value={{ fallback }}>{children}</SWRConfig>
}
