# Routing dynamique et theming injectable

Date : 2026-06-05

---

## 1. État actuel du routing

### Ce qui est déjà dynamique

La route catch-all `/:slug/` dans `App.tsx` gère automatiquement toutes les pages WordPress.

Quand un admin crée une nouvelle page dans WordPress, elle est accessible immédiatement dans React via `WpPagePage.tsx` qui appelle `getContent(slug)`.

Aucune modification de code n'est nécessaire pour les pages WordPress standard.

### Ce qui est hardcodé

Les slugs des routes WooCommerce sont écrits en dur dans `App.tsx` :

```tsx
<Route path="/boutique/" element={<ShopPage />} />
<Route path="/produit/:slug/" element={<ProductPage />} />
<Route path="/collections/:slug/" element={<CollectionPage />} />
```

Si l'admin renomme la page boutique dans WordPress, React ne suit pas.

---

## 2. Rendre les slugs WooCommerce configurables

### Principe

Déplacer les slugs dans le fichier `.env` pour qu'ils soient modifiables sans toucher au code.

### Configuration `.env`

```env
VITE_SLUG_SHOP=boutique
VITE_SLUG_PRODUCT=produit
VITE_SLUG_COLLECTION=collections
```

### Utilisation dans `App.tsx`

```tsx
const slugShop = import.meta.env.VITE_SLUG_SHOP || 'boutique'
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'
const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'

<Route path={`/${slugShop}/`} element={<ShopPage />} />
<Route path={`/${slugProduct}/:slug/`} element={<ProductPage />} />
<Route path={`/${slugCollection}/:slug/`} element={<CollectionPage />} />
```

### Ce que ça résout

Si le client change le slug de la boutique dans WordPress, il suffit de mettre à jour `.env` et de redéployer. Aucune modification du code React.

---

## 3. WooCommerce reste actif pour le moment

Pour le projet actuel, WooCommerce fait partie de l'architecture.

Il n'est pas utile pour l'instant de rendre WooCommerce optionnel ou desactivable par configuration.

Architecture cible actuelle :

```text
WordPress        → backend contenu + WooCommerce
React            → front public + boutique + panier
WooCommerce natif → checkout + mon compte
```

Les routes boutique, produit, collections et panier restent donc actives dans `App.tsx`.

La desactivation de WooCommerce pourra etre etudiee plus tard si le codebase doit servir a un site vitrine sans boutique.

### Plus tard : WooCommerce optionnel

Si un jour le projet doit fonctionner sans WooCommerce, on pourra ajouter :

- `VITE_ENABLE_WOOCOMMERCE` ;
- des routes conditionnelles dans `App.tsx` ;
- un `CartProvider` desactivable ;
- des menus qui masquent automatiquement les liens boutique/panier ;
- des appels API WooCommerce inactifs quand la boutique est desactivee.

Exemple possible plus tard :

```env
VITE_ENABLE_WOOCOMMERCE=true
```

Mais ce n'est pas une priorite maintenant.

---

## 4. Style injectable — pack de thème

### Principe

Le front React doit pouvoir recevoir un thème visuel différent sans modifier les composants.

La technique : remplacer toutes les valeurs visuelles hardcodées (couleurs, polices, rayons, espacements) par des **CSS custom properties** (variables CSS natives).

Un pack de style devient alors un simple fichier qui redéfinit ces variables.

### Avant (non injectable)

```scss
// variables.scss
$color-primary: #c0392b;
$font-heading: 'Playfair Display', serif;

// ProductCard.scss
.product-card {
  color: #c0392b;
  font-family: 'Playfair Display', serif;
  border-radius: 8px;
}
```

### Après (injectable)

```scss
// variables.scss
:root {
  --color-primary: #c0392b;
  --color-secondary: #2c3e50;
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  --color-text-light: #6b7280;
  --color-border: #e5e7eb;

  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  --radius-card: 8px;
  --radius-button: 4px;

  --spacing-section: 64px;
  --spacing-card: 24px;
}
```

```scss
// ProductCard.scss
.product-card {
  color: var(--color-primary);
  font-family: var(--font-body);
  border-radius: var(--radius-card);
  padding: var(--spacing-card);
}
```

### Deux niveaux de thème

