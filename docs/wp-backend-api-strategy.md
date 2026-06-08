# WordPress comme Backend API

Date : 2026-06-05

## Decision

La cible d'architecture est :

```text
WordPress = backend, admin, contenu, WooCommerce
React     = rendu, composants, UX, theme
```

Le front React ne doit pas dependre du HTML WordPress pour les zones importantes
de l'experience utilisateur.

---

## Probleme avec le HTML WordPress brut

Aujourd'hui certaines pages utilisent :

```tsx
dangerouslySetInnerHTML={{ __html: page.content }}
```

Cela injecte du HTML deja rendu par WordPress.

Limites :

- React ne controle pas les elements internes ;
- un bouton WP ne devient pas un composant React `<Button />` ;
- les classes varient selon Gutenberg, Elementor, WooCommerce, shortcodes ;
- le style doit deviner les classes envoyees ;
- certains plugins injectent du HTML difficile a rendre proprement.

Donc cette approche est acceptable pour du contenu libre, mais fragile pour les
pages produit, accueil, catalogue, panier ou blocs commerciaux.

---

## Architecture cible

Pour les zones importantes, WordPress doit exposer des donnees JSON structurees.

Exemple pour l'accueil :

```json
{
  "hero": {
    "eyebrow": "Albums jeunesse engages",
    "title": "Des livres pour grandir...",
    "text": "La Magicieuse publie...",
    "image": "https://...",
    "primaryCta": {
      "label": "Explorer les livres",
      "href": "/boutique/"
    }
  },
  "featuredProducts": [],
  "collections": [],
  "instagramUrl": "https://instagram.com/..."
}
```

React rend ensuite :

```tsx
<HomeHero />
<ProductList />
<CollectionGrid />
<Button />
```

Les composants sont alors reutilisables, themables et testables.

---

## Deux modes a conserver

### 1. Mode structure recommande

Pour :

```text
Accueil
Boutique
Produit
Collection
Panier
Artistes
Blocs commerciaux
```

Source :

```text
REST API WordPress
WooCommerce Store API
Endpoints custom magicieuse/v1
ACF ou champs custom si besoin
```

Rendu :

```text
Composants React
Theme SCSS
Variables CSS
```

### 2. Mode HTML fallback

Pour :

```text
Mentions legales
Pages editoriales simples
Anciens contenus WP
Articles non critiques
```

Source :

```text
page.content rendu par WordPress
```

Rendu :

```text
dangerouslySetInnerHTML
wp-content.scss
themes/clients/*-wp.scss si besoin
```

---

## Edition cote WordPress : liberte vs composants React

Point important : si l'utilisateur WordPress veut modifier librement les blocs,
les classes CSS, les IDs et la structure comme dans Elementor, alors React ne
peut pas rester totalement maitre du rendu.

Il faut choisir le niveau de controle attendu.

### Niveau 1 — Edition libre WordPress

WordPress garde la liberte totale :

```text
Elementor / Gutenberg / shortcodes
HTML rendu par WordPress
classes et IDs choisis cote WP
```

React recoit :

```json
{
  "layout": "html",
  "contentHtml": "<div class=\"elementor ...\">...</div>"
}
```

Avantages :

```text
Liberte maximale pour l'admin WP
Compatible avec Elementor et plugins existants
Migration rapide du contenu legacy
```

Limites :

```text
React ne controle pas les elements internes
Un bouton WP ne devient pas un composant React
Le style depend des classes envoyees par WP
Besoin d'adaptateurs themes/clients/*-wp.scss
```

### Niveau 2 — Edition structuree

WordPress ne renvoie pas du HTML, mais des donnees metier :

```json
{
  "type": "hero",
  "title": "Des livres pour grandir",
  "text": "La Magicieuse publie...",
  "image": {
    "url": "https://...",
    "alt": "Couverture"
  },
  "cta": {
    "label": "Explorer les livres",
    "href": "/boutique/"
  }
}
```

React rend :

```tsx
<HomeHero data={block} />
```

Avantages :

```text
Vrais composants React reutilisables
Theme stable
HTML final controle par le front
Meilleure maintenabilite
```

Limites :

```text
Moins de liberte pour l'utilisateur WP
Il faut definir les champs disponibles
Il faut creer des endpoints ou champs custom
```

### Niveau 3 — Hybride recommande

Compromis conseille pour ce projet :

WordPress gere :

```text
ordre des blocs
type des blocs
contenu
images
boutons
produits/collections selectionnes
variante visuelle
ancre/ID
classe optionnelle controlee
```

React garde :

```text
composants
HTML final
classes principales
theme
interactions
UX
```

Exemple JSON :

```json
{
  "blocks": [
    {
      "type": "hero",
      "id": "accueil",
      "variant": "image-left",
      "className": "is-featured",
      "title": "Des livres pour grandir",
      "text": "La Magicieuse publie...",
      "image": {
        "url": "https://...",
        "alt": "Couverture"
      },
      "primaryCta": {
        "label": "Explorer les livres",
        "href": "/boutique/"
      }
    }
  ]
}
```

React peut ensuite rendre :

```tsx
<section
  id={block.id}
  className={`home-hero home-hero--${block.variant} ${block.className ?? ''}`}
>
  ...
</section>
```

Regle de securite :

```text
OK  : variant, id/ancre, className controlee
Non : HTML libre pour les zones qui doivent rester en composants React
```

La classe envoyee par WP ne doit pas etre une classe Elementor brute. Elle doit
etre une intention limitee et documentee, par exemple :

```text
is-featured
is-compact
has-soft-background
image-left
image-right
```

Ces classes restent des hooks controles par le front et le theme.

---

## Strategie de migration

1. Garder le fallback HTML pour ne pas casser l'existant.
2. Identifier les pages/blocs critiques actuellement rendus en HTML WP.
3. Creer des endpoints JSON pour ces blocs.
4. Remplacer progressivement le HTML par des composants React.
5. Garder les adaptateurs WP seulement pour les contenus libres ou legacy.

---

## Regle pratique

Si un element doit etre interactif, themable ou reutilisable, il doit venir d'une
donnee structuree et etre rendu par React.

Exemples :

```text
Bouton principal       → composant React
Carte produit          → composant React
Grille collections     → composant React
Panier                 → composant React
Texte editorial simple → HTML WP acceptable
```
