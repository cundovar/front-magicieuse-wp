# Préparation au refactor — magicieuse-front

Date : 2026-06-05
Destinataire : agent IA senior React

Ce document décrit l'état actuel du codebase et les trois refactors à effectuer.
Lire entièrement avant de commencer.

---

## Stack réelle

```text
React 19.2
React Router 7.17
Vite 8
Tailwind 4.3 — via @tailwindcss/vite (pas de tailwind.config.js)
TypeScript 6
SCSS (sass 1.100, fichiers .scss importés directement, pas de CSS modules)
```

---

## Structure des fichiers concernés

```text
src/
  App.tsx
  main.tsx
  styles/
    tailwind.css
    main.scss             # contient :root actuellement
    wp-content.scss
  features/
    shop/
      ProductCard.tsx     # /produit/ hardcodé
    cart/
      CartPage.tsx        # /boutique/, /produit/ hardcodés + regex permalink
      CartContext.tsx
    product/
      ProductPage.tsx     # /boutique/, /collections/, /panier/ hardcodés
    collection/
      CollectionPage.tsx  # /boutique/ hardcodé
  shared/
    api/
      woocommerce.ts      # regex /produit/ dans getProductSlug()
    components/
      Header/
        Header.tsx        # /panier/ hardcodé x2
.env
```

---

## État actuel détaillé

### `src/styles/main.scss`

Les variables CSS sont déjà dans un bloc `:root` dans `main.scss`.
Tous les fichiers SCSS de composants les utilisent déjà via `var()`.
Aucune valeur visuelle n'est hardcodée dans les composants — terrain propre.

Variables actuelles :

```scss
:root {
  --text: #625c69;
  --text-h: #151018;
  --bg: #ffffff;
  --border: #e7e2ea;
  --panel: #faf8fb;
  --accent: #7b2cbf;
  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;
}
```

### `.env` actuel

```env
VITE_WP_API_BASE=/wp-json
VITE_WP_SITE_URL=http://localhost/MAGICIEUSE/htdocs
```

### Inventaire complet des slugs hardcodés

Résultat d'un `grep` sur tout le src. Classés par type :

**Routes React Router (`App.tsx`)**

```
App.tsx:20   path="/boutique/"
App.tsx:21   path="/produit/:slug/"
App.tsx:22   path="/collections/:slug/"
App.tsx:23   path="/panier/"
```

**Liens de navigation (`<Link>` / `<NavLink>`)**

```
ProductCard.tsx:15        to={`/produit/${product.slug}/`}
CartPage.tsx:76           to="/boutique/"
CartPage.tsx:101          to={`/produit/${slug}/`}
CartPage.tsx:159          to="/boutique/"
ProductPage.tsx:43        to="/boutique/"
ProductPage.tsx:66        to={`/collections/${cat.slug}/`}
ProductPage.tsx:94        to="/panier/"
CollectionPage.tsx:13     to="/boutique/"
Header.tsx:86             to="/panier/"
```

**Constante de filtrage menu (`Header.tsx`)**

```
Header.tsx:9   const CART_PATHS = new Set(['/panier/', '/cart/'])
```

**Regex sur permalink WooCommerce — cas particulier**

```
woocommerce.ts:83   product.permalink.match(/\/produit\/([^/]+)\/?/)?.[1]
CartPage.tsx:87     item.permalink?.match(/\/produit\/([^/]+)\/?/)?.[1]
```

Ces deux regex extraient le slug produit depuis l'URL WooCommerce générée par WordPress.
Le segment `/produit/` correspond au "base produit" configuré dans WP Admin → Réglages → Permaliens.
Si ce segment change dans WP, il faut aussi mettre à jour `VITE_SLUG_PRODUCT`.

**Affichage textuel uniquement — ne pas modifier**

```
ApiCheckPage.tsx:64   <small>/produit/{product.slug}/</small>
ApiCheckPage.tsx:76   <small>/collections/{category.slug}/</small>
```

---

## Refactors à effectuer

### Refactor 1 — Extraire les variables CSS dans `variables.scss`

**Objectif** : isoler les variables du thème dans un fichier dédié.
Un pack de style peut ensuite surcharger uniquement ce fichier.

**Fichier à créer** : `src/styles/variables.scss`

```scss
:root {
  --color-primary: #7b2cbf;
  --color-text: #625c69;
  --color-heading: #151018;
  --color-background: #ffffff;
  --color-surface: #faf8fb;
  --color-border: #e7e2ea;

  --font-body: system-ui, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, Consolas, monospace;
}
```

**Fichier à modifier** : `src/styles/main.scss`

Supprimer le bloc `:root { }` existant.
Ajouter en première ligne :

```scss
@use './variables';
```

