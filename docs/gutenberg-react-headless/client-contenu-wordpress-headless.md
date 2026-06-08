# Gestion du contenu client avec WordPress headless

Date : 2026-06-05

Ce document explique ce qu'un client peut modifier dans WordPress quand le site public est affiche par React.

## Principe important

Dans cette architecture, WordPress n'est plus le theme public complet.

WordPress sert principalement a :

- gerer les pages ;
- gerer les articles ;
- gerer les medias ;
- gerer les produits WooCommerce ;
- gerer les categories ;
- gerer les menus ;
- fournir les donnees au front React.

React sert a :

- afficher le site public ;
- controler le layout ;
- controler le header ;
- controler le footer ;
- afficher les produits ;
- afficher le panier ;
- afficher les contenus WordPress compatibles.

Phrase a retenir :

```txt
Le client gere le contenu dans WordPress, mais React controle l'affichage final.
```

## Ce que le client peut modifier librement

Le client peut normalement modifier sans risque :

- les textes de pages ;
- les titres ;
- les images ;
- les videos integrees ;
- les galeries simples ;
- les articles de blog ;
- les produits WooCommerce ;
- les images produits ;
- les categories produits ;
- les descriptions de categories ;
- les menus WordPress si l'API menu est gardee.

Ces elements sont de bons candidats pour une architecture headless.

## Gutenberg

Gutenberg est le meilleur choix pour les pages editoriales dans ce projet.

Blocs generalement compatibles :

- paragraphe ;
- titre ;
- liste ;
- citation ;
- image ;
- galerie ;
- video ;
- embed YouTube/Vimeo ;
- bouton ;
- colonnes simples ;
- separateur ;
- HTML personnalise simple.

Ces blocs sont sauvegardes dans le contenu WordPress, puis exposes par l'API.

Le front React peut ensuite les afficher via le HTML renvoye par WordPress.

## Widgets WordPress

Il faut distinguer deux types de widgets.

### Widgets dans le contenu d'une page

Si le widget est ajoute comme bloc dans Gutenberg, il peut parfois etre affiche par React.

Exemples :

- bloc image ;
- bloc galerie ;
- bloc video ;
- bloc bouton ;
- bloc HTML simple ;
- bloc shortcode simple.

Dans ce cas, le widget fait partie du contenu de la page.

### Widgets de theme

Si le widget est ajoute dans une zone du theme WordPress, il ne sera pas automatiquement affiche par React.

Exemples :

- sidebar ;
- footer widget ;
- header widget ;
- zone Astra ;
- widget global du theme ;
- zone personnalisee du theme.

Ces widgets appartiennent au rendu PHP du theme WordPress.

Comme le site public est rendu par React, ces zones ne sont pas rendues automatiquement.

Conclusion :

```txt
Les widgets de theme ne sont pas compatibles par defaut avec un front React headless.
```

## Elementor

Elementor peut fonctionner dans certains cas, mais il faut etre prudent.

Elementor ne stocke pas seulement du contenu simple. Il depend souvent de :

- HTML genere ;
- classes CSS Elementor ;
- fichiers CSS Elementor ;
- JavaScript Elementor ;
- widgets dynamiques ;
- shortcodes ;
- modules lies au theme.

Dans une architecture headless, React peut recuperer le HTML genere par Elementor via `the_content`, mais il ne recupere pas automatiquement tout le comportement du theme.

### Elementor peut etre acceptable pour

- pages simples ;
- blocs texte/image ;
- sections statiques ;
- contenus sans interaction complexe.

### Elementor est risque pour

- sliders ;
- carrousels ;
- popups ;
- formulaires ;
- animations ;
- widgets dynamiques ;
- contenu WooCommerce complexe ;
- templates header/footer Elementor ;
- templates theme builder.

Recommandation :

```txt
Elementor doit etre limite ou valide bloc par bloc.
```

## Shortcodes

Les shortcodes peuvent fonctionner si WordPress les transforme correctement avant d'envoyer le contenu a React.

Mais ils sont a valider individuellement.

Exemples :

- shortcode simple qui genere du HTML statique : souvent OK ;
- shortcode qui depend de JS/CSS du theme : risque ;
- shortcode de formulaire : a tester ;
- shortcode WooCommerce complexe : a tester.

## Ce qu'il ne faut pas promettre au client

Il ne faut pas promettre que le client pourra :

- installer n'importe quel plugin visuel ;
- ajouter n'importe quel widget ;
- modifier le header comme dans un theme WordPress classique ;
- modifier le footer comme dans un theme WordPress classique ;
- construire toute la page avec Elementor sans verification ;
- obtenir automatiquement le meme rendu que dans WordPress ;
- utiliser toutes les zones Astra ;
- utiliser tous les widgets WooCommerce visuels.

En headless, WordPress gere les donnees, mais React reste responsable du rendu public.

## Ce qu'il faut promettre clairement

On peut promettre :

- une gestion simple des contenus ;
- une gestion des produits WooCommerce ;
- une gestion des categories ;
- une gestion des menus ;
- une gestion des medias ;
- une lecture des pages Gutenberg compatibles ;
- une lecture des articles si l'API est prevue pour cela ;
- un affichage React stable et maitrise.

## Regle de validation

Chaque nouveau type de bloc ou widget doit etre classe dans une de ces categories :

| Type | Statut | Commentaire |
| --- | --- | --- |
| Texte Gutenberg | Compatible | OK |
| Image Gutenberg | Compatible | OK |
| Galerie simple | Compatible | A tester visuellement |
| Video embed | Compatible | OK si embed standard |
| Bouton Gutenberg | Compatible | Style a adapter cote React |
| Colonnes Gutenberg | Compatible | A tester responsive |
| Shortcode simple | A valider | Depend du plugin |
| Formulaire | A valider | Depend du JS/CSS |
| Widget de theme | Non compatible par defaut | Hors contenu page |
| Elementor simple | A valider | Peut fonctionner |
| Elementor complexe | Risque | Depend de CSS/JS Elementor |
| Header/Footer Elementor | Non conseille | React gere deja ces zones |

## Recommandation pour ce projet

Pour ce projet, l'approche la plus propre est :

1. utiliser Gutenberg pour les pages et articles ;
2. eviter les widgets de theme ;
3. garder Elementor seulement si le client en a vraiment besoin ;
4. tester chaque bloc Elementor avant de le valider ;
5. laisser React gerer le header, le footer, la boutique, les collections et le panier ;
6. utiliser WordPress comme back-office de contenu et WooCommerce.

## Formulation client conseillee

Formulation possible :

```txt
Vous pourrez gerer les contenus depuis WordPress : textes, images, videos, articles, produits, categories et menus.

Le site public est affiche par React. Cela donne plus de controle sur la performance et l'experience utilisateur, mais cela signifie que tous les widgets WordPress ou Elementor ne sont pas automatiquement compatibles.

Les blocs standards Gutenberg sont privilegies. Les widgets ou blocs avances seront valides au cas par cas.
```

## Conclusion

Le client peut garder une vraie autonomie editoriale, mais pas une liberte totale de construction visuelle comme dans un theme WordPress classique.

Le bon compromis est :

- WordPress pour le contenu ;
- WooCommerce pour la boutique ;
- React pour l'affichage ;
- Gutenberg pour les pages simples ;
- validation au cas par cas pour Elementor, shortcodes et widgets avances.
