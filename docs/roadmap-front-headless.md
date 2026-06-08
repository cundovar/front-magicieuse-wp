# Roadmap front headless

L'API WordPress/WooCommerce est maintenant validee cote React.

React recupere correctement :

- les produits WooCommerce ;
- les slugs produits ;
- les categories produit ;
- les pages WordPress ;
- les pages WooCommerce importantes comme `Cart`, `Checkout` et `My account`.

## Etat actuel

L'ecran actuel de `App.tsx` sert de page de diagnostic API.

Il confirme que les endpoints fonctionnent avant de construire les vraies pages du site.

Ne pas le supprimer tant que les premieres routes React ne sont pas terminees.

## Prochaine etape

Installer React Router :

```bash
cd /var/www/html/MAGICIEUSE/magicieuse-front
npm install react-router-dom
```

Puis creer les routes publiques du front headless.

## Routes React a creer

```text
/                     Accueil React
/boutique/            Liste des produits
/produit/:slug/       Fiche produit
/collections/:slug/   Produits d'une categorie
```

## Routes a garder cote WordPress/WooCommerce

```text
/wp-admin/            Administration WordPress
/wp-json/             API WordPress/WooCommerce
/wp-content/uploads/  Medias WordPress
/checkout/            Paiement WooCommerce natif
/my-account/          Compte client WooCommerce
/cart/                Panier WooCommerce temporaire
```

Le panier React peut venir plus tard avec `/panier/`.

## Pages a creer

```text
src/pages/
  HomePage.tsx
  ShopPage.tsx
  ProductPage.tsx
  CollectionPage.tsx
  ApiCheckPage.tsx
```

`ApiCheckPage.tsx` peut contenir l'ecran de diagnostic actuel.

## Composants a creer

```text
src/components/
  Header/
    Header.tsx
    Header.scss
  Footer/
    Footer.tsx
    Footer.scss
  ProductCard/
    ProductCard.tsx
    ProductCard.scss
  ProductList/
    ProductList.tsx
    ProductList.scss
  ProductPrice/
    ProductPrice.tsx
  ProductImage/
    ProductImage.tsx
```

Le style peut rester minimal au debut. L'objectif prioritaire est de valider les donnees et les routes.

## Fonctions API deja disponibles

WooCommerce :

```ts
getProducts()
getProductBySlug(slug)
getProductCategories()
getCart()
```

WordPress :

```ts
getPages()
getPageBySlug(slug)
getMedia()
```

## Ordre de construction conseille

1. Installer `react-router-dom`.
2. Deplacer l'ecran actuel dans `ApiCheckPage`.
3. Configurer les routes dans `App.tsx`.
4. Creer `ShopPage` avec `getProducts()`.
5. Creer `ProductPage` avec `getProductBySlug(slug)`.
6. Creer `CollectionPage` avec filtre par categorie.
7. Creer `HomePage`.
8. Ajouter `Header` et `Footer`.
9. Tester les URLs.
10. Passer ensuite au panier React.

## Panier

Le panier React n'est pas prioritaire maintenant.

Pour le moment :

- garder `/cart/` cote WooCommerce ;
- garder `/checkout/` cote WooCommerce ;
- construire d'abord boutique, produit et collections.

Plus tard :

```text
/panier/              Panier React
/checkout/            Checkout WooCommerce natif
```

## Decision

La prochaine vraie tache est :

```text
Installer React Router
Creer les pages React
Brancher produits, fiches produit et collections
Reporter le panier a l'etape suivante
```