`variables.scss` est importé via SCSS uniquement — ne pas l'ajouter dans `main.tsx`.
`main.scss` reste le seul point d'entrée SCSS dans `main.tsx`.

**`main.tsx` reste inchangé** :

```tsx
import './styles/tailwind.css'
import './styles/main.scss'
import './styles/wp-content.scss'
```

**Renommage des variables** dans `main.scss` et tous les fichiers SCSS de composants :

```text
var(--accent)  → var(--color-primary)
var(--text)    → var(--color-text)
var(--text-h)  → var(--color-heading)
var(--bg)      → var(--color-background)
var(--panel)   → var(--color-surface)
var(--border)  → var(--color-border)
```

Fichiers SCSS à mettre à jour :

```text
src/styles/main.scss
src/features/shop/ProductCard.scss
src/features/shop/ProductList.scss
src/features/shop/ShopPage.scss
src/features/cart/CartPage.scss
src/features/collection/CollectionPage.scss
src/features/home/HomePage.scss
src/features/product/ProductPage.scss
src/features/wp-page/WpPagePage.scss
src/features/api-check/ApiCheckPage.scss
src/shared/components/Header/Header.scss
src/shared/components/Footer/Footer.scss
src/shared/components/ProductPrice/ProductPrice.scss
```

**Créer** `src/themes/.gitkeep` pour réserver le dossier.
Les packs de style futurs iront ici : `src/themes/theme-xxx.scss`, chacun contenant
uniquement un bloc `:root { }` importé dans `main.tsx` après `main.scss`.

---

### Refactor 2 — Slugs WooCommerce dans `.env`

**Important** : les variables `.env` sont compilées dans le bundle Vite au moment du build.
Un changement de slug nécessite un rebuild et un redéploiement.
Ce n'est pas une configuration dynamique côté admin WordPress.

**Fichier à modifier** : `.env`

Ajouter :

```env
VITE_SLUG_SHOP=boutique
VITE_SLUG_PRODUCT=produit
VITE_SLUG_COLLECTION=collections
VITE_SLUG_CART=panier
```

**Fichier à créer** : `.env.example`

```env
VITE_WP_API_BASE=/wp-json
VITE_WP_SITE_URL=

VITE_SLUG_SHOP=boutique
VITE_SLUG_PRODUCT=produit
VITE_SLUG_COLLECTION=collections
VITE_SLUG_CART=panier
```

**Fichier à modifier** : `src/App.tsx`

```tsx
const slugShop       = import.meta.env.VITE_SLUG_SHOP       || 'boutique'
const slugProduct    = import.meta.env.VITE_SLUG_PRODUCT    || 'produit'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugCart       = import.meta.env.VITE_SLUG_CART       || 'panier'

<Route path={`/${slugShop}/`}                element={<ShopPage />} />
<Route path={`/${slugProduct}/:slug/`}       element={<ProductPage />} />
<Route path={`/${slugCollection}/:slug/`}    element={<CollectionPage />} />
<Route path={`/${slugCart}/`}                element={<CartPage />} />
```

**Fichiers à modifier — liens de navigation**

Dans chaque fichier ci-dessous, lire le slug depuis `import.meta.env` avec fallback
et remplacer le slug hardcodé dans le `<Link>` / `<NavLink>`.

`src/features/shop/ProductCard.tsx`
```tsx
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
// lien : to={`/${slugProduct}/${product.slug}/`}
```

`src/features/cart/CartPage.tsx`
```tsx
const slugShop    = import.meta.env.VITE_SLUG_SHOP    || 'boutique'
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
// ligne 76  : to={`/${slugShop}/`}
// ligne 101 : to={`/${slugProduct}/${slug}/`}
// ligne 159 : to={`/${slugShop}/`}
```

`src/features/product/ProductPage.tsx`
```tsx
const slugShop       = import.meta.env.VITE_SLUG_SHOP       || 'boutique'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugCart       = import.meta.env.VITE_SLUG_CART       || 'panier'
// ligne 43 : to={`/${slugShop}/`}
// ligne 66 : to={`/${slugCollection}/${cat.slug}/`}
// ligne 94 : to={`/${slugCart}/`}
```

`src/features/collection/CollectionPage.tsx`
```tsx
const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
// ligne 13 : to={`/${slugShop}/`}
```

`src/shared/components/Header/Header.tsx`
```tsx
const slugCart = import.meta.env.VITE_SLUG_CART || 'panier'
// ligne 9  : const CART_PATHS = new Set([`/${slugCart}/`, '/cart/'])
// ligne 86 : to={`/${slugCart}/`}
```

**Fichiers à modifier — regex permalink**

