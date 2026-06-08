# Creer les blocs custom Magicieuse

Objectif : permettre au client de reconstruire les pages Elementor avec
Gutenberg, tout en gardant le rendu final dans React.

Les blocs custom `magicieuse/*` servent a stocker une intention editoriale dans
WordPress. Ils ne doivent pas porter le vrai rendu public du site.

```text
WordPress = choix du bloc, textes, images, categories, ordre des sections
React     = rendu final, design, composants, carrousels, interactions
```

## Blocs a creer en priorite

```text
magicieuse/hero
magicieuse/cta
magicieuse/book-carousel
magicieuse/featured-products
magicieuse/image-text
```

## Blocs differables

```text
magicieuse/testimonials
magicieuse/gallery
magicieuse/faq
```

Ces blocs peuvent attendre. Les creer seulement si les pages migrees les
utilisent vraiment.

## Principe

Dans Gutenberg, le client ajoute un bloc :

```text
Magicieuse > Carrousel de livres
```

Il renseigne par exemple :

```text
Titre : Nouveautes
Categorie : jeunesse
Nombre de livres : 8
```

WordPress enregistre seulement les attributs :

```json
{
  "blockName": "magicieuse/book-carousel",
  "attrs": {
    "title": "Nouveautes",
    "category": "jeunesse",
    "count": 8
  }
}
```

React recoit ce bloc via l'API, puis rend le vrai composant :

```tsx
<BookCarousel title="Nouveautes" category="jeunesse" count={8} />
```

## Plugin WordPress conseille

Creer un plugin dedie aux blocs Gutenberg :

```text
wp-content/plugins/magicieuse-gutenberg-blocks/
```

Structure conseillee :

```text
magicieuse-gutenberg-blocks/
  magicieuse-gutenberg-blocks.php
  src/
    hero/
      block.json
      index.js
    cta/
      block.json
      index.js
    book-carousel/
      block.json
      index.js
    featured-products/
      block.json
      index.js
    image-text/
      block.json
      index.js
```

Le plugin `magicieuse-headless-api` peut rester responsable des endpoints REST.
Le plugin `magicieuse-gutenberg-blocks` peut rester responsable des blocs
visibles dans l'editeur.

## Exemple de fichier PHP principal

```php
<?php
/**
 * Plugin Name: Magicieuse Gutenberg Blocks
 * Description: Blocs Gutenberg custom pour le front React headless Magicieuse.
 * Version:     1.0.0
 * Author:      Magicieuse
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'init', function () {
    register_block_type( __DIR__ . '/src/hero' );
    register_block_type( __DIR__ . '/src/cta' );
    register_block_type( __DIR__ . '/src/book-carousel' );
    register_block_type( __DIR__ . '/src/featured-products' );
    register_block_type( __DIR__ . '/src/image-text' );
} );

add_filter( 'block_categories_all', function ( $categories ) {
    $categories[] = [
        'slug'  => 'magicieuse',
        'title' => 'Magicieuse',
    ];

    return $categories;
} );
```

## Exemple block.json : book-carousel

```json
{
  "apiVersion": 3,
  "name": "magicieuse/book-carousel",
  "title": "Magicieuse Carrousel de livres",
  "category": "magicieuse",
  "icon": "book",
  "description": "Affiche un carrousel de livres rendu par React.",
  "attributes": {
    "title": {
      "type": "string",
      "default": ""
    },
    "category": {
      "type": "string",
      "default": ""
    },
    "count": {
      "type": "number",
      "default": 8
    }
  },
  "editorScript": "file:./index.js"
}
```

## Exemple index.js : book-carousel

