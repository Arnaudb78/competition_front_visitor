# Checklist — Implémentation post-signin

## 1. Navigation (bottom tab bar)

- [x] Créer le layout `app/(app)/layout.tsx`
- [x] Bottom tab bar style Apple blur (`backdrop-blur`, `bg-white/10`)
- [x] 4 onglets : Profil, Média, Jeu, Calendrier
- [x] Icônes : person, caméra, trophée, calendrier
- [x] Onglet actif = cercle jaune `#f5c842`
- [x] Fixed bottom avec safe area iOS (`pb-safe`)

---

## 2. Profil (`/home`)

- [ ] Header "Salut, [Prénom Nom]" + icône settings
- [ ] Card progrès hebdomadaires
  - [ ] Nombre de défis accomplis en jaune
  - [ ] Bouton "Découvre le défi à venir !"
- [ ] Section "Les derniers évènements"
  - [ ] Liste avec thumbnail, titre, auteur, date
  - [ ] Bouton "+" sur chaque item
  - [ ] Lien "Tout voir"

---

## 3. Calendrier (`/calendrier`)

- [ ] Header "Nos prochains évènements"
- [ ] Composant calendrier mois
  - [ ] Navigation mois précédent / suivant
  - [ ] Jour sélectionné en jaune
  - [ ] Jours avec événements marqués (point coloré)
- [ ] Liste des événements du jour sélectionné
  - [ ] Thumbnail, titre, auteur, date
  - [ ] Bouton "+"
- [ ] Page détail événement (`/calendrier/[id]`)
  - [ ] Image hero plein largeur
  - [ ] Tag (ex : "Gratuit")
  - [ ] Titre, heure, lieu
  - [ ] Description
  - [ ] Section "Intervenants" avec avatars + "Tout voir"
  - [ ] Bouton retour

---

## 4. Jeu (`/jeu`)

### Accueil jeu
- [ ] Header "L'espace jeu" + badge score (trophée + points)
- [ ] Card "Challenges" (avec illustration)
- [ ] Card "Mini-jeu" (avec illustration)
- [ ] Section "Challenges terminés"
  - [ ] Liste avec thumbnail, titre, auteur, date
  - [ ] Bouton "+"

### Challenges
- [ ] Page sélection catégorie (`/jeu/challenges`)
  - [ ] Liste des catégories (boutons liste)
  - [ ] Section "Challenges terminés"
- [ ] Page quiz (`/jeu/challenges/[id]`)
  - [ ] Question en haut
  - [ ] "Au tour de [Prénom]" avec avatar
  - [ ] 4 réponses (grille 2×2)
  - [ ] Feedback visuel bonne/mauvaise réponse
- [ ] Page résultats (`/jeu/resultats`)
  - [ ] Message "Bien joué, tu es en tête !"
  - [ ] Podium avec avatars et scores
  - [ ] Score personnel mis en avant

---

## 5. Média (`/media`)

- [ ] 3 onglets : Replays / Live / Clips
- [ ] Filtres temporels : Tout, il y a 1 semaine, il y a 1 mois, il y a 1 an

### Replays
- [ ] Liste de vidéos (thumbnail + langue + titre + description)

### Live
- [ ] Player vidéo live
- [ ] Indicateur rouge "EN DIRECT" + compteur viewers
- [ ] Zone de chat en dessous

### Clips
- [ ] Scroll vertical style TikTok
- [ ] Actions : like, partager, son, repost
- [ ] Infos : titre, auteur, date

---

## 6. Backend (routes à créer)

- [ ] `GET /api/events` — liste des événements
- [ ] `GET /api/events/:id` — détail d'un événement
- [ ] `GET /api/challenges` — liste des challenges/catégories
- [ ] `POST /api/challenges/:id/answer` — soumettre une réponse
- [ ] `GET /api/media/replays` — liste des replays
- [ ] `GET /api/media/clips` — liste des clips
- [ ] `GET /api/users/me` — profil utilisateur connecté
- [ ] `PATCH /api/users/me` — modifier le profil

---

## 7. PWA

- [ ] Récupérer les icônes auprès de l'équipe design
  - [ ] `public/icons/icon-192.png` (192×192)
  - [ ] `public/icons/icon-512.png` (512×512)
- [ ] Mettre à jour `public/manifest.json` avec les icônes
