# Organisation d'une page collection

La page collection est une page catalogue ciblee. Elle presente une seule collection, son univers, puis les produits rattaches a cette collection.

Route front :

```txt
/:slugCollection/:slug/
exemple : /collections/nom-de-la-collection/
```

Sources :

```txt
API custom WordPress
/magicieuse/v1/collection/:slug

WooCommerce Store API
/wc/store/products?category=:slug
```

## Structure recommandee

```txt
PAGE COLLECTION

[ 1. RETOUR BOUTIQUE ]
Composant : lien simple
- Lien vers la boutique
- Exemple : ← Boutique


[ 2. EN-TETE COLLECTION ]
Composant : CollectionPage
- Image de collection si disponible
- Nom de la collection
- Description courte
- Nombre de produits


[ 3. GRILLE PRODUITS DE LA COLLECTION ]
Composants : ProductList + ProductCard
- Produits filtres par categorie/collection
- Image produit
- Nom
- Description courte
- Prix
- Bouton Ajouter au panier si achetable
- Lien vers la fiche produit


[ 4. ETAT COLLECTION VIDE ]
Composant : message simple
- Cette collection ne contient pas encore de produits.


[ 5. BLOCS EDITORIAUX OPTIONNELS ]
Composants/blocs a prevoir
- Histoire de la collection
- Image/texte
- Produit mis en avant dans la collection
- Galerie
- Reassurance via le pattern Gutenberg "Réassurance Magicieuse"


[ FOOTER ]
Deja gere par le composant Footer
- Menu footer WordPress
- Contact
- Liens utiles
```

## Ordre conseille

```txt
Retour boutique
-> En-tete collection
-> Produits de la collection
-> Bloc editorial optionnel
-> Footer
```

## Donnees disponibles

Depuis `WpCollection` :

```txt
id
name
slug
description
count
image
parent
```

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

## Difference avec la boutique

```txt
Boutique
- Catalogue global
- Filtres et tri importants
- Objectif : comparer et chercher

Collection
- Catalogue contextualise
- Pas besoin de filtres lourds au depart
- Objectif : raconter une famille de produits puis vendre
```

## Repartition React / WordPress

React doit gerer :

- la route collection ;
- le chargement de la collection par slug ;
- le chargement des produits de la collection ;
- les etats loading / erreur / introuvable ;
- le rendu responsive de l'en-tete ;
- la grille produit.

WordPress doit gerer :

- le nom de la collection ;
- la description ;
- l'image de collection ;
- le slug ;
- le rattachement parent/enfant si utilise.

WooCommerce doit gerer :

- les produits rattaches a la categorie/collection ;
- le prix ;
- les images ;
- le stock ;
- l'ajout panier.

## Composants existants

```txt
CollectionPage
useCollection
ProductList
ProductCard
SmartImage
LoadingState
```

## Composants a prevoir

```txt
CollectionStory
CollectionFeaturedProduct
CollectionGallery
RelatedCollections
CollectionMeta
```

## Intention UX

La page collection doit donner du contexte avant d'afficher les produits. Elle doit aider l'utilisateur a comprendre pourquoi ces produits vont ensemble.

Priorites :

1. identifier clairement la collection ;
2. voir une image forte ;
3. comprendre l'univers de la collection ;
4. voir tous les produits associes ;
5. acceder rapidement aux fiches produit ;
6. revenir facilement a la boutique.

## Schema compact

```txt
[← Boutique]

[Image collection]   [Nom collection]
                     [Description]
                     [X produits]

[Produit] [Produit] [Produit] [Produit]
[Produit] [Produit] [Produit] [Produit]

[Bloc histoire optionnel]

[Footer]
```

## Evolution possible

Si une collection devient tres riche, ajouter :

```txt
- tri local
- sous-collections
- produit phare de la collection
- galerie editoriale
- texte SEO sous la grille
```
