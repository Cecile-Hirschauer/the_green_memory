# Green Memory

Un jeu de mémoire accessible et éco-responsable pour sensibiliser à la biodiversité.

## Description

Green Memory est un jeu de cartes mémoire où le joueur doit retrouver les paires d'animaux et de plantes. Le jeu met en avant la biodiversité à travers 8 paires d'éléments naturels (fougère, champignon, renard, abeille, coccinelle, tournesol, sapin, papillon).

**Règles du jeu :**
- Retournez deux cartes pour trouver les paires
- Vous avez 12 coups maximum pour trouver les 8 paires
- Le jeu annonce votre progression et vous alerte quand il reste peu de coups

## Caractéristiques

### Accessibilité

- **Navigation clavier** : Toutes les cartes sont accessibles via Tab et activables avec Entrée/Espace
- **Lecteur d'écran** : Annonces ARIA en temps réel (aria-live) pour chaque action
- **Labels descriptifs** : Chaque carte indique son état (masquée/révélée) et son contenu
- **Skip link** : Lien d'évitement pour accéder directement au jeu
- **Focus visible** : Indicateur de focus contrasté et bien visible
- **Messages de feedback** : Zone de statut pour victoire/défaite accessible aux technologies d'assistance

### Éco-conception

- **Vanilla JS** : Aucun framework, code léger et performant
- **Assets textuels** : Utilisation d'emojis au lieu d'images
- **CSS minifié** : Fichiers optimisés pour la production
- **Polices système** : Pas de téléchargement de fonts externes
- **Pas de dépendances** : Zéro requête externe

## Structure du projet

```
├── index.html      # Page HTML principale
├── app.js          # Logique du jeu (version développement)
├── app.min.js      # Logique du jeu (version minifiée)
├── style.css       # Styles (version développement)
├── style.min.css   # Styles (version minifiée)
├── print.css       # Styles d'impression
└── .htaccess       # Configuration serveur
```

## Installation

Aucune installation requise. Ouvrez simplement `index.html` dans un navigateur.

Pour un serveur local :

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (npx)
npx serve
```

## Technologies

- HTML5 sémantique
- CSS3 (Grid, Flexbox, Custom Properties, animations)
- JavaScript ES6+ (Vanilla)

