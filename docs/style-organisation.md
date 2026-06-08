# Organisation du style

Ce projet utilise SCSS et Tailwind ensemble.

## Principe

SCSS sert au style principal de l'application :

- identite visuelle ;
- structure globale ;
- layout ;
- sections importantes ;
- composants reutilisables ;
- styles partages entre plusieurs pages.

Tailwind sert aux ajustements rapides dans les composants React :

- espacements ponctuels ;
- responsive simple ;
- alignements ;
- petites variantes visuelles ;
- corrections locales sans creer une classe SCSS dediee.

## Regle pratique

Utiliser SCSS pour ce qui doit rester stable et reutilisable.

Utiliser Tailwind pour ce qui est local au composant et rapide a comprendre.

Exemple :

```tsx
<section className="home-hero px-6 py-12 md:py-20">
  ...
</section>
```

Dans cet exemple :

- `home-hero` est gere dans SCSS ;
- `px-6 py-12 md:py-20` sont des ajustements Tailwind.

## Organisation conseillee

```text
src/styles/
  tailwind.css      # Import Tailwind, a garder simple
  main.scss         # Base globale de l'app
  variables.scss    # Couleurs, polices, breakpoints
  layout.scss       # Structure generale
  buttons.scss      # Boutons communs
  forms.scss        # Champs et formulaires
```

Pour les composants importants :

```text
src/components/
  Header/
    Header.tsx
    Header.scss
  ProductCard/
    ProductCard.tsx
    ProductCard.scss
```

## Application au projet

Pour le front headless WooCommerce :

- SCSS gere l'identite visuelle de La Magicieuse, le header, le footer, les pages, les grilles produits et les blocs structurants.
- Tailwind aide a ajuster rapidement les espacements, largeurs, flex/grid et breakpoints directement dans les composants.
- Les styles du checkout WooCommerce restent cote WordPress, car le paiement est conserve en natif.

## A eviter

- Ne pas mettre toute l'application uniquement en classes Tailwind si le style devient difficile a lire.
- Ne pas creer une classe SCSS pour chaque petit espacement.
- Ne pas copier le CSS du theme WordPress tel quel sans le nettoyer.
- Ne pas melanger des styles globaux non scopes qui peuvent toucher tous les composants sans intention claire.

## Decision

Le projet suit cette approche :

```text
SCSS = style principal, structure et design system
Tailwind = ajustements rapides dans les composants React
```
