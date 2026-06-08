# Checkout WooCommerce classique avec front React

Date : 2026-06-05

Ce document explique l'option recommandee pour le paiement : garder le checkout WooCommerce classique cote WordPress, tout en utilisant React pour le reste du site.

## Principe

Le front React gere l'experience publique principale.

React gere :

- accueil ;
- boutique ;
- produits ;
- collections ;
- panier front ;
- contenus WordPress ;
- pages editoriales compatibles.

Puis, au moment du paiement, l'utilisateur sort du front React et passe sur WooCommerce classique.

Flux :

```txt
React /panier/
→ bouton "Passer commande"
→ WordPress /checkout/
→ WooCommerce gere paiement, livraison, compte client
```

## Pourquoi garder le checkout WooCommerce classique

Le checkout est la partie la plus sensible d'une boutique.

Il gere :

- panier ;
- taxes ;
- frais de port ;
- adresses ;
- modes de livraison ;
- moyens de paiement ;
- creation de commande ;
- emails ;
- compte client ;
- retours de paiement ;
- erreurs de paiement ;
- compatibilite avec les plugins WooCommerce.

Le refaire entierement dans React est possible, mais beaucoup plus risque.

## Avantages

Cette option est :

- fiable ;
- rapide a mettre en place ;
- moins risquee ;
- compatible avec les plugins WooCommerce ;
- compatible avec les moyens de paiement deja installes ;
- plus simple a maintenir ;
- plus securisee pour une premiere version.

WooCommerce continue a faire ce qu'il fait le mieux : finaliser la commande.

## Inconvenient

L'inconvenient principal est visuel.

Quand l'utilisateur clique sur "Passer commande", il arrive sur :

```txt
WordPress /checkout/
```

Donc il peut voir l'ancien rendu WordPress au lieu du rendu React.

Cela peut creer une rupture visuelle entre :

- le front React ;
- le checkout WordPress ;
- la page compte client ;
- la page panier native WooCommerce si elle est encore accessible.

## Solution conseillee

Pour eviter le choc visuel, il faut creer un rendu WordPress minimal pour le checkout.

Objectif :

```txt
Garder la logique PHP/WooCommerce, mais simplifier le theme autour.
```

Le checkout WordPress doit ressembler au front React, sans essayer de devenir React.

## Theme WordPress minimal checkout

Le theme WordPress peut avoir un template special pour les pages WooCommerce sensibles.

Pages concernees :

- `/checkout/`
- `/my-account/`
- eventuellement `/cart/` si on garde la page native accessible.

Le template minimal doit garder :

- meme logo ;
- memes couleurs principales ;
- typographie proche ;
- header simplifie ;
- footer simplifie ;
- lien retour boutique React ;
- formulaire WooCommerce ;
- messages WooCommerce ;
- zones de paiement.

Le template minimal doit masquer :

- ancien menu complet ;
- sidebars inutiles ;
- widgets decoratifs ;
- sections Elementor inutiles ;
- ancien footer trop charge ;
- elements visuels qui cassent la coherence avec React.

## Exemple de logique

Sur `/checkout/`, WordPress doit surtout afficher :

```php
the_content();
```

Le contenu de la page contient le shortcode WooCommerce :

```txt
[woocommerce_checkout]
```

Donc WooCommerce garde le controle du formulaire de commande.

Le theme autour sert seulement a encadrer proprement le checkout.

## Navigation

Le bouton du panier React doit envoyer vers le checkout WordPress.

Exemple :

```txt
React /panier/
→ http://localhost/MAGICIEUSE/htdocs/checkout/
```

En production, il faudra definir l'URL finale selon le domaine choisi.

Le checkout peut avoir un lien retour :

```txt
← Retour a la boutique
```

qui pointe vers le front React :

```txt
/boutique/
```

## Ce qu'il ne faut pas faire maintenant

Il ne faut pas refaire tout le checkout en React pour l'instant.

Ce serait plus long et plus fragile, car il faudrait gerer :

- session panier ;
- creation commande ;
- paiement ;
- livraison ;
- validation des champs ;
- erreurs WooCommerce ;
- compatibilite plugins ;
- redirections de paiement ;
- emails transactionnels.

Ce n'est pas le bon premier chantier.

## Comparaison rapide

| Option | Avantage | Risque |
| --- | --- | --- |
| Checkout WooCommerce classique | Fiable et rapide | Rupture visuelle si non stylise |
| Checkout WooCommerce dans iframe | Simple en apparence | Mauvaise UX, paiement fragile |
| Checkout 100% React | Controle total | Long, complexe, risque paiement |

## Recommandation

Pour ce projet, le meilleur compromis est :

```txt
React pour le site public
WooCommerce classique pour checkout et compte client
Theme WordPress minimal pour harmoniser le visuel
```

Cette approche permet d'avancer vite sans prendre de risque inutile sur le paiement.

## Conclusion

Le checkout WooCommerce classique est l'option recommandee.

Le travail important n'est pas de mettre le PHP WooCommerce dans React.

Le vrai travail est de rendre les pages WooCommerce natives suffisamment proches du front React pour que l'utilisateur ne sente pas une rupture brutale.
