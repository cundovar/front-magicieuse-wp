const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&nbsp;': ' ',
}

/**
 * Decode les entites HTML courantes presentes dans les titres et noms
 * renvoyés par WordPress/WooCommerce.
 * A utiliser uniquement pour du texte brut — pas pour du HTML a injecter.
 */
export function decodeHtml(html: string): string {
  return html.replace(
    /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-z][a-z0-9]*));/gi,
    (match, dec, hex, name) => {
      if (dec) return String.fromCharCode(Number(dec))
      if (hex) return String.fromCharCode(parseInt(hex, 16))
      return NAMED_ENTITIES[`&${name};`] ?? match
    },
  )
}
