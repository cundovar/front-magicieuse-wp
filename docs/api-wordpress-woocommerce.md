# Strategie API WordPress + WooCommerce

Pour le moment, la priorite du front React est de recuperer proprement les donnees WordPress et WooCommerce. Le style peut attendre.

## Objectif

Construire un front headless qui lit les donnees depuis WordPress/WooCommerce :

- produits ;
- fiches produit ;
- categories ;
- pages WordPress ;
- panier WooCommerce ;
- checkout WooCommerce natif.

WordPress reste le back-office. React devient l'interface publique.

## Priorite de travail

1. Configurer la base API.
2. Creer des modules API propres.
3. Recuperer les produits WooCommerce.
4. Recuperer une fiche produit par slug.
5. Recuperer les categories produit.
6. Recuperer les pages WordPress utiles.
7. Brancher les routes React.
8. Ajouter le panier WooCommerce avec la Store API.
9. Rediriger vers le checkout WooCommerce natif.

## Configuration API

Creer un fichier `.env` dans le projet React :

```env
VITE_WP_API_BASE=http://localhost/MAGICIEUSE/htdocs/wp-json
```

Dans le code React :

```ts
const API_BASE = import.meta.env.VITE_WP_API_BASE
```

Ne pas ecrire l'URL WordPress en dur dans chaque composant.

## Organisation conseillee

```text
src/
  api/
    wordpress.ts
    woocommerce.ts
  pages/
    HomePage.tsx
    ShopPage.tsx
    ProductPage.tsx
    CollectionPage.tsx
    CartPage.tsx
```

Les composants React ne doivent pas contenir directement toute la logique `fetch`.

Exemple :

```ts
// src/shared/api/woocommerce.ts
const API_BASE = import.meta.env.VITE_WP_API_BASE

export async function getProducts() {
  const response = await fetch(`${API_BASE}/wc/store/products`)

  if (!response.ok) {
    throw new Error('Impossible de recuperer les produits')
  }

  return response.json()
}
```

## Endpoints WooCommerce

Produits :

```text
GET /wp-json/wc/store/products
```

Produit par slug :

```text
GET /wp-json/wc/store/products?slug=slug-produit
```

Categories produits :

```text
GET /wp-json/wc/store/products/categories
```

Panier :

```text
GET /wp-json/wc/store/cart
POST /wp-json/wc/store/cart/add-item
POST /wp-json/wc/store/cart/update-item
POST /wp-json/wc/store/cart/remove-item
```

## Endpoints WordPress

Pages :

```text
GET /wp-json/wp/v2/pages
```

Page par slug :

```text
GET /wp-json/wp/v2/pages?slug=la-magicieuse
```

Medias :

```text
GET /wp-json/wp/v2/media
```

## Panier WooCommerce

Les appels panier doivent conserver les cookies de session WooCommerce :

```ts
fetch(`${API_BASE}/wc/store/cart`, {
  credentials: 'include',
})
```

Cette regle est importante pour :

- lire le panier courant ;
- ajouter un produit ;
- modifier une quantite ;
- supprimer une ligne ;
- garder la session entre React et WooCommerce.

## Routes React a prevoir

```text
/                     Accueil React
/boutique/            Liste produits React
/produit/:slug/       Fiche produit React
/collections/:slug/   Categorie produit React
/panier/              Panier React
/checkout/            Checkout WooCommerce natif
```

Le checkout peut aussi etre `/commande/` si l'URL francaise est retenue.

## Methode de progression

Commencer sans panier.

Premiere etape :

- afficher une liste de produits ;
- afficher une fiche produit par slug ;
- afficher les categories ;
- afficher une page WordPress simple.

Deuxieme etape :

- lire le panier ;
- ajouter au panier ;
- modifier les quantites ;
- supprimer un produit ;
- rediriger vers le checkout WooCommerce.

## Tests rapides

Avant de coder dans React, tester les endpoints dans le navigateur :

```text
http://localhost/MAGICIEUSE/htdocs/wp-json/wc/store/products
http://localhost/MAGICIEUSE/htdocs/wp-json/wc/store/products/categories
http://localhost/MAGICIEUSE/htdocs/wp-json/wp/v2/pages
```

Si les URLs repondent en JSON, React peut les utiliser.

## Points d'attention

- Ne pas supprimer les pages WordPress tant que React n'a pas repris les routes.
- Ne pas mettre les appels API directement dans tous les composants.
- Garder les slugs produits existants pour le SEO.
- Tester tot les produits variables.
- Verifier les images produits et les medias WordPress.
- Prevoir les redirections 301 plus tard, quand les routes React seront stables.

## Decision

Pour l'instant, le projet doit avancer dans cet ordre :

```text
API d'abord
Routes ensuite
Panier apres
Style plus tard
```
