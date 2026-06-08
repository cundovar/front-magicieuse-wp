# Architecture React — choix et conseils

Pour le front headless WordPress / WooCommerce.

## 1. Framework : CSR vs SSR

| Option | Avantages | Inconvenients |
|---|---|---|
| Vite / React (actuel) | Simple, rapide a developper | SEO natif limite si on reste en pur CSR |
| Next.js (App Router) | SSR / SSG natif, SEO, images, routing | Plus complexe, build plus lourd |
| Remix | SSR + data loading propre | Moins de ressources et plugins |

### Decision : rester sur Vite / React

Le projet reste sur Vite / React pour l'instant.

Next.js serait meilleur pour du SSR / SSG natif, mais ce n'est pas la priorite actuelle.
Il faut d'abord stabiliser :

- les routes React ;
- les appels API WordPress/WooCommerce ;
- les pages boutique, produit et collection ;
- le role exact du panier et du checkout.

La migration vers Next.js n'est donc pas retenue maintenant.

---

## 2. SEO avec Vite / React

Vite / React peut quand meme etre optimise pour le SEO, meme sans Next.js.

Il faut simplement eviter de rester sur une SPA basique sans meta, sans sitemap et sans donnees structurees.

### Actions SEO a prevoir

| Action | Utilite |
|---|---|
| URLs propres | Permettre des pages produit et collection lisibles |
| Meta dynamiques | Gerer title, description, canonical, Open Graph |
| Sitemap XML | Aider Google a decouvrir produits et collections |
| JSON-LD produit | Exposer prix, disponibilite, image et description |
| Performance | Ameliorer l'experience et les Web Vitals |
| Pre-rendu statique plus tard | Generer du HTML pour les routes importantes |

### URLs a garder

```text
/boutique/
/produit/:slug/
/collections/:slug/
```

### Meta dynamiques

Utiliser une librairie comme :

```bash
npm install react-helmet-async
```

Elle permettra de gerer par page :

- `<title>` ;
- meta description ;
- canonical ;
- Open Graph ;
- Twitter cards.

Exemple sur une fiche produit :

```tsx
<Helmet>
  <title>{product.name} - La Magicieuse</title>
  <meta name="description" content={product.short_description} />
  <link rel="canonical" href={`https://example.com/produit/${product.slug}/`} />
</Helmet>
```

### Donnees structurees produit

Sur chaque fiche produit, ajouter un JSON-LD `Product`.

Exemple :

```tsx
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.[0]?.src,
    description: product.short_description,
    offers: {
      '@type': 'Offer',
      price: product.prices.price,
      priceCurrency: product.prices.currency_code,
      availability: product.is_in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  })}
</script>
```

### Sitemap

Generer un sitemap depuis les produits et categories WooCommerce.

Routes a inclure :

```text
/
/boutique/
/produit/slug-produit/
/collections/slug-categorie/
```

Le sitemap peut etre genere par un script Node qui appelle l'API WordPress/WooCommerce.

### Pre-rendu plus tard

Si le SEO produit devient prioritaire, mais sans passer a Next.js, etudier :

- `vite-ssg` ;
- `react-snap` ;
- un script custom qui genere du HTML statique pour les routes produits ;
- ou une solution de pre-render deploy.

Decision actuelle :

```text
Rester sur Vite / React
Ameliorer le SEO avec meta, sitemap, JSON-LD et performance
Reporter le pre-rendu a plus tard
```

---

## 3. Etat global

| Option | Quand l'utiliser |
|---|---|
| Context API (actuel) | 1 ou 2 etats simples — compteur panier OK |
| Zustand | Plusieurs etats, mutations frequentes |
| Redux Toolkit | Application tres grande, grande equipe |
| Jotai | Etat atomique, composants independants |

### Conseil : Zustand des que le panier grossit

Le `CartContext` actuel tient pour le compteur.
Des qu'on ajoute des donnees produit en cache, des toasts ou des etats de chargement globaux,
Zustand est plus propre que plusieurs Context imbriques.

```ts
// Un store Zustand vs plusieurs Context imbriques
const useStore = create((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
}))
```

---

## 4. Fetching de donnees

**Probleme actuel** : chaque page gere son propre `useEffect + useState + setStatus('loading')`.
C'est repetitif et sans cache.

| Option | Ce que ca apporte |
|---|---|
| useEffect manuel (actuel) | Tout a la main, pas de cache |
| TanStack Query | Cache, deduplication, revalidation, etats loading / error automatiques |
| SWR | Plus leger, mais moins complet que TanStack |

### Conseil : TanStack Query

`ShopPage`, `ProductPage`, `CollectionPage` deviennent chacun une ligne.

```ts
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: getProducts,
})
```

Le cache evite de re-fetcher les produits a chaque navigation.
C'est la difference la plus visible pour l'UX.

---

## 5. Structure de dossiers

### Actuelle — layer-based

```
src/
  api/
  components/
  pages/
  context/
```

### Alternative — feature-based

```
src/
  features/
    shop/
      ShopPage.tsx
      ProductCard.tsx
      useProducts.ts
    product/
      ProductPage.tsx
      useProduct.ts
    cart/
      CartPage.tsx
      CartContext.tsx
      useCart.ts
  shared/
    components/
      Header/
      Footer/
      MenuLink/
    api/
```

### Conseil : rester layer-based pour l'instant

La structure actuelle est lisible et propre.
Passer en feature-based si on depasse 5 ou 6 features distinctes.

---

## Priorites recommandees

```
Court terme    Stabiliser les routes React
               Creer boutique, fiches produit et collections
               Ajouter TanStack Query
               Remplacer les useEffect manuels de fetching

SEO            Ajouter react-helmet-async
               Generer un sitemap
               Ajouter JSON-LD sur les fiches produit
               Optimiser images et performance

Moyen terme    Etudier un pre-rendu statique si necessaire
               sans migrer vers Next.js

Si ca grandit  Zustand pour l'etat global
               Feature-based folders
```

La migration TanStack Query reste la plus facile et la plus rentable immediatement.
Le SEO peut etre nettement ameliore avec Vite / React, meme sans Next.js, si les meta,
le sitemap et les donnees structurees sont traites serieusement.
