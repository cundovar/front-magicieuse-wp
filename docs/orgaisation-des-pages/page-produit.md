# Organisation d'une page produit individuelle

La page produit individuelle est pilotee par WooCommerce Store API. Contrairement a la page d'accueil, elle n'est pas une composition Gutenberg libre : elle doit garder une structure stable pour l'achat, le SEO et la lisibilite.

Route front :

```txt
/:slugProduct/:slug/
exemple : /produit/nom-du-produit/
```

Source principale :

```txt
WooCommerce Store API
/wc/store/products?slug=:slug
```

Source complementaire :

```txt
API custom WordPress
/magicieuse/v1/product/:slug/brands
```

## Structure recommandee

```txt
PAGE PRODUIT INDIVIDUELLE

[ 1. RETOUR BOUTIQUE ]
Composant : lien simple
- Lien vers la boutique
- Exemple : ← Boutique


[ 2. ZONE PRODUIT PRINCIPALE ]
Composant : ProductPage

Colonne gauche :
- Image principale du produit
- Galerie produit si plusieurs images disponibles
- Fond/image radius selon le theme

Colonne droite :
- Categories cliquables
- Titre produit
- Auteur / illustrateur / roles de marque si disponibles
- Prix
- Badge promo si le produit est en promotion
- Description courte
- Format / dimensions
- Poids
- Stock faible si disponible
- Bouton Ajouter au panier
- Lien Voir le panier apres ajout


[ 3. DESCRIPTION DETAILLEE ]
Source : product.description
- Texte long du produit
- Resume editorial
- Details du livre / objet
- Informations utiles avant achat


[ 4. INFORMATIONS PRODUIT ]
Source : champs WooCommerce
- SKU si utile
- Categories
- Dimensions
- Poids
- Disponibilite
- Etat du stock


[ 5. REASSURANCE ACHAT ]
Pattern Gutenberg reutilisable : Réassurance Magicieuse
- Paiement securise
- Livraison
- Retours / contact
- Produit selectionne avec soin


[ 6. PRODUITS LIES ]
Composant a prevoir
- Meme categorie
- Meme collection
- Autres nouveautes
- Produits similaires


[ 7. FOOTER ]
Deja gere par le composant Footer
- Menu footer WordPress
- Contact
- Liens utiles
```

## Ordre conseille

```txt
Retour boutique
-> Image + informations d'achat
-> Description detaillee
-> Informations produit
-> Reassurance
-> Produits lies
-> Footer
```

## Donnees disponibles

Depuis `WooProduct` :

```txt
id
name
slug
permalink
type
sku
short_description
description
on_sale
prices
images
categories
is_purchasable
is_in_stock
is_on_backorder
low_stock_remaining
stock_availability
formatted_weight
formatted_dimensions
add_to_cart
```

Depuis l'API custom `getProductBrands(slug)` :

```txt
role.name
role.people[]
```

Exemples :

```txt
Auteur : Jean-Pierre Lamérand
Illustration : Nom de l'illustrateur
Edition : Nom de la maison
```

## Repartition React / WordPress

React doit gerer :

- la structure stable de la fiche produit ;
- le chargement du produit par slug ;
- les etats loading / erreur / introuvable ;
- l'ajout au panier ;
- le lien vers le panier apres ajout ;
- le rendu responsive ;
- les styles par theme.

WooCommerce doit gerer :

- le nom du produit ;
- les images ;
- le prix ;
- la promotion ;
- le stock ;
- la description courte ;
- la description longue ;
- les dimensions ;
- le poids ;
- les categories ;
- l'achat.

WordPress custom doit gerer :

- les roles editoriaux du produit ;
- auteur, illustrateur, marque, collection editoriale si necessaire.

## Composants existants

```txt
ProductPage
useProduct
ProductImage
ProductPrice
Button
ButtonLink
LoadingState
useCart
```

## Composants a prevoir

```txt
ProductGallery
ProductLongDescription
RelatedProducts
ProductMetaDetails
```

## Intention UX

La page produit doit d'abord permettre d'acheter, puis rassurer, puis enrichir l'univers du produit.

Priorites :

1. voir clairement le produit ;
2. comprendre rapidement ce que c'est ;
3. connaitre le prix ;
4. ajouter au panier sans friction ;
5. lire les details si besoin ;
6. decouvrir des produits proches.

## Schema compact

```txt
[← Boutique]

[Image produit / galerie]   [Categories]
                            [Titre produit]
                            [Auteur / roles]
                            [Prix + badge promo]
                            [Description courte]
                            [Format / poids / stock]
                            [Ajouter au panier]

[Description detaillee]

[Infos produit]

[Reassurance achat]

[Produits lies]

[Footer]
```
