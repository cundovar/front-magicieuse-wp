# Optimisations performance — OVH Mutualisé

## Contexte

- **Hébergement** : OVH mutualisé (Apache, PHP partagé, pas de Redis)
- **Architecture** : WordPress headless + React SPA sur le même hébergement
- **Contraintes** : pas de Node.js, pas de Memcached/Redis, pas de PHP-FPM tuning
- **Point positif** : React et WP sur le même serveur → pas de latence réseau entre les deux

---

## Diagnostic du problème

Sans optimisation, chaque chargement de page enchaîne :

```
1. Navigateur charge index.html        ~50ms   (fichier statique, rapide)
2. Navigateur charge le bundle JS      ~200ms  (fichier statique, rapide)
3. React monte et lance les appels API
   → getFrontPage()                    ~500ms  (PHP + WP + DB)
   → getFrontPageBlocks()              ~500ms  (PHP + WP + DB)
   → ThemeLoader fetch /theme          ~300ms  (PHP + WP + DB)
4. React reçoit les données et render  ~50ms
```

**Total estimé sans cache : 1.5s – 2.5s avant affichage du contenu**

---

## Plan d'action (par priorité)

### Priorité 1 — Fusionner les appels API

**Problème** : 3 requêtes HTTP séparées vers PHP au chargement de la homepage.  
**Gain estimé** : −600ms à −1s

Créer un endpoint unique `/wp-json/magicieuse/v1/front` qui retourne en une seule réponse :

```json
{
  "theme": "magicieuse",
  "page": { "title": "...", "content": "..." },
  "blocks": [ ... ]
}
```

Côté React, remplacer les 3 appels dans `HomePage.tsx` + `ThemeLoader.tsx` par un seul `fetchJson('/magicieuse/v1/front')`.

---

### Priorité 2 — WP_Transients (cache base de données)

**Problème** : PHP + WordPress + WooCommerce booté à chaque requête REST.  
**Gain estimé** : réponse en ~10ms au lieu de ~500ms pour les visiteurs suivants

```php
// Exemple sur l'endpoint front-page-blocks
function magicieuse_rest_get_front_page_blocks() {
    $cached = get_transient('magicieuse_front_blocks');
    if ($cached !== false) {
        return rest_ensure_response($cached);
    }

    // ... logique existante de construction de la réponse ...

    set_transient('magicieuse_front_blocks', $data, 10 * MINUTE_IN_SECONDS);
    return rest_ensure_response($data);
}

// Invalider le cache à chaque sauvegarde de page
add_action('save_post', function() {
    delete_transient('magicieuse_front_blocks');
    delete_transient('magicieuse_front_page');
    delete_transient('magicieuse_front');
});
```

À appliquer sur tous les endpoints : `front`, `front-page-blocks`, `products`, `categories`, `menus`.

---

### Priorité 3 — Cache côté React avec SWR

**Problème** : à chaque navigation, les données sont re-fetchées même si elles n'ont pas changé.  
**Gain estimé** : chargement instantané au retour sur une page déjà visitée

```bash
npm install swr
```

```tsx
// Avant (dans HomePage.tsx)
const [data, setData] = useState(null)
useEffect(() => { fetchData().then(setData) }, [])

// Après avec SWR
import useSWR from 'swr'
const { data } = useSWR('/magicieuse/v1/front', fetchJson, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute
})
```

Les données survivent à la navigation et ne sont re-fetchées qu'après expiration.

---

### Priorité 4 — Configuration `.htaccess`

**Problème** : Apache doit servir `index.html` pour toutes les routes React sans casser les URLs WordPress.

```apache
RewriteEngine On

# WordPress — laisser passer
RewriteRule ^wp-json/    - [L]
RewriteRule ^wp-admin/   - [L]
RewriteRule ^wp-content/ - [L]
RewriteRule ^wp-login\.php - [L]
RewriteRule ^xmlrpc\.php   - [L]

# WordPress lui-même (si WP à la racine)
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# SPA React — tout le reste → index.html
RewriteRule ^ /index.html [L]
```

> Si WordPress est dans un sous-dossier `/wp/`, adapter les règles en conséquence.

---

### Priorité 5 — Build de production Vite

**Rappel** : le dev server Vite ne doit jamais être déployé sur OVH.

```bash
cd magicieuse-front
npm run build
# Les fichiers optimisés sont dans dist/
```

Le build produit :
- Code minifié et tree-shaken
- Assets avec hash de contenu (cache navigateur long terme)
- Chunking automatique (vendor JS séparé)

Configurer Apache pour envoyer des headers de cache longs sur les assets hashés :

```apache
# Cache 1 an sur les assets Vite (noms hashés = safe)
<FilesMatch "\.(js|css|woff2|png|jpg|svg|webp)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Pas de cache sur index.html
<Files "index.html">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
```

---

## Résultat attendu après optimisations

| Situation | Temps estimé |
|---|---|
| Sans optimisation (dev) | 2–4s |
| Avec transients + endpoint fusionné | 0.8–1.2s (1er visiteur) |
| Avec SWR (retour sur page visitée) | < 100ms |
| Assets statiques (JS/CSS) | < 200ms (cache navigateur) |

---

## Structure WP sur OVH (recommandée)

```
public_html/
├── index.html          ← React build
├── assets/             ← JS/CSS/images Vite
├── .htaccess           ← Routing SPA + WP
└── wp/                 ← WordPress dans sous-dossier
    ├── wp-admin/
    ├── wp-content/
    └── wp-json/        → accessible via /wp/wp-json/
```

Dans `wp-config.php` :

```php
define('WP_HOME', 'https://monsite.fr');
define('WP_SITEURL', 'https://monsite.fr/wp');
```

Dans le `.env` React :

```env
VITE_WP_API_BASE=https://monsite.fr/wp/wp-json
```
