# Audit code front React et API WordPress

Date : 2026-06-05

Ce document resume les problemes trouves dans le front React/Vite et dans le plugin WordPress custom `magicieuse-headless-api`.

## Etat general

Le projet compile, mais il n'est pas encore propre techniquement.

- `npm run build` : OK.
- `npm run lint` : KO.
- API WooCommerce Store : OK.
- API custom WordPress `magicieuse/v1` : OK pour menu, page et collection.

Les priorites sont :

1. corriger les erreurs ESLint ;
2. securiser les liens WooCommerce natifs ;
3. rendre l'API WordPress capable de lire les pages et les articles ;
4. nettoyer les doublons et les incoherences.

## Problemes bloquants

### 1. Le lint echoue

Le build passe, mais `npm run lint` remonte plusieurs erreurs.

Fichiers concernes :

- `src/features/cart/CartContext.tsx`
- `src/features/cart/CartPage.tsx`
- `src/features/collection/useCollection.ts`
- `src/features/product/useProduct.ts`
- `src/features/wp-page/WpPagePage.tsx`
- `src/shared/components/Header/Header.tsx`

Problemes principaux :

- plusieurs hooks font du `setState` direct dans un `useEffect` ;
- `CartPage.tsx` utilise `loadCart` dans un effet avant sa declaration ;
- `CartContext.tsx` exporte a la fois un composant et un hook, ce qui declenche une erreur Fast Refresh ;
- `Header.tsx` a une dependance manquante dans un `useEffect`.

Ce n'est pas encore dangereux en production si le build passe, mais c'est un mauvais signal. Le lint doit redevenir vert avant de continuer a complexifier l'app.

### 2. Les liens WooCommerce natifs sont fragiles

Les routes WooCommerce natives comme :

- `/checkout/`
- `/cart/`
- `/my-account/`

sont traitees comme des liens externes a React, mais elles restent relatives au domaine courant.

En developpement, si le front tourne sur `http://localhost:5173`, un lien vers `/checkout/` peut partir vers :

```txt
http://localhost:5173/checkout/
```

au lieu de :

```txt
http://localhost/MAGICIEUSE/htdocs/checkout/
```

Fichiers concernes :

- `src/shared/components/MenuLink/MenuLink.tsx`
- `src/features/cart/CartPage.tsx`
- `src/shared/components/Header/Header.tsx`

Solution conseillee :

- creer un helper pour generer les URLs WordPress natives ;
- ou configurer le serveur de production pour laisser `/checkout/`, `/cart/` et `/my-account/` a WordPress ;
- eviter d'ecrire ces chemins en dur dans plusieurs composants.

### 3. React ne lit pas encore les articles WordPress

L'objectif est que l'admin WordPress puisse creer du contenu avec Gutenberg ou Elementor, puis que React l'affiche.

Actuellement, le plugin expose :

```txt
/wp-json/magicieuse/v1/page/{slug}
```

Mais cote WordPress, cette route cherche uniquement dans le type `page`.

Consequence :

- une page WordPress peut etre lue ;
- un article WordPress ne sera pas trouve ;
- un contenu admin de type `post` ne sera pas affiche dans React.

Fichiers concernes :

- `wp-content/plugins/magicieuse-headless-api/magicieuse-headless-api.php`
- `src/features/wp-page/WpPagePage.tsx`
- `src/shared/api/wordpress.ts`

Solution conseillee :

- remplacer ou completer l'endpoint `page/{slug}` par un endpoint plus generique ;
- par exemple `/magicieuse/v1/content/{slug}` ;
- chercher d'abord une page, puis un article ;
- renvoyer le type de contenu dans la reponse : `page` ou `post`.

## Problemes moyens

### 4. Le cache menu masque les erreurs

Dans `src/shared/api/wordpress.ts`, la fonction `getMenu()` attrape toutes les erreurs et retourne un tableau vide.

Effet :

- si l'API menu casse, le header/footer deviennent vides ;
- l'erreur n'est pas visible ;
- le tableau vide est mis en cache.

Ce comportement est pratique pour eviter un crash, mais dangereux pendant le developpement.

Solution conseillee :

- logger l'erreur en developpement ;
- ne pas cacher definitivement une reponse vide issue d'une erreur ;
- eventuellement afficher un menu minimal de secours.

### 5. Doublon entre Header et Footer

`Header.tsx` et `Footer.tsx` reconstruisent chacun un arbre de menu a partir des items WordPress.

Probleme :

- meme logique dupliquee ;
- risque de divergence entre header et footer ;
- maintenance plus difficile.

Solution conseillee :

- creer un helper partage, par exemple `buildMenuTree()`.

### 6. Doublon de formatage des prix

Le formatage des prix existe a plusieurs endroits :

