'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { getTheme } from '@/shared/api/wordpress'
import { applyTheme, applyThemeFromApi, STORAGE_KEY, DEFAULT_THEME } from '@/shared/utils/theme'

/**
 * Gère le thème côté client :
 * - au montage, réapplique le thème caché (injecte la police Google Fonts) ;
 * - quand l'API répond, applique le thème serveur et le mémorise.
 * Le data-theme est déjà posé avant hydratation par le script inline du layout (anti-flash).
 */
export function ThemeSync() {
  const { data } = useSWR('theme', getTheme)

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
    applyTheme(cached)
  }, [])

  useEffect(() => {
    if (data?.theme) applyThemeFromApi(data.theme)
  }, [data?.theme])

  return null
}
