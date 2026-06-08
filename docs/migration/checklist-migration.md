# Checklist migration Elementor vers Gutenberg

## Pages a migrer

Statuts possibles :

```text
A analyser
Blocs identifies
Reconstruite
Verifiee dans React
```

### Priorite 1 — Accueil

- [ ] Accueil — statut : A analyser

### Priorite 2 — Pages importantes

- [ ] Boutique — statut : A analyser
- [ ] Collections — statut : A analyser
- [ ] A propos — statut : A analyser
- [ ] Contact — statut : A analyser
- [ ] Page evenement / atelier — statut : A analyser
- [ ] Page de presentation d'une offre — statut : A analyser
- [ ] Page institutionnelle importante — statut : A analyser

### Priorite 3 — Pages secondaires

- [ ] Anciennes pages de contenu — statut : A analyser
- [ ] Pages temporaires — statut : A analyser
- [ ] Pages informatives simples — statut : A analyser

---

## Blocs custom a creer

### Prioritaires

- [ ] `magicieuse/hero`
- [ ] `magicieuse/cta`
- [ ] `magicieuse/book-carousel`
- [ ] `magicieuse/featured-products`
- [ ] `magicieuse/image-text`

### Differables

- [ ] `magicieuse/testimonials`
- [ ] `magicieuse/gallery`
- [ ] `magicieuse/faq`

---

## Par page : sections a identifier

Pour chaque page, cocher les sections presentes avant de reconstruire.

- [ ] Hero
- [ ] Texte editorial (titre / paragraphe / liste / citation Gutenberg)
- [ ] Image + texte
- [ ] CTA
- [ ] Carrousel de livres
- [ ] Selection de produits
- [ ] Temoignages
- [ ] Galerie
- [ ] FAQ

---

## Validation finale par page

A cocher apres reconstruction d'une page.

- [ ] Page reconstruite en Gutenberg
- [ ] Blocs custom `magicieuse/*` bien reconnus par React
- [ ] Blocs Gutenberg standards affiches correctement
- [ ] Responsive verifie sur mobile et desktop
- [ ] Liens et boutons verifies
- [ ] Images et medias verifies
- [ ] Ancienne version Elementor archivee ou desactivee
