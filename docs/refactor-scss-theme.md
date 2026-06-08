# Refactor SCSS et Theme

Date : 2026-06-05

## Objectif

Rendre le front React themable sans lier les composants aux styles d'un client
WordPress precis.

Le theme doit pouvoir modifier :

- couleurs ;
- typographies ;
- rayons ;
- ombres ;
- boutons ;
- cartes produits ;
- header/footer ;
- blocs de page importants.

Sans devoir reecrire les composants React.

---

## Structure retenue

```text
src/styles/variables.scss
src/styles/main.scss
src/styles/wp-content.scss

src/themes/theme-example.scss
src/themes/clients/magicieuse-wp.scss
```

Roles :

```text
variables.scss              → theme par defaut + contrat de variables
main.scss                   → styles globaux React
wp-content.scss             → styles generiques du contenu WP
theme-example.scss          → identite visuelle test
clients/magicieuse-wp.scss  → adaptation des classes WP reelles de ce site
```

Ordre d'import :

```ts
import './styles/tailwind.css'
import './styles/main.scss'
import './styles/wp-content.scss'
import './themes/theme-example.scss'
import './themes/clients/magicieuse-wp.scss'
```

---

## Regle principale

Les composants ne doivent pas hardcoder les valeurs visuelles importantes.

Preferer :

```scss
.product-card {
  border-radius: var(--product-card-radius);
  background: var(--product-card-background);
  box-shadow: var(--product-card-shadow);
}
```

Au lieu de :

```scss
.product-card {
  border-radius: 8px;
  background: #fff;
}
```

Le fichier `variables.scss` fournit la valeur par defaut.
Un theme peut ensuite surcharger uniquement la variable.

---

## Hooks de theme deja crees

Exemples :

```text
--button-radius
--button-shadow
--button-font-weight

--header-background
--header-height
--header-link-radius
--header-submenu-shadow

--product-card-radius
--product-card-shadow
--product-card-image-radius

--product-page-image-radius
--product-category-background

--collection-header-background
--collection-header-radius

--cart-summary-background
--cart-summary-radius
--cart-summary-shadow

--home-article-background
--home-article-radius
--home-title-font-size
```

---

## Adaptateurs client WP

Les classes envoyees par WordPress, Elementor, WooCommerce ou un shortcode ne
doivent pas etre melangees dans les SCSS generiques des composants.

Exemple a eviter :

```scss
/* HomePage.scss */
.elementor-container { ... }
.wpsf-product { ... }
#sb_instagram { ... }
```

Exemple prefere :

```scss
/* themes/clients/magicieuse-wp.scss */
.wp-content {
  .elementor-container { ... }
  .wpsf-product { ... }
  #sb_instagram { ... }
}
```

Comme ca, un autre client WordPress peut avoir son propre adaptateur :

```text
src/themes/clients/client-x-wp.scss
```

---

## Limite assumee

Les boutons recus en HTML WordPress ne deviennent pas de vrais composants React.
Ils peuvent seulement utiliser le meme contrat visuel via CSS :

```scss
.wp-content .button {
  border-radius: var(--button-radius);
  box-shadow: var(--button-shadow);
}
```

Pour obtenir de vrais composants React reutilisables, il faut consommer des
donnees structurees via API, pas du HTML brut.
