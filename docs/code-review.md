# Code review — magicieuse-front

Date : 2026-06-05

Ce document sert de référence lors des revues de code.

Il liste les points à vérifier avant chaque merge dans le projet headless React/Vite connecté à WordPress/WooCommerce.

---

## 1. Style CSS

### Règle SCSS / Tailwind

Si un élément JSX a plus de 5 classes Tailwind, c'est un signal pour créer une classe SCSS.

Mauvais :

```tsx
<section className="flex flex-col items-center justify-between gap-6 px-6 py-12 md:py-20 bg-white rounded-xl shadow-md w-full max-w-5xl mx-auto">
```

Mieux :

```tsx
<section className="home-hero px-6 py-12 md:py-20">
```

```scss
// Header.scss
.home-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
}
```

### Classes Elementor spécifiques

Ne pas cibler les classes générées automatiquement par Elementor.

À éviter :

```scss
.elementor-element-c3860b1 {}
.elementor-element-567444d {}
```

Ces classes peuvent changer ou disparaître si le client modifie une page dans Elementor.

Utiliser à la place les classes génériques dans `.wp-content` (voir `gutenberg-react-headless/css-contenu-wordpress-elementor-gutenberg.md`).

### Scope du contenu WordPress

Tout style destiné au HTML venant de WordPress doit être dans `src/styles/wp-content.scss`, scopé sous `.wp-content`.

```scss
// Correct
.wp-content {
  .wp-block-image {
    max-width: 100%;
  }
}

// Incorrect — style global non scopé
.wp-block-image {
  max-width: 100%;
}
```

---

## 2. Composants React

### Props typées

Toutes les props doivent avoir un type explicite. Pas de `any`.

```tsx
// Incorrect
const ProductCard = ({ product }: any) => { ... }

// Correct
interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => { ... }
```

### Séparation présentation / logique

Un composant de présentation ne doit pas faire d'appel API ou contenir de logique métier complexe.

```tsx
// Incorrect — fetch dans un composant de présentation
const ProductCard = ({ id }: { id: number }) => {
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch(`/wp-json/wc/v3/products/${id}`).then(...);
  }, []);
  return <div>...</div>;
};

// Correct — la donnée est passée en props
const ProductCard = ({ product }: ProductCardProps) => {
  return <div>...</div>;
};
```

### `dangerouslySetInnerHTML`

Autorisé uniquement pour afficher du HTML provenant de l'API REST WordPress (source de confiance maîtrisée).

Ne jamais utiliser pour du contenu venant d'un utilisateur externe ou d'une source non contrôlée.

```tsx
// Correct — HTML venant de notre instance WP
<div
  className="wp-content"
  dangerouslySetInnerHTML={{ __html: page.content.rendered }}
/>

// Incorrect — HTML venant d'un utilisateur ou d'une source inconnue
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## 3. Appels API WordPress / WooCommerce

### Centraliser dans `/src/api/`

Aucun `fetch` direct dans les composants. Tous les appels API passent par des fonctions dans `src/api/`.

```ts
// src/api/products.ts
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${import.meta.env.VITE_WP_API_URL}/wc/v3/products`);
  if (!res.ok) throw new Error('Erreur chargement produits');
  return res.json();
}
```

```tsx
// Dans le composant — utiliser la fonction, pas fetch directement
const products = await getProducts();
```

### Gérer les états loading et error

Tout appel API doit prévoir les trois états : chargement, erreur, données.

```tsx
if (loading) return <p>Chargement...</p>;
if (error) return <p>Une erreur est survenue.</p>;
return <ProductList products={products} />;
```

---

## 4. Contenu WordPress

### Vérifier la source du HTML

Avant de styler un bloc WordPress dans `wp-content.scss`, inspecter le HTML réel reçu de l'API.

Ne pas supposer les classes présentes — les vérifier directement dans le navigateur ou via l'API REST.

### Elementor : valider bloc par bloc

Elementor peut injecter du JavaScript pour ses widgets (carrousels, accordéons, animations).

Ce JavaScript ne sera pas chargé côté React.

Avant de livrer une page qui utilise Elementor, vérifier que chaque bloc fonctionne correctement dans le front React, pas seulement dans l'aperçu WordPress.

### Tester desktop et mobile

Tout contenu WordPress affiché doit être validé sur les deux formats.

Les colonnes Gutenberg et les sections Elementor peuvent casser en mobile si `wp-content.scss` n'a pas de règles responsive.

---

## 5. Performance

### Pas d'import de librairie entière

```tsx
// Incorrect
import _ from 'lodash';

// Correct
import debounce from 'lodash/debounce';
```

### Lazy loading des pages

Les routes qui ne sont pas critiques au premier affichage doivent être chargées en lazy.

```tsx
const CartPage = lazy(() => import('./pages/CartPage'));
```

---

## 6. Checklist rapide avant merge

```text
CSS
  [ ] Pas plus de 5 classes Tailwind sur un seul élément
  [ ] Pas de classe Elementor spécifique (.elementor-element-xxxxxxx)
  [ ] Styles WordPress scopés dans .wp-content

React
  [ ] Props typées, pas de `any`
  [ ] Pas de fetch dans les composants de présentation
  [ ] dangerouslySetInnerHTML uniquement pour HTML WP

API
  [ ] Appels centralisés dans src/api/
  [ ] États loading et error gérés

Contenu WordPress
  [ ] HTML inspecté dans le navigateur avant de styler
  [ ] Blocs Elementor validés dans React (pas seulement dans WP)
  [ ] Testé desktop et mobile

Performance
  [ ] Pas d'import de librairie entière
  [ ] Pages non critiques en lazy loading
```
