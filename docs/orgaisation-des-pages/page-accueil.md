# Organisation de la page d'accueil

La page d'accueil doit etre pilotee par WordPress/Gutenberg. Le front React sert a rendre les blocs disponibles, pas a coder la composition de la page en dur.

## Structure recommandee

```txt
PAGE D'ACCUEIL WORDPRESS / GUTENBERG

[ 1. HERO ]
Bloc : magicieuse/hero
- Grande image ou visuel principal
- Titre court
- Texte d'ambiance
- Bouton principal : Voir la boutique
- Bouton secondaire : Decouvrir les collections


[ 2. COLLECTIONS ]
Bloc : magicieuse/category-grid
- 3 a 6 collections
- Image + nom + nombre de produits
- Lien vers chaque collection


[ 3. ARTICLE / PRODUIT MIS EN AVANT ]
Bloc : magicieuse/product-highlight
- Exemple : "Le livre du moment"
- Couverture du produit
- Titre
- Court texte
- Prix
- Bouton Ajouter au panier
- Bouton Voir le livre


[ 4. SELECTION PRODUITS ]
Bloc : magicieuse/featured-products
ou : magicieuse/book-carousel
- 4 a 8 produits
- Nouveautes / coups de coeur / categorie choisie
- Lien vers la boutique complete


[ 5. UNIVERS / HISTOIRE ]
Bloc : magicieuse/image-text
ou blocs Gutenberg natifs
- Image + texte court
- Presentation de Magicieuse
- Bouton : En savoir plus


[ 6. REASSURANCE ]
Pattern Gutenberg : Réassurance Magicieuse
- Fait main / selection choisie
- Paiement securise
- Livraison
- Pieces limitees


[ 7. INSTAGRAM / GALERIE ]
Bloc : magicieuse/instagram-feed
ou : magicieuse/gallery
- Apercu visuel
- Lien vers Instagram


[ FOOTER ]
Deja gere par le composant Footer
- Menu footer WordPress
- Contact
- Liens utiles
```

## Ordre conseille

```txt
Hero
-> Collections
-> Produit mis en avant
-> Selection produits
-> Histoire / univers
-> Reassurance
-> Instagram
-> Footer
```

## Repartition Gutenberg / React

Gutenberg doit gerer :

- l'ordre des sections ;
- les titres et textes ;
- les images editoriales ;
- les boutons et liens ;
- les produits ou categories selectionnes via les blocs custom.

React doit gerer :

- le rendu propre et responsive des blocs ;
- les appels API WordPress/WooCommerce ;
- l'ajout panier ;
- les styles par theme ;
- les fallbacks si une donnee manque.

## Blocs prioritaires

```txt
magicieuse/hero
magicieuse/category-grid
magicieuse/product-highlight
magicieuse/featured-products
magicieuse/book-carousel
magicieuse/image-text
magicieuse/css-grid
magicieuse/instagram-feed
magicieuse/gallery
```

## Intention UX

La page d'accueil est une landing page e-commerce editoriale. Elle doit :

1. presenter l'univers Magicieuse rapidement ;
2. orienter vers les collections ;
3. mettre en avant un produit fort ;
4. proposer une selection courte de produits ;
5. rassurer avant l'achat ;
6. prolonger l'univers avec Instagram ou une galerie.
