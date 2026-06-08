/**
 * URL de base du site WordPress — sans slash final.
 *
 * En developpement : le front React tourne sur un port different de WordPress
 * (ex: :5173 vs :80). Un lien relatif /checkout/ irait vers Vite, pas WP.
 * VITE_WP_SITE_URL corrige ca en rendant ces URLs absolues.
 *
 * En production sur le meme domaine : laisser VITE_WP_SITE_URL vide,
 * getWooUrl retourne le chemin relatif — le serveur WP/React partage le domaine.
 */
const WP_SITE_URL =
  (import.meta.env.VITE_WP_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
  (import.meta.env.VITE_WP_API_BASE as string | undefined)?.replace(/\/wp-json\/?$/, '') ??
  ''

/**
 * Retourne l'URL absolue d'une route WooCommerce native.
 * Si WP_SITE_URL n'est pas configure, retourne le chemin relatif.
 */
export function getWooUrl(path: string): string {
  const inputPath = path.startsWith('/') ? path : `/${path}`
  const p = inputPath === '/mon-compte/' ? '/my-account/' : inputPath

  return WP_SITE_URL ? `${WP_SITE_URL}${p}` : p
}
