export const STORAGE_KEY = 'magicieuse_theme'
export const DEFAULT_THEME = 'magicieuse'

const THEME_FONTS: Record<string, string> = {
  magicieuse:
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=DM+Sans:wght@300;400;500;600&display=swap',
  'magicieuse-clair':
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300..800&display=swap',
  'field-folio':
    'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,500&family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap',
}

export function applyTheme(theme: string) {
  document.documentElement.dataset.theme = theme
  const fontUrl = THEME_FONTS[theme]
  if (fontUrl && !document.querySelector(`link[data-theme-font="${theme}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontUrl
    link.dataset.themeFont = theme
    document.head.appendChild(link)
  }
}

export function applyThemeFromApi(theme: string) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}