```js
const { registerBlockType } = wp.blocks
const { InspectorControls, useBlockProps } = wp.blockEditor
const { PanelBody, TextControl, RangeControl } = wp.components

registerBlockType('magicieuse/book-carousel', {
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps()

    return (
      <div {...blockProps}>
        <InspectorControls>
          <PanelBody title="Reglages du carrousel">
            <TextControl
              label="Titre"
              value={attributes.title}
              onChange={(title) => setAttributes({ title })}
            />
            <TextControl
              label="Categorie"
              value={attributes.category}
              onChange={(category) => setAttributes({ category })}
            />
            <RangeControl
              label="Nombre de livres"
              value={attributes.count}
              min={1}
              max={24}
              onChange={(count) => setAttributes({ count })}
            />
          </PanelBody>
        </InspectorControls>

        <section>
          <strong>Carrousel de livres</strong>
          {attributes.title && <p>{attributes.title}</p>}
          {attributes.category && <small>Categorie : {attributes.category}</small>}
        </section>
      </div>
    )
  },

  save() {
    return null
  },
})
```

Le `save() { return null }` indique que le bloc ne sauvegarde pas de HTML public
complexe. Les attributs restent dans le contenu WordPress et React les utilise.

## Champs conseilles par bloc

### `magicieuse/hero`

```text
title
subtitle
text
imageId
primaryButtonLabel
primaryButtonUrl
secondaryButtonLabel
secondaryButtonUrl
```

### `magicieuse/cta`

```text
title
text
buttonLabel
buttonUrl
variant
```

### `magicieuse/book-carousel`

```text
title
category
count
mode
productIds
```

`mode` peut valoir :

```text
category
manual
latest
featured
```

### `magicieuse/featured-products`

```text
title
category
count
productIds
layout
```

### `magicieuse/image-text`

```text
title
text
imageId
imagePosition
buttonLabel
buttonUrl
```

`imagePosition` peut valoir :

```text
left
right
```

## API WordPress

Le plugin existant `magicieuse-headless-api` expose deja des endpoints de blocs :

```text
GET /wp-json/magicieuse/v1/front-page-blocks
GET /wp-json/magicieuse/v1/page/{slug}/blocks
```

Ces endpoints utilisent `parse_blocks()` et renvoient :

```json
{
  "blockName": "magicieuse/book-carousel",
  "attrs": {
    "title": "Nouveautes",
    "category": "jeunesse",
    "count": 8
  }
}
```

Il faut donc surtout s'assurer que les blocs sont bien enregistres dans
WordPress et que leurs attributs sont propres.

## Mapping React

Cote React, ajouter les blocs dans le renderer :

```tsx
const defaultBlockMap: BlockMap = {
  'core/heading': HeadingBlock,
  'core/paragraph': ParagraphBlock,
  'core/image': ImageBlock,
  'core/button': ButtonBlock,
  'core/buttons': ButtonsBlock,
  'magicieuse/hero': HeroBlock,
  'magicieuse/cta': CtaBlock,
  'magicieuse/book-carousel': BookCarouselBlock,
  'magicieuse/featured-products': FeaturedProductsBlock,
  'magicieuse/image-text': ImageTextBlock,
}
```

Chaque composant React lit `block.attrs`.

Exemple :

```tsx
function BookCarouselBlock({ block }: BlockComponentProps) {
  return (
    <BookCarousel
      title={String(block.attrs.title ?? '')}
      category={String(block.attrs.category ?? '')}
      count={Number(block.attrs.count ?? 8)}
    />
  )
}
```

## Ordre de travail conseille

1. Creer le plugin `magicieuse-gutenberg-blocks`.
2. Ajouter la categorie Gutenberg `Magicieuse`.
3. Creer `magicieuse/hero`.
4. Creer `magicieuse/cta`.
5. Creer `magicieuse/book-carousel`.
6. Creer `magicieuse/featured-products`.
7. Creer `magicieuse/image-text`.
8. Verifier que les blocs apparaissent dans l'admin WordPress.
9. Ajouter les mappings dans React.
10. Reconstruire la page d'accueil avec Gutenberg.
11. Tester `/wp-json/magicieuse/v1/front-page-blocks`.
12. Tester le rendu public React.

## Regle de decision

```text
Bloc simple editorial    -> Gutenberg standard
Section de page forte    -> bloc custom magicieuse/*
Interaction/carrousel    -> composant React
Ancien widget Elementor  -> reconstruire ou supprimer
```

Le but n'est pas de reproduire Elementor. Le but est de donner au client une
edition simple dans WordPress, avec un rendu React propre et stable.