- `src/shared/components/ProductPrice/ProductPrice.tsx`
- `src/features/cart/CartPage.tsx`

Problemes :

- duplication ;
- format pas vraiment francais ;
- risque d'afficher des prix differents selon la page.

Solution conseillee :

- creer un helper unique `formatWooPrice()`;
- utiliser `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`;
- garder la logique WooCommerce centimes vers euros dans un seul fichier.

### 7. Entites HTML visibles dans les titres

Certains titres WordPress/WooCommerce peuvent arriver avec des entites HTML :

```txt
c&rsquo;est
&#8211;
```

React ne decode pas automatiquement ces entites quand elles sont affichees comme texte.

Effet :

- les noms de produits peuvent apparaitre mal formes ;
- les titres de pages, categories ou menus peuvent aussi etre touches.

Solution conseillee :

- creer un helper pour decoder les entites HTML ;
- l'utiliser pour les titres, menus, categories et noms de produits ;
- garder `dangerouslySetInnerHTML` uniquement pour les vrais contenus HTML venant de WordPress.

### 8. Les requetes React ne sont pas annulees

Les hooks de chargement comme :

- `useProduct`
- `useCollection`
- `WpPagePage`
- `ApiCheckPage`

lancent des fetchs sans mecanisme d'annulation ou d'ignorance si le composant est demonte.

Risque :

- mise a jour d'etat apres changement de route ;
- affichage temporaire de donnees d'une ancienne page ;
- comportement instable si l'utilisateur navigue vite.

Solution conseillee :

- utiliser un flag `ignore` dans le `useEffect` ;
- ou utiliser `AbortController` ;
- plus tard, envisager une librairie de cache/requetes comme TanStack Query.

## Problemes mineurs

### 9. Configuration Node non verrouillee

La machine doit utiliser Node `20.19`.

Le projet devrait contenir au minimum :

- `.node-version`
- ou un champ `engines` dans `package.json`

Sans cela, le probleme deja rencontre avec Vite/Rolldown peut revenir si une autre version de Node est utilisee.

### 10. Proxy Vite tres local

Dans `vite.config.ts`, le proxy pointe vers :

```txt
http://localhost/MAGICIEUSE/htdocs
```

C'est correct pour cette machine, mais ce n'est pas portable.

Solution conseillee :

- garder cette config pour le dev local ;
- documenter la config de production ;
- prevoir une variable d'environnement si le projet doit tourner ailleurs.

### 11. Documentation legerement decalee

Certaines notes parlent encore de `src/shared/api`, alors que le code actuel utilise :

```txt
src/shared/api
```

Il faut harmoniser les docs pour eviter de suivre une ancienne architecture.

## Analyse du plugin WordPress custom

Plugin analyse :

```txt
wp-content/plugins/magicieuse-headless-api/magicieuse-headless-api.php
```

Le plugin est utile pour un WordPress headless. Il n'est pas inutilement complique pour les menus, car WordPress REST ne fournit pas toujours simplement les emplacements de menus actifs.

Endpoints presents :

- `/magicieuse/v1/menu/{location}`
- `/magicieuse/v1/page/{slug}`
- `/magicieuse/v1/collection/{slug}`

Points positifs :

- les menus sont recuperables par emplacement ;
- le plugin calcule un `path` utilisable par React ;
- les categories WooCommerce sont exposees avec leur image ;
- le contenu de page passe par `the_content`, donc Gutenberg est correctement rendu en HTML.

Points a ameliorer :

- l'endpoint `page/{slug}` ne lit pas les articles ;
- les titres devraient etre decodes proprement ;
- `is_external` devrait etre calcule avec une comparaison d'URL plus robuste ;
- les routes REST pourraient etre regroupees pour une meilleure lisibilite ;
- aucun endpoint Instagram n'est encore implemente, malgre le document d'option Instagram.

## Priorite conseillee

Ordre de travail recommande :

1. Corriger le lint.
2. Ajouter `.node-version` ou `engines`.
3. Creer un helper pour les URLs WordPress natives.
4. Creer un endpoint WordPress `content/{slug}` pour pages et articles.
5. Centraliser le formatage des prix.
6. Centraliser le decodage des entites HTML.
7. Nettoyer les doublons menu Header/Footer.
8. Mettre a jour les docs avec les vrais chemins actuels.

## Conclusion

La base est correcte pour un front React connecte a WooCommerce et WordPress.

Le plus important maintenant n'est pas le style. Il faut d'abord stabiliser la couche data :

- routes WordPress ;
- panier WooCommerce ;
- menus actifs ;
- contenu admin Gutenberg/Elementor ;
- gestion propre des erreurs API.

Une fois cette base propre, le style SCSS/Tailwind pourra etre travaille sans devoir revenir casser l'architecture.
