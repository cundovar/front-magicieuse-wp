# Instagram en headless avec Smash Balloon

Le plugin WordPress installe est :

```text
Smash Balloon Instagram Feed
plugin: instagram-feed
shortcode: [instagram-feed]
```

## Objectif

Afficher le flux Instagram dans le front React sans connecter directement React a Instagram.

WordPress garde :

- la connexion au compte Instagram ;
- le token ;
- le cache ;
- la logique du plugin Smash Balloon.

React recupere seulement le rendu depuis une route API WordPress.

## Option retenue

Creer un endpoint WordPress custom :

```text
GET /wp-json/magicieuse/v1/instagram-feed
```

Cet endpoint retourne le HTML genere par le shortcode :

```text
[instagram-feed]
```

## Avantages

- Pas de token Instagram dans React.
- Pas d'appel direct a l'API Instagram depuis le navigateur.
- Le plugin continue de gerer le cache.
- Le flux reste configurable depuis l'admin WordPress.
- React peut afficher le flux comme une section normale du site.

## Exemple de code WordPress

A placer dans un petit plugin custom, par exemple :

```text
wp-content/plugins/magicieuse-headless-api/magicieuse-headless-api.php
```

Code :

```php
<?php
/**
 * Plugin Name: Magicieuse Headless API
 * Description: Endpoints custom pour le front React headless.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('magicieuse/v1', '/instagram-feed', [
        'methods' => 'GET',
        'callback' => 'magicieuse_get_instagram_feed',
        'permission_callback' => '__return_true',
    ]);
});

function magicieuse_get_instagram_feed() {
    if (!shortcode_exists('instagram-feed')) {
        return new WP_REST_Response([
            'html' => '',
            'error' => 'Le shortcode instagram-feed est indisponible.',
        ], 500);
    }

    $html = do_shortcode('[instagram-feed]');

    return new WP_REST_Response([
        'html' => $html,
    ], 200);
}
```

## Appel cote React

Ajouter une fonction API :

```ts
import { fetchJson } from './config'

type InstagramFeedResponse = {
  html: string
  error?: string
}

export function getInstagramFeed() {
  return fetchJson<InstagramFeedResponse>('/magicieuse/v1/instagram-feed')
}
```

Puis dans un composant React :

```tsx
import { useEffect, useState } from 'react'
import { getInstagramFeed } from '../api/instagram'

function InstagramFeed() {
  const [html, setHtml] = useState('')

  useEffect(() => {
    async function loadFeed() {
      const response = await getInstagramFeed()
      setHtml(response.html)
    }

    void loadFeed()
  }, [])

  return <section dangerouslySetInnerHTML={{ __html: html }} />
}
```

## Attention

`dangerouslySetInnerHTML` est acceptable ici seulement parce que le HTML vient de WordPress et du plugin installe localement.

Ne pas utiliser cette methode pour afficher du contenu utilisateur non controle.

## CSS et JS du plugin

Le shortcode peut generer du HTML qui depend du CSS/JS Smash Balloon.

Si le rendu React apparait sans style ou sans comportement, il faudra soit :

- charger les fichiers CSS du plugin dans React ;
- recreer le style Instagram en React/SCSS ;
- ou exposer seulement les donnees des posts au lieu du HTML.

Pour commencer, l'option HTML est la plus rapide.

## Verification

Tester l'endpoint dans le navigateur :

```text
http://localhost/MAGICIEUSE/htdocs/wp-json/magicieuse/v1/instagram-feed
```

Avec le proxy Vite, tester aussi :

```text
http://localhost:5173/wp-json/magicieuse/v1/instagram-feed
```

## Prerequis

Avant de brancher React :

- verifier que le plugin Smash Balloon est actif ;
- verifier que le compte Instagram est connecte dans l'admin WordPress ;
- verifier que le shortcode `[instagram-feed]` fonctionne dans une page WordPress.

## Decision

Pour le projet headless :

```text
WordPress connecte Instagram
Smash Balloon gere le cache
Endpoint custom expose le rendu
React affiche le flux
```
