# Pages et articles WordPress dans React

WordPress reste le back-office du projet headless.

L'admin peut donc continuer a creer :

- des pages ;
- des articles ;
- du contenu texte ;
- des images ;
- des videos ;
- des galeries ;
- des blocs Gutenberg.

React lit ensuite ce contenu via l'API REST WordPress et l'affiche dans le front.

## Endpoints utiles

Pages :

```text
GET /wp-json/wp/v2/pages
GET /wp-json/wp/v2/pages?slug=ma-page
GET /wp-json/wp/v2/pages?slug=ma-page&_embed
```

Articles :

```text
GET /wp-json/wp/v2/posts
GET /wp-json/wp/v2/posts?slug=mon-article
GET /wp-json/wp/v2/posts?slug=mon-article&_embed
```

Medias :

```text
GET /wp-json/wp/v2/media
```

`_embed` est utile pour recuperer directement certains medias lies au contenu, notamment l'image mise en avant.

## Affichage cote React

WordPress renvoie le contenu HTML final dans :

```ts
page.content.rendered
post.content.rendered
```

React peut l'afficher avec :

```tsx
<article
  className="wp-content"
  dangerouslySetInnerHTML={{ __html: page.content.rendered }}
/>
```

Cette approche est acceptable ici parce que le contenu vient de WordPress, gere par un admin.

Ne pas utiliser cette methode pour afficher du contenu utilisateur non controle.

## Gutenberg

Gutenberg est le meilleur choix pour les nouvelles pages et articles dans un projet headless.

Quand l'admin cree une page avec Gutenberg, WordPress transforme les blocs en HTML dans `content.rendered`.

Exemples de blocs qui passent bien :

- paragraphes ;
- titres ;
- listes ;
- images ;
- galeries ;
- colonnes ;
- citations ;
- boutons ;
- videos ;
- embeds YouTube/Vimeo.

Le HTML peut contenir des classes WordPress comme :

```html
<figure class="wp-block-image">...</figure>
<div class="wp-block-columns">...</div>
<blockquote class="wp-block-quote">...</blockquote>
<figure class="wp-block-video">...</figure>
```

Il faut donc prevoir un style dedie dans React.

## Style du contenu WordPress

Creer un fichier SCSS dedie :

```text
src/styles/wp-content.scss
```

Exemples de selecteurs a gerer :

```scss
.wp-content {
  h1,
  h2,
  h3 {
    // titres WordPress
  }

  p {
    // paragraphes
  }

  a {
    // liens
  }

  img {
    max-width: 100%;
    height: auto;
  }

  figure {
    margin: 0;
  }

  .wp-block-image,
  .wp-block-gallery,
  .wp-block-columns,
  .wp-block-quote,
  .wp-block-video {
    // styles blocs Gutenberg
  }
}
```

## Route dynamique conseillee

Prevoir une route React dynamique :

```text
/:slug/
```

Cette route peut chercher dans WordPress :

1. une page avec ce slug ;
2. sinon un article avec ce slug ;
3. sinon afficher une page 404 React.

Exemple logique :

```ts
const page = await getPageBySlug(slug)

if (page) {
  return page
}

const post = await getPostBySlug(slug)

if (post) {
  return post
}

throw new Error('Not found')
```

## Images et videos

Il y a deux cas.

### Image dans le contenu

Si l'admin ajoute une image dans Gutenberg, elle arrive directement dans `content.rendered`.

React l'affiche avec le HTML WordPress.

### Image mise en avant

WordPress renvoie souvent :

```ts
featured_media: 123
```

Il faut alors :

- utiliser `_embed` ;
- ou appeler `/wp-json/wp/v2/media/123`.

## Elementor

Elementor est possible, mais moins propre pour un front React headless.

Avec Elementor, WordPress peut stocker :

- beaucoup de HTML genere ;
- des classes Elementor ;
- du CSS genere dans `wp-content/uploads/elementor/css/` ;
- des scripts necessaires a certains widgets ;
- des shortcodes ;
- des donnees internes Elementor.

L'API REST peut quand meme renvoyer :

```ts
page.content.rendered
```

Mais le rendu peut etre incomplet si React ne charge pas :

- le CSS Elementor ;
- le CSS du theme ;
- certains scripts Elementor ;
- les assets de widgets.

## Strategie Elementor

Pour ce projet :

```text
Gutenberg = recommande pour les nouvelles pages
Elementor = a eviter pour les nouvelles pages headless
Elementor existant = garder temporairement ou migrer progressivement
```

Cas possibles :

- page importante : reconstruire proprement en React ou Gutenberg ;
- page secondaire Elementor : la laisser cote WordPress temporairement ;
- ancienne page Elementor utile : recuperer le contenu HTML et tester le rendu dans React ;
- widget Elementor complexe : remplacer par un composant React natif.

## Regle de decision

Utiliser Gutenberg quand l'admin doit pouvoir creer du contenu editorial.

Utiliser React natif quand la page est une vraie interface :

- boutique ;
- fiche produit ;
- collection ;
- panier ;
- recherche ;
- filtres ;
- composants interactifs.

Garder WooCommerce natif pour :

- checkout ;
- paiement ;
- commandes ;
- compte client si necessaire.

## Decision pour La Magicieuse

```text
Pages/articles admin simples      Gutenberg + REST API
Anciennes pages Elementor         migration progressive
Boutique et produits              React natif + WooCommerce Store API
Checkout                          WooCommerce natif
Style du contenu WordPress        .wp-content en SCSS
```
