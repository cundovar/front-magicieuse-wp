# SEO — La Magicieuse (Next.js App Router + WordPress/WooCommerce headless)

Guide pratique pour travailler le référencement du front Next.js. La base technique
(SSG/ISR, contenu dans le HTML, URLs en `/…/`) est déjà en place — ce doc couvre les
**leviers restants**, par priorité d'impact, avec le code prêt à copier.

Domaine de production : `https://frontmagi.varascundo.com` (à ajuster si différent).

---

## Priorités (par impact)

| # | Levier | Impact | Effort |
|---|---|---|---|
| 1 | Métadonnées dynamiques par page (`generateMetadata`) | ⭐⭐⭐ | moyen |
| 2 | `metadataBase` + canonical | ⭐⭐ | faible |
| 3 | `sitemap.xml` + `robots.txt` | ⭐⭐⭐ | faible |
| 4 | JSON-LD (Product / Breadcrumb / Organization) | ⭐⭐⭐ | moyen |
| 5 | `next/image` (LCP / Core Web Vitals) | ⭐⭐ | moyen |
| 6 | Alt images, headings, Open Graph images | ⭐ | faible |

**Faire d'abord 1 + 3 + 4** = ~80 % du SEO d'un e-commerce headless.

---

## 1. Métadonnées dynamiques par page

Aujourd'hui seul `app/layout.tsx` définit un `title`/`description` **global** → toutes les
pages partagent le même titre (mauvais). Chaque route doit exporter un `generateMetadata`
qui réutilise les fonctions API existantes (`src/shared/api/`).

### Fiche produit — `app/produit/[slug]/page.tsx`
```ts
import type { Metadata } from 'next'

const stripHtml = (s = '') => s.replace(/<[^>]+>/g, '').trim()

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return { title: 'Produit introuvable — La Magicieuse' }

  const description = stripHtml(p.short_description).slice(0, 160)
  return {
    title: `${p.name} — La Magicieuse`,
    description,
    alternates: { canonical: `/produit/${slug}/` },
    openGraph: {
      title: p.name,
      description,
      type: 'website',
      images: p.images?.[0]?.src ? [{ url: p.images[0].src }] : [],
    },
  }
}
```

### Collection — `app/collections/[slug]/page.tsx`
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const c = await getCollection(slug)
  return {
    title: `${c?.name ?? 'Collection'} — La Magicieuse`,
    description: stripHtml(c?.description).slice(0, 160),
    alternates: { canonical: `/collections/${slug}/` },
  }
}
```

### Page WP — `app/[slug]/page.tsx`
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const content = await getContent(slug).catch(() => null)
  if (!content) return {}
  return {
    title: `${content.title} — La Magicieuse`,
    description: stripHtml(content.content).slice(0, 160),
    alternates: { canonical: `/${slug}/` },
  }
}
```

### Boutique / Accueil
Titres statiques suffisent (`export const metadata = {...}` dans la page), avec un
`title` + `description` distincts (« Boutique — La Magicieuse », etc.).

> Note : `generateMetadata` et le composant de page **partagent le même cache de fetch**
> (Next dédoublonne les `fetch` identiques dans un même rendu), donc pas de double appel réseau.

---

## 2. `metadataBase` + canonical global

Dans `app/layout.tsx` :
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://frontmagi.varascundo.com'),
  title: {
    default: 'La Magicieuse — Maison d’édition jeunesse',
    template: '%s', // les pages fournissent déjà "… — La Magicieuse"
  },
  description: 'Albums jeunesse, collections sensibles et univers d’artistes…',
  authors: [{ name: 'Facundo Varas', url: 'https://github.com/cundovar' }],
  creator: 'Facundo Varas',
}
```
`metadataBase` rend les URLs Open Graph/canonical **absolues** (obligatoire pour le partage
social) et cohérentes avec le `trailingSlash: true` déjà activé.

---

## 3. sitemap.xml + robots.txt (générés par Next)

### `app/sitemap.ts`
```ts
import type { MetadataRoute } from 'next'
import { getProducts } from '@/shared/api/woocommerce'
import { getPages, getProductCategories } from '@/shared/api/wordpress' // ajuster imports