Ces deux regex extraient le slug produit depuis une URL WooCommerce.
Elles doivent lire le même slug que `VITE_SLUG_PRODUCT`.

`src/shared/api/woocommerce.ts` — fonction `getProductSlug`, ligne 83 :
```ts
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
const slug = product.permalink.match(new RegExp(`/${slugProduct}/([^/]+)/?`))?.[1]
```

`src/features/cart/CartPage.tsx` — ligne 87 :
```ts
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
const slug =
  item.permalink?.match(new RegExp(`/${slugProduct}/([^/]+)/?`))?.[1] ??
  String(item.id)
```

---

### Refactor 3 — Tailwind 4 et variables CSS (optionnel)

**Contexte** : le projet utilise Tailwind 4 via `@tailwindcss/vite`.
Tailwind 4 fonctionne sans `tailwind.config.js` — la configuration se fait en CSS via `@theme`.

**À vérifier avant de commencer** :

```bash
cat src/styles/tailwind.css
```

Si le fichier contient `@import "tailwindcss"` ou `@tailwind base`, Tailwind 4 est actif en mode CSS-first.

**Option A — CSS-first (recommandée pour Tailwind 4)**

Dans `src/styles/tailwind.css`, après les directives existantes, ajouter :

```css
@theme {
  --color-primary: var(--color-primary);
  --color-surface: var(--color-surface);
  --color-border: var(--color-border);
  --color-heading: var(--color-heading);
}
```

Cela rend `text-primary`, `bg-surface`, etc. disponibles comme classes Tailwind.

**Option B — tailwind.config.js (si nécessaire)**

Si l'option A ne fonctionne pas ou si le projet migre vers une config centralisée :

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        surface: 'var(--color-surface)',
        border:  'var(--color-border)',
        heading: 'var(--color-heading)',
      },
    },
  },
}
```

**Ce refactor ne modifie aucun fichier TSX existant.**
Il rend les nouvelles classes disponibles pour les développements futurs.

---

## Ordre d'exécution

Avant toute modification TSX/TS liée aux slugs, relancer une recherche globale pour
détecter les chemins hardcodés qui auraient changé depuis cet inventaire :

```bash
rg '(/produit/|/collections/|/boutique/|/panier/)' src
```

Traiter les nouveaux résultats selon leur usage :

```text
Routes React Router      → lire les slugs depuis import.meta.env
Liens internes           → lire les slugs depuis import.meta.env
Regex permalink produit  → utiliser VITE_SLUG_PRODUCT
Affichage textuel debug  → ne pas modifier sans besoin explicite
```

```text
1.  Relancer rg sur /produit/, /collections/, /boutique/, /panier/
2.  Créer src/styles/variables.scss
3.  Modifier src/styles/main.scss (supprimer :root, ajouter @use, renommer les var())
4.  Mettre à jour tous les fichiers SCSS listés (renommage des variables)
5.  Créer src/themes/.gitkeep
6.  Modifier .env (ajouter les quatre slugs)
7.  Créer .env.example
8.  Modifier src/App.tsx (routes avec slugs depuis import.meta.env)
9.  Modifier src/features/shop/ProductCard.tsx
10. Modifier src/features/cart/CartPage.tsx (liens + regex permalink)
11. Modifier src/features/product/ProductPage.tsx
12. Modifier src/features/collection/CollectionPage.tsx
13. Modifier src/shared/components/Header/Header.tsx
14. Modifier src/shared/api/woocommerce.ts (regex getProductSlug)
15. Refactor 3 Tailwind — optionnel, à faire en dernier
```

---

## Contraintes — ne pas toucher

```text
src/shared/api/wordpress.ts      → aucune modification
src/shared/utils/                → aucune modification
src/features/cart/CartContext.tsx → aucune modification
src/styles/wp-content.scss       → aucune modification
Logique métier des hooks          → aucune modification
ApiCheckPage.tsx lignes 64 et 76  → affichage textuel, ne pas modifier
```

---

## Vérification

Après les refactors 1 et 2 :

```bash
npm run dev
```

Points à vérifier dans le navigateur :

```text
/                          → page d'accueil WordPress s'affiche
/boutique/                 → grille produits
/produit/[slug]/           → page produit, lien depuis ProductCard fonctionne
/collections/[slug]/       → collection avec produits
/panier/                   → panier avec liens retour boutique
Header                     → logo, menu, compteur panier
Couleurs                   → violet #7b2cbf visible (--color-primary)
```

Test du système de thème :

```text
1. Créer src/themes/theme-test.scss avec :root { --color-primary: red; }
2. Ajouter import './themes/theme-test.scss' dans main.tsx après main.scss
3. Vérifier que l'accent passe au rouge dans le navigateur
4. Supprimer le fichier et l'import
```
