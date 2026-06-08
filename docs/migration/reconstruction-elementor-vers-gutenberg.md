# Reconstruction controlee Elementor vers Gutenberg

Objectif : remplacer progressivement les pages creees avec Elementor par des
pages Gutenberg propres, compatibles avec le front React headless.

Elementor ne doit pas etre converti automatiquement. La bonne approche est de
reconstruire les pages avec :

- des blocs Gutenberg standards pour le contenu simple ;
- des blocs custom `magicieuse/*` pour les sections importantes ;
- des composants React pour le rendu final public.

## 1. Lister les pages Elementor a migrer

Commencer par faire un inventaire simple des pages existantes.

Classer les pages en trois niveaux.

### Accueil

Page prioritaire.

Elle doit etre reconstruite proprement, car elle contient souvent les sections
les plus importantes du site :

- hero ;
- mise en avant de livres ;
- carrousels ;
- appels a l'action ;
- blocs de confiance ;
- contenus editoriaux courts.

### Pages importantes

Pages qui ont un impact direct sur l'experience client ou la conversion.

Exemples :

- boutique ;
- collections ;
- a propos ;
- contact ;
- page evenement ou atelier ;
- page de presentation d'une offre ;
- page institutionnelle importante.

Ces pages doivent etre migrees apres l'accueil, avec une structure claire et
des blocs reutilisables.

### Pages secondaires

Pages moins critiques ou rarement consultees.

Exemples :

- anciennes pages de contenu ;
- pages temporaires ;
- pages informatives simples ;
- contenus qui peuvent rester provisoirement en HTML WordPress.

Ces pages peuvent etre migrees plus tard, ou conservees temporairement si leur
rendu React est acceptable.

## 2. Decouper les pages en sections

Avant de reconstruire une page, il faut la decouper en sections logiques.

Chaque section doit repondre a une question :

```text
Est-ce un simple contenu editorial ?
Ou est-ce une section structuree qui merite un bloc custom React ?
```

## Sections courantes a identifier

### Hero

Section principale en haut de page.

Contient souvent :

- titre ;
- texte court ;
- image ;
- bouton principal ;
- bouton secondaire.

Bloc conseille :

```text
magicieuse/hero
```

### Texte editorial

Contenu simple gere directement par Gutenberg.

Blocs conseilles :

- titre Gutenberg ;
- paragraphe Gutenberg ;
- liste Gutenberg ;
- citation Gutenberg.

Pas besoin de bloc custom sauf si la mise en page devient specifique.

### Image + texte

Section composee d'une image et d'un texte associe.

Elle peut etre faite avec Gutenberg si elle reste simple.

Bloc custom possible si le design doit etre stable :

```text
magicieuse/image-text
```

### CTA

Appel a l'action.

Contient souvent :

- titre ;
- texte court ;
- bouton ;
- lien.

Bloc conseille :

```text
magicieuse/cta
```

### Carrousel de livres

Section dynamique rendue par React.

WordPress doit seulement stocker les reglages :

- titre ;
- categorie ;
- nombre de livres ;
- selection manuelle ou automatique.

Bloc conseille :

```text
magicieuse/book-carousel
```

React rend ensuite le vrai carrousel avec un composant dedie.

### Selection de produits

Section de produits WooCommerce.

Peut servir pour :

- nouveautes ;
- coups de coeur ;
- meilleure vente ;
- selection par categorie ;
- selection manuelle.

Bloc conseille :

```text
magicieuse/featured-products
```

### Temoignages

Section avec avis clients, citations ou retours.

Options possibles :

- bloc Gutenberg citation si c'est ponctuel ;
- bloc custom si plusieurs temoignages doivent etre geres proprement.

Bloc custom possible :

```text
magicieuse/testimonials
```

### Galerie

Images multiples.

Si la galerie est simple, utiliser le bloc Galerie Gutenberg.

Si elle doit avoir un rendu particulier cote React, prevoir un bloc custom.

Bloc custom possible :

```text
magicieuse/gallery
```

### FAQ

Questions / reponses.

Pour une FAQ simple, Gutenberg peut suffire.

Pour une FAQ interactive, mieux vaut un bloc custom rendu par React.

Bloc custom possible :

```text
magicieuse/faq
```

## Priorite des blocs custom

Ne pas tout creer au debut.

Commencer par les blocs structurants :

```text
magicieuse/hero
magicieuse/cta
magicieuse/book-carousel
magicieuse/featured-products
magicieuse/image-text
```

Les autres blocs peuvent etre ajoutes plus tard, uniquement si les pages les
utilisent vraiment.

## Regle de migration

Pour chaque section Elementor :

```text
Contenu simple        -> bloc Gutenberg standard
Section importante    -> bloc custom magicieuse/*
Interaction complexe  -> composant React
Ancien rendu inutile  -> supprimer ou simplifier
```

La reconstruction doit produire des pages faciles a modifier dans WordPress,
mais rendues proprement par React.