const BASE = 'https://frontmagi.varascundo.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getPages(),
  ])
  return [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/boutique/`, changeFrequency: 'daily', priority: 0.9 },
    ...products.map((p) => ({ url: `${BASE}/produit/${p.slug}/`, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${BASE}/collections/${c.slug}/`, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${BASE}/${p.slug}/`, priority: 0.5 })),
  ]
}
```
Accessible sur `/sitemap.xml`.

### `app/robots.ts`
```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api-check/', '/panier/'] },
    sitemap: 'https://frontmagi.varascundo.com/sitemap.xml',
  }
}
```
On exclut `/panier/` et `/api-check/` de l'indexation (pages non pertinentes SEO).

---

## 4. Données structurées JSON-LD (rich results Google)

Un `<script type="application/ld+json">` injecté dans la fiche produit → Google peut afficher
**prix, disponibilité, image** directement dans les résultats.

Dans `app/produit/[slug]/page.tsx` (RSC), après avoir fetch `product` :
```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.images?.map((i) => i.src),
  description: stripHtml(product.short_description),
  offers: {
    '@type': 'Offer',
    priceCurrency: product.prices?.currency_code ?? 'EUR',
    price: (Number(product.prices?.price) / 10 ** product.prices?.currency_minor_unit).toFixed(2),
    availability: product.is_in_stock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `https://frontmagi.varascundo.com/produit/${slug}/`,
  },
}
// dans le JSX :
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

À prévoir aussi :
- **`Organization`** (logo, nom, réseaux) une fois dans `app/layout.tsx`.
- **`BreadcrumbList`** sur produit/collection (Accueil › Boutique › Produit).
- Valider avec le **Rich Results Test** de Google.

---

## 5. Performance / Core Web Vitals

- **`next/image`** (actuellement `SmartImage` = `<img>` simple) → optimisation auto (formats
  modernes, lazy, `priority` pour l'image above-the-fold) → améliore le **LCP**, facteur de
  ranking. `remotePatterns` déjà configuré dans `next.config.ts`.
- **Vercel Speed Insights** → activer pour mesurer les Core Web Vitals réels.
- Garder les fiches produit en **SSG/ISR** (déjà le cas) → TTFB minimal.

---

## 6. Hygiène de contenu

- **`alt`** descriptif sur toutes les images (déjà partiel via `SmartImage`).
- Un seul **`<h1>`** par page, hiérarchie `h2/h3` cohérente.
- **Open Graph image** par produit (via `openGraph.images` du `generateMetadata`, cf. §1).
- Descriptions ≤ ~160 caractères, uniques par page.

---

## Checklist de mise en œuvre

- [ ] `generateMetadata` sur produit, collection, page WP, boutique, accueil (§1)
- [ ] `metadataBase` + `title.template` dans le layout (§2)
- [ ] `app/sitemap.ts` + `app/robots.ts` (§3)
- [ ] JSON-LD `Product` sur les fiches produit (§4)
- [ ] JSON-LD `Organization` + `BreadcrumbList` (§4)
- [ ] Migration `SmartImage` → `next/image` (§5)
- [ ] Activer Vercel Speed Insights (§5)
- [ ] Vérifier via Google Rich Results Test + Search Console (soumettre le sitemap)

---

## Outils de validation

- **Google Search Console** — soumettre `sitemap.xml`, suivre l'indexation.
- **Rich Results Test** (`search.google.com/test/rich-results`) — valider le JSON-LD.
- **PageSpeed Insights** / **Lighthouse** — Core Web Vitals.
- **View Source (Ctrl+U)** — vérifier que title/description/JSON-LD sont bien dans le HTML statique.
