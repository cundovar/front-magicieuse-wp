import { applyTheme, STORAGE_KEY, DEFAULT_THEME } from './shared/utils/theme'

// Applique le theme immediatement depuis le cache pour eviter le flash
const cached = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
applyTheme(cached)

export default function ThemeLoader() {
  return null
}