Il faut distinguer deux cas selon ce que le client veut changer.

---

**Niveau 1 — Pack de couleurs**

Le composant React ne change pas. Le SCSS de structure ne change pas. Seules les valeurs visuelles changent.

Exemple : même `ProductCard.tsx`, même mise en page, mais couleurs et polices différentes selon le client.

```tsx
// ProductCard.tsx — ne change jamais
<div className="product-card px-4 py-6">
  <h2 className="product-card__title">{name}</h2>
  <span className="product-card__price">{price}</span>
</div>
```

```scss
// ProductCard.scss — ne change jamais
.product-card {
  border-radius: var(--radius-card);
  background: var(--color-background);

  &__title { font-family: var(--font-heading); color: var(--color-text); }
  &__price { color: var(--color-primary); }
}
```

Deux clients, deux fichiers de variables, zéro modification du code :

```scss
// themes/theme-magicieuse.scss
:root {
  --color-primary: #c0392b;
  --font-heading: 'Playfair Display', serif;
  --radius-card: 8px;
}
```

```scss
// themes/theme-autre-client.scss
:root {
  --color-primary: #1a73e8;
  --font-heading: 'Montserrat', sans-serif;
  --radius-card: 0px;
}
```

Dans ce cas, Tailwind ne change pas non plus : `px-4 py-6` reste le même pour les deux clients.

---

**Niveau 2 — Thème complet**

Si un client veut une structure différente — cards horizontales au lieu de verticales, sidebar, header différent — alors les variables seules ne suffisent pas.

Il faut aussi modifier :

- Le SCSS de structure du composant concerné
- Les classes Tailwind dans le JSX si la mise en page change
- Éventuellement la config `tailwind.config.js`

Pour que Tailwind soit lui aussi injectable, on peut faire lire ses couleurs depuis les variables CSS :

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
    }
  }
}
```

Ainsi `text-primary` dans le JSX suit automatiquement le thème actif sans changer le code.

---

**Résumé des deux niveaux**

```text
Niveau 1 — Pack de couleurs
  Ce qui change   : fichier :root { } dans src/themes/
  Ce qui ne change pas : composants React, SCSS de structure, Tailwind

Niveau 2 — Thème complet
  Ce qui change   : :root { } + SCSS de structure + tailwind.config.js
  Ce qui ne change pas : logique métier, hooks, appels API
```

### Créer un pack de style (niveau 1)

Un pack de niveau 1 est un fichier qui ne contient qu'un bloc `:root`. Rien d'autre.

```scss
// themes/theme-boheme.scss
:root {
  --color-primary: #8b6f47;
  --color-secondary: #d4a96a;
  --color-background: #fdf6ec;
  --color-text: #3d2b1f;

  --font-heading: 'Cormorant Garant', serif;
  --font-body: 'Lato', sans-serif;

  --radius-card: 0px;
  --radius-button: 0px;
}
```

### Importer le thème dans `main.tsx`

```tsx
// main.tsx
import './styles/tailwind.css'
import './styles/main.scss'
import './styles/wp-content.scss'
// import './themes/theme-boheme.scss'  // décommenter pour changer de thème
```

### Structure des fichiers recommandée

```text
src/styles/
  tailwind.css
  main.scss
  variables.scss       # Thème par défaut La Magicieuse
  wp-content.scss

src/themes/            # Packs de style alternatifs
  theme-boheme.scss
  theme-moderne.scss
```

---

## 5. Résumé

| Problème | Solution | Fichiers concernés |
|---|---|---|
| Slugs WooCommerce hardcodés | Variables `.env` + `import.meta.env` | `App.tsx`, `.env` |
| WooCommerce optionnel | `VITE_ENABLE_WOOCOMMERCE` + routes conditionnelles | `App.tsx`, `.env` |
| Style non injectable | CSS custom properties dans `variables.scss` | `variables.scss`, `*.scss` |

### Règle pratique

Aucune couleur, police, rayon ou espacement structurant ne doit être écrit en dur dans un fichier `.scss` de composant.

Tout passe par une variable CSS définie dans `variables.scss`.

Les classes Tailwind ponctuelles (espacements locaux, flex, responsive) ne sont pas concernées par cette règle.
