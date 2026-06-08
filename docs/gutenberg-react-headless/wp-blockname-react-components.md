# Blocs WordPress vers composants React

Date : 2026-06-05

## Idee

Utiliser les blocs envoyes par WordPress comme une structure de page ordonnee,
puis laisser React choisir le composant a afficher selon le nom du bloc.

Objectif :

```text
WordPress garde l'ordre des blocs et les contenus
React garde les composants, le HTML final, l'UX et le theme
```

Cette approche permet de rendre l'ordre des sections dynamique sans construire
immediatement un systeme complet ACF ou Elementor custom.

---

## Principe

WordPress expose les blocs de la page via API, dans l'ordre reel de la page.

Exemple de blocs recus :

```json
[
  {
    "blockName": "core/heading",
    "attrs": {},
    "innerHTML": "<h2>Nos albums</h2>"
  },
  {
    "blockName": "core/image",
    "attrs": {
      "id": 123
    },
    "innerHTML": "<figure>...</figure>"
  },
  {
    "blockName": "woocommerce/product-collection",
    "attrs": {},
    "innerHTML": "..."
  }
]
```

React lit `blockName`, puis rend le composant correspondant.

---

## Mapping de blocs

Le mapping relie un nom de bloc WordPress a un composant React.

```ts
const blockMap = {
  'core/heading': HeadingBlock,
  'core/paragraph': ParagraphBlock,
  'core/image': ImageBlock,
  'core/buttons': ButtonsBlock,
  'woocommerce/product-collection': ProductCollectionBlock,
  'magicieuse/hero': HeroBlock,
}
```

Si l'admin deplace un bloc dans WordPress, l'API renvoie les blocs dans le nouvel
ordre. React suit automatiquement cet ordre.

---

## Renderer React

Exemple simplifie :

```tsx
type WpBlock = {
  blockName: string
  attrs?: Record<string, unknown>
  innerHTML?: string
  innerBlocks?: WpBlock[]
}

type BlockRendererProps = {
  block: WpBlock
  blockMap: Record<string, React.ComponentType<{ block: WpBlock }>>
}

export function BlockRenderer({ block, blockMap }: BlockRendererProps) {
  const Component = blockMap[block.blockName]

  if (!Component) {
    return <WpHtmlBlock html={block.innerHTML ?? ''} />
  }

  return <Component block={block} />
}
```

Page :

```tsx
export function WpStructuredPage({ blocks, blockMap }) {
  return (
    <main>
      {blocks.map((block, index) => (
        <BlockRenderer
          key={`${block.blockName}-${index}`}
          block={block}
          blockMap={blockMap}
        />
      ))}
    </main>
  )
}
```

---

## Composants generiques

Les composants React doivent rester reutilisables.

Exemples :

```text
HeadingBlock
ParagraphBlock
ImageBlock
ButtonsBlock
RichTextBlock
ProductCollectionBlock
HeroBlock
FeaturedProductsBlock
CollectionGridBlock
```

Chaque composant gere :

```text
structure HTML
accessibilite
classes principales
interactions
fallbacks de donnees
```

Il ne doit pas hardcoder l'identite visuelle du client.

---

## Styles et theme

Les composants utilisent des classes stables et des variables CSS.

Exemple :

```tsx
export function HeroBlock({ block }) {
  return (
    <section className="block-hero">
      <div className="block-hero__content">
        ...
      </div>
    </section>
  )
}
```

```scss
.block-hero {
  background: var(--block-hero-background, transparent);
  border-radius: var(--block-hero-radius, 0);
  padding: var(--block-hero-padding, var(--container-gutter));
}
```

Le theme client peut ensuite surcharger uniquement les variables :

```scss
:root {
  --block-hero-background: var(--home-article-background);
  --block-hero-radius: var(--home-article-radius);
  --block-hero-padding: var(--home-article-padding);
}
```

---

## Mapping par client

Le mapping peut etre separe par client ou par projet.

Mapping par defaut :

```ts
// src/blocks/defaultBlockMap.ts
export const defaultBlockMap = {
  'core/heading': HeadingBlock,
  'core/paragraph': ParagraphBlock,
  'core/image': ImageBlock,
  'core/buttons': ButtonsBlock,
}
```

Mapping Magicieuse :

```ts
// src/themes/clients/magicieuseBlockMap.ts
export const magicieuseBlockMap = {
  ...defaultBlockMap,
  'woocommerce/product-collection': ProductCollectionBlock,
  'magicieuse/hero': HeroBlock,
  'magicieuse/featured-products': FeaturedProductsBlock,
}
```

Un autre client peut reutiliser les memes composants avec des noms de blocs
differents :

```ts
export const clientXBlockMap = {
  ...defaultBlockMap,
  'client-x/hero-banner': HeroBlock,
  'client-x/products': ProductCollectionBlock,
}
```

---

## Fallback HTML

