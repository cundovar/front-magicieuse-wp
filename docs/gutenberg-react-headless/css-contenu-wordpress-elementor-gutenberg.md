# CSS pour contenu WordPress, Gutenberg et Elementor

Date : 2026-06-05

Ce document explique comment gerer le style du contenu WordPress affiche dans le front React.

## Principe

Le front React peut recevoir du HTML venant de WordPress.

Ce HTML peut venir de :

- Gutenberg ;
- Elementor ;
- shortcodes ;
- widgets WooCommerce ;
- plugins WordPress.

React affiche ce contenu, mais le style final doit etre controle cote front.

Il faut donc une feuille SCSS dediee au contenu WordPress.

Exemple conseille :

```txt
src/styles/wp-content.scss
```

Ce fichier sert de pont entre :

- le HTML genere par WordPress ;
- le design controle par React.

## Ce qu'il ne faut pas faire

Il ne faut pas essayer de recopier tout le CSS Elementor ou tout le CSS Gutenberg.

Ce serait :

- trop lourd ;
- difficile a maintenir ;
- fragile ;
- dependant des plugins ;
- dependant des classes generees automatiquement.

Il ne faut pas non plus styler les classes Elementor trop specifiques.

Exemples a eviter :

```scss
.elementor-element-c3860b1 {}
.elementor-element-567444d {}
.elementor-element-be57d5e {}
```

Ces classes correspondent a des sections ou widgets precis.

Si le client modifie la page, ces classes peuvent changer ou disparaitre.

## Ce qu'il faut faire

Il faut creer une base de rendu generique pour le contenu WordPress.

Exemple :

```scss
.wp-content {
  h1,
  h2,
  h3,
  h4,
  p,
  ul,
  ol,
  blockquote,
  figure,
  img {
    max-width: 100%;
  }
}
```

Puis ajouter seulement les blocs reellement utilises par le client.

## Classes Gutenberg utiles

Classes Gutenberg courantes a prevoir :

```scss
.wp-content {
  .wp-block-image {}
  .wp-block-gallery {}
  .wp-block-columns {}
  .wp-block-column {}
  .wp-block-button {}
  .wp-block-buttons {}
  .wp-block-quote {}
  .wp-block-separator {}
  .wp-block-embed {}
  .wp-block-video {}
  .wp-block-media-text {}
}
```

Ces classes couvrent une bonne base pour les pages editoriales simples.

## Classes Elementor utiles

Classes Elementor generiques a prevoir :

```scss
.wp-content {
  .elementor {}
  .elementor-section {}
  .elementor-container {}
  .elementor-column {}
  .elementor-widget-wrap {}
  .elementor-widget {}
  .elementor-widget-heading {}
  .elementor-widget-text-editor {}
  .elementor-widget-image {}
  .elementor-widget-button {}
}
```

Ces classes permettent d'avoir une base de compatibilite sans refaire tout Elementor.

## Widgets et shortcodes

Certains contenus peuvent venir de widgets ou shortcodes.

Exemples possibles :

- Instagram ;
- produits WooCommerce ;
- categories WooCommerce ;
- formulaire ;
- slider ;
- carrousel.

Ils doivent etre traites au cas par cas.

Exemple :

```scss
.wp-content {
  .woocommerce {}
  .product_list_widget {}
  .widget_product_categories {}
  .sbi {}
}
```

Mais il ne faut ajouter ces styles que si ces blocs sont vraiment utilises.

## Methode conseillee

La bonne methode est progressive.

1. Afficher la page WordPress dans React.
2. Inspecter le HTML genere.
3. Identifier les classes utiles.
4. Ajouter seulement les styles necessaires dans `wp-content.scss`.
5. Tester desktop et mobile.
6. Ajouter de nouveaux styles seulement quand le client utilise un nouveau bloc.

## Structure conseillee

Structure SCSS possible :

```txt
src/styles/main.scss
src/styles/tailwind.css
src/styles/wp-content.scss
```

Role des fichiers :

```txt
main.scss
  Style global de l'application React.

tailwind.css
  Directives Tailwind.

wp-content.scss
  Style du HTML venant de WordPress, Gutenberg, Elementor et shortcodes.
```

Ensuite, importer `wp-content.scss` dans `main.tsx` ou `main.scss`.

## Exemple de base

Exemple de depart :

```scss
.wp-content {
  width: 100%;
}

.wp-content img {
  max-width: 100%;
  height: auto;
}

.wp-content iframe {
  max-width: 100%;
}

.wp-content figure {
  margin: 0 0 24px;
}

.wp-content p {
  margin: 0 0 16px;
}

.wp-content h2,
.wp-content h3,
.wp-content h4 {
  margin: 32px 0 16px;
}

.wp-content .wp-block-columns,
.wp-content .elementor-container {
  display: flex;
  gap: 24px;
}

@media (max-width: 768px) {
  .wp-content .wp-block-columns,
  .wp-content .elementor-container {
    flex-direction: column;
  }
}
```

Ce n'est pas un style final, seulement une base technique.

## Attention avec Elementor

Elementor peut injecter :

- du HTML ;
- des classes ;
- des styles inline ;
- des balises `<style>` ;
- des widgets avec JavaScript ;
- des shortcodes ;
- des liens WooCommerce ;
- des carrousels ou sliders.

React peut afficher le HTML, mais il ne garantit pas que tout le comportement Elementor fonctionne.

Donc Elementor doit etre valide bloc par bloc.

## Regle importante

Le fichier `wp-content.scss` ne doit pas devenir une copie complete d'Elementor.

Il doit seulement contenir :

- une base typographique ;
- les styles des blocs Gutenberg courants ;
- les styles Elementor generiques ;
- les corrections pour les blocs vraiment utilises ;
- les adaptations responsive.

## Conclusion

Oui, il faut un fichier dedie pour styler le contenu WordPress.

Mais non, il ne faut pas reprendre toutes les classes possibles de Gutenberg et Elementor.

La bonne approche est :

```txt
base generique + blocs reellement utilises + corrections progressives
```

Cela garde le front React propre, maintenable et suffisamment flexible pour le client.
