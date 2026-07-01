# Migration Vite/React → Next.js

## Objectif

Migrer le front headless vers Next.js pour bénéficier du SSG (Static Site Generation) et de l'ISR (Incremental Static Regeneration). Les pages produit, boutique et collections seront pré-générées — navigation instantanée et SEO natif.

Le plugin WordPress `magicieuse-headless-api` et l'API REST ne changent pas.

---

## Branche

```bash
git checkout -b feature/nextjs-migration
```

---

## Étape 1 — Initialisation

```bash
npx create-next-app@latest magicieuse-next --typescript --no-tailwind --no-src-dir --app
cd magicieuse-next
```

Copier depuis le projet actuel :
- `src/shared/` → `app/shared/`
- `src/features/` → `app/features/`
- `src/styles/` → `app/styles/`
- `src/themes/` → `app/themes/`

---

## Étape 2 — Variables d'environnement

| Actuel (Vite) | Next.js |
|---|---|
| `VITE_WP_SITE_URL` | `NEXT_PUBLIC_WP_SITE_URL` |
| `VITE_WP_API_BASE` | `NEXT_PUBLIC_WP_API_BASE` |
| `VITE_SLUG_SHOP` | `NEXT_PUBLIC_SLUG_SHOP` |
| `VITE_SLUG_PRODUCT` | `NEXT_PUBLIC_SLUG_PRODUCT` |
| `VITE_SLUG_COLLECTION` | `NEXT_PUBLIC_SLUG_COLLECTION` |
| `VITE_SLUG_CART` | `NEXT_PUBLIC_SLUG_CART` |

Fichier `.env.local` :
```env
NEXT_PUBLIC_WP_SITE_URL=https://backmagi.varascundo.com
NEXT_PUBLIC_WP_API_BASE=/wp-json
NEXT_PUBLIC_SLUG_SHOP=boutique
NEXT_PUBLIC_SLUG_PRODUCT=produit
NEXT_PUBLIC_SLUG_COLLECTION=collections
NEXT_PUBLIC_SLUG_CART=panier
```

Mettre à jour `src/shared/api/config.ts` et `src/shared/utils/wooUrl.ts` pour utiliser `NEXT_PUBLIC_` au lieu de `VITE_`.

---

## Étape 3 — Routing

### Actuel (React Router)

```
src/App.tsx  →  <Routes>
  /                     → HomePage
  /boutique/            → ShopPage
  /produit/:slug/       → ProductPage
  /collections/:slug/   → CollectionPage
  /panier/              → CartPage
  /contact/             → ContactPage
  /*                    → WpPagePage
```

### Next.js App Router

```
app/
├── layout.tsx                        ← RootLayout (Header, Footer)
├── page.tsx                          ← HomePage
├── boutique/
│   └── page.tsx                      ← ShopPage
├── produit/
│   └── [slug]/
│       └── page.tsx                  ← ProductPage
├── collections/
│   └── [slug]/
│       └── page.tsx                  ← CollectionPage
├── panier/
│   └── page.tsx                      ← CartPage
├── contact/
│   └── page.tsx                      ← ContactPage
└── [slug]/
    └── page.tsx                      ← WpPagePage (catch-all)
```

---

## Étape 4 — Data fetching par type de page

### Pages statiques avec ISR (boutique, produit, collection)

```tsx
// app/produit/[slug]/page.tsx
import { getProductBySlug, getAllProducts } from '@/shared/api/woocommerce'

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export const revalidate = 3600 // re-génère toutes les heures

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  return <ProductView product={product} />
}
```

### Pages dynamiques (panier, compte)

Garder `useSWR` — ces données sont propres à chaque utilisateur, pas cachables.

```tsx
// app/panier/page.tsx
'use client'
import useSWR from 'swr'
// ... identique à l'actuel CartPage
```

---

## Étape 5 — Composants

### Ajouter `'use client'` aux composants avec état ou hooks

```tsx
'use client'  // ← ajouter en haut du fichier

import { useState } from 'react'
// ...
```

Composants concernés :
- `Header` (menu mobile, dropdown panier)
- `CartPage`
- `ProductPage` (quantité, ajout panier)
- `ContactForm`
- Tous les composants avec `useSWR`, `useState`, `useEffect`

### Composants serveur (aucun changement nécessaire)

- Pages statiques sans interactivité
- Layouts

---

## Étape 6 — Images

Remplacer le composant `SmartImage` par `next/image` pour les images WordPress :

```tsx
import Image from 'next/image'

<Image
  src={product.image.url}
  alt={product.name}
  width={product.image.width}
  height={product.image.height}
  priority // pour les images above the fold
/>
```

Ajouter les domaines autorisés dans `next.config.ts` :
```ts
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'backmagi.varascundo.com' },
      { hostname: 'scontent-cdg4-3.cdninstagram.com' },
      { hostname: '*.cdninstagram.com' },
    ],
  },
}
```

---

## Étape 7 — SCSS

Next.js supporte SCSS nativement. Installer :

```bash
npm install sass
```

Les imports SCSS restent identiques. Les CSS Modules (`*.module.scss`) sont supportés si besoin.

---

## Étape 8 — Déploiement Vercel

```bash
npm install -g vercel
vercel
```

Configuration dans `vercel.json` :
```json
{
  "env": {
    "NEXT_PUBLIC_WP_SITE_URL": "https://backmagi.varascundo.com"
  }
}
```

Domaine custom : Vercel Dashboard → Settings → Domains → ajouter `frontmagi.varascundo.com`

---

## Ordre recommandé

1. Init projet Next.js + copie des fichiers
2. Variables d'environnement
3. Layout global (Header, Footer)
4. Page d'accueil (statique)
5. Boutique + fiche produit (SSG + ISR)
6. Collections (SSG + ISR)
7. Panier (client-side, SWR)
8. Pages WP dynamiques
9. Contact
10. Déploiement Vercel

---

## Ce qui ne change pas

- Plugin WordPress `magicieuse-headless-api` (aucune modification)
- API REST WooCommerce
- Styles SCSS et système de thèmes CSS
- Logique métier dans `src/shared/api/`
