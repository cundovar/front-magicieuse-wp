# Organisation de la page boutique

La page boutique est la page catalogue principale. Elle doit rester stable cote React, avec une configuration editoriale possible via WordPress pour les filtres.

Route front :

```txt
/:slugShop/
exemple : /boutique/
```

Source produits :

```txt
WooCommerce Store API
/wc/store/products
```

Source configuration :

```txt
WordPress blocks
/magicieuse/v1/page/:slugShop/blocks
```

## Structure recommandee

```txt
PAGE BOUTIQUE

[ 1. EN-TETE BOUTIQUE ]
Composant : ShopPage
- Titre : Boutique
- Eventuellement une intro courte si ajoutee plus tard
- Zone de filtres visible selon configuration


[ 2. FILTRES ]
Composant : ShopFilters
Bloc source : magicieuse/shop-filters

Layouts possibles :
- drawer : bouton Filtrer + panneau lateral
- sidebar : colonne de filtres a gauche
- topbar : a prevoir si besoin

Filtres disponibles :
- Collections / categories
- Prix minimum
- Prix maximum
- Theme si configure
- Tri


[ 3. GRILLE PRODUITS ]
Composants : ProductList + ProductCard
- Image produit
- Nom
- Description courte
- Prix
- Badge epuise si hors stock
- Bouton Ajouter au panier si achetable
- Lien vers la fiche produit


[ 4. ETATS DE PAGE ]
Composant : LoadingState
- Chargement des produits
- Erreur API
- Aucun produit disponible


[ FOOTER ]
Deja gere par le composant Footer
- Menu footer WordPress
- Contact
- Liens utiles
```

## Ordre conseille

```txt
Titre boutique
-> Filtres
-> Grille produits
-> Footer
```

## Parametres d'URL

La boutique doit garder les filtres dans l'URL pour permettre le partage et le retour navigateur.

```txt
?cat=:slug
?min=:prix
?max=:prix
?sort=price-asc
?sort=price-desc
?sort=popularity
```

Exemples :

```txt
/boutique/?cat=livres
/boutique/?min=10&max=30
/boutique/?sort=price-asc
```

## Donnees disponibles

Depuis les produits WooCommerce :

```txt
id
name
slug
short_description
prices
images
categories
is_purchasable
is_in_stock
stock_availability
add_to_cart
```

Depuis le bloc `magicieuse/shop-filters` :

```txt
attrs.layout
attrs.showCollections
attrs.showPrice
attrs.showTheme
attrs.sortEnabled
data.categories
data.priceRange
data.themes
```

## Repartition React / WordPress

React doit gerer :

- la route boutique ;
- la lecture/ecriture des filtres dans l'URL ;
- le chargement des produits ;
- le rendu des filtres ;
- la grille produit ;
- les etats loading / erreur ;
- l'ajout au panier depuis les cartes.

WordPress doit gerer :

- la configuration du bloc `magicieuse/shop-filters` ;
- les collections/categories disponibles ;
- les prix minimum/maximum si exposes par l'API ;
- les themes si cette taxonomie est utilisee.

WooCommerce doit gerer :

- les produits ;
- les prix ;
- les images ;
- le stock ;
- l'achat ;
- les categories.

## Composants existants

```txt
ShopPage
ShopFilters
useProducts
ProductList
ProductCard
ProductImage
ProductPrice
LoadingState
```

## Composants a prevoir

```txt
ShopIntro
ActiveFiltersSummary
ProductCount
EmptyShopState
PaginationOrLoadMore
```

## Intention UX

La boutique doit permettre de comparer et filtrer rapidement. Elle doit etre plus dense que la page d'accueil.

Priorites :

1. voir les produits sans friction ;
2. filtrer par collection ;
3. trier par prix ou popularite ;
4. comprendre les prix rapidement ;
5. acceder vite a la fiche produit ;
6. ajouter au panier depuis la grille quand c'est pertinent.

## Schema compact

```txt
[Boutique]                    [Filtrer]

[Filtres drawer/sidebar]
- Collections
- Prix
- Tri

[Produit] [Produit] [Produit] [Produit]
[Produit] [Produit] [Produit] [Produit]

[Footer]
```