Tous les blocs ne doivent pas etre convertis immediatement.

Si React ne connait pas un bloc, il peut afficher son HTML WordPress brut :

```tsx
if (!Component) {
  return <WpHtmlBlock html={block.innerHTML ?? ''} />
}
```

Ce fallback permet une migration progressive :

```text
blocs connus     -> composants React
blocs inconnus   -> HTML WP brut
```

Le HTML fallback reste style par :

```text
src/styles/wp-content.scss
src/themes/clients/*-wp.scss
```

---

## Modifications cote plugin WordPress

Pour utiliser cette architecture, le plugin WordPress doit exposer un endpoint
qui retourne les blocs sous forme structuree.

L'ancien endpoint HTML peut rester en place pour le fallback legacy.

Endpoints possibles :

```text
/magicieuse/v1/front-page-blocks
/magicieuse/v1/page/{slug}/blocks
```

Objectif :

```text
1. Recuperer la page WordPress
2. Parser post_content avec parse_blocks()
3. Retourner blockName, attrs, innerHTML, innerBlocks
4. Enrichir certains blocs connus avec data
5. Laisser innerHTML disponible pour fallback
```

Exemple de payload :

```json
{
  "meta": {
    "id": 100,
    "slug": "accueil",
    "title": "Accueil"
  },
  "blocks": [
    {
      "blockName": "core/heading",
      "attrs": {},
      "innerHTML": "<h2>Nos albums</h2>",
      "innerBlocks": [],
      "data": null
    },
    {
      "blockName": "magicieuse/featured-products",
      "attrs": {
        "title": "A l'affiche",
        "productIds": [76, 77, 78]
      },
      "innerHTML": "",
      "innerBlocks": [],
      "data": {
        "products": []
      }
    }
  ]
}
```

Exemple PHP simplifie :

```php
register_rest_route('magicieuse/v1', '/page/(?P<slug>[a-zA-Z0-9-]+)/blocks', [
  'methods' => 'GET',
  'callback' => 'magicieuse_get_page_blocks',
  'permission_callback' => '__return_true',
]);

function magicieuse_get_page_blocks($request) {
  $slug = sanitize_title($request['slug']);

  $posts = get_posts([
    'name' => $slug,
    'post_type' => 'page',
    'post_status' => 'publish',
    'numberposts' => 1,
  ]);

  if (!$posts) {
    return new WP_Error('not_found', 'Page not found', ['status' => 404]);
  }

  $post = $posts[0];
  $blocks = parse_blocks($post->post_content);

  return [
    'meta' => [
      'id' => $post->ID,
      'slug' => $post->post_name,
      'title' => get_the_title($post),
    ],
    'blocks' => array_map('magicieuse_normalize_block', $blocks),
  ];
}
```

Normalisation :

```php
function magicieuse_normalize_block($block) {
  return [
    'blockName' => $block['blockName'] ?? null,
    'attrs' => $block['attrs'] ?? [],
    'innerHTML' => $block['innerHTML'] ?? '',
    'innerBlocks' => array_map(
      'magicieuse_normalize_block',
      $block['innerBlocks'] ?? []
    ),
    'data' => magicieuse_enrich_block($block),
  ];
}
```

Enrichissement :

```php
function magicieuse_enrich_block($block) {
  $name = $block['blockName'] ?? '';
  $attrs = $block['attrs'] ?? [];

  if ($name === 'magicieuse/featured-products') {
    $ids = $attrs['productIds'] ?? [];

    return [
      'products' => magicieuse_get_products_for_react($ids),
    ];
  }

  if ($name === 'core/image' && !empty($attrs['id'])) {
    return [
      'image' => magicieuse_get_image_for_react((int) $attrs['id']),
    ];
  }

  return null;
}
```

Regle importante :

```text
Les composants React utilisent attrs + data.
innerHTML sert seulement au fallback ou aux blocs typographiques simples.
```

Cette modification du plugin ne remplace pas immediatement l'ancien systeme.
Elle ajoute un contrat API plus propre, utilisable progressivement page par page
et bloc par bloc.

---

## Avantages

```text
Ordre des sections controle par WordPress
Composants React reutilisables
Migration progressive bloc par bloc
Theme SCSS stable
Mapping adaptable par client
Fallback HTML pour le legacy
```

---

## Limites

Cette approche ne transforme pas automatiquement n'importe quel HTML Elementor
en composant React propre.

Pour avoir un vrai composant React, le bloc doit avoir :

```text
un blockName connu
des attrs exploitables
ou une transformation API specifique
```

Sinon, le bloc doit rester en fallback HTML.

---

## Regle pratique

```text
Bloc WordPress connu et important
-> composant React

Bloc inconnu, legacy ou editorial
-> fallback HTML

Style global
-> variables CSS + theme SCSS

Differences client
-> mapping client + adaptateur SCSS client
```
