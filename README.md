# Mirokaï Experience — App Visiteur

Application **PWA mobile** pour la Mirokaï Experience.
Construite avec **Next.js 15** (App Router), **Tailwind CSS** et **TypeScript**.

> **Mobile uniquement.** Tout accès depuis un desktop redirige automatiquement vers `/visit/desktop` qui affiche un QR code pointant vers l'app.
> L'application est installable sur l'écran d'accueil (PWA).

---

## Deux espaces distincts

| Espace | URL de base | Authentification |
|---|---|---|
| **Visite guidée** | `/visit/*` | Aucune — session localStorage |
| **App membre** | `/home`, `/jeu`, `/media`, `/calendrier`, `/profil` | JWT cookie `account_token` |

---

## Parcours utilisateur

### Visite guidée (`/visit`)
```
/visit                  → Splash screen (2s) + bouton démarrer
/visit/participants     → Onboarding : nombre de participants, prénoms et âges
/visit/map              → Plan interactif des modules à visiter
/visit/module/[id]      → Détail d'un module (médias, quiz, validation)
/visit/end              → Classement final de l'équipe
/visit/desktop          → Blocage desktop avec QR code
```

### App membre (`/`)
```
/                       → Connexion / Inscription
/home                   → Accueil : progression hebdo + événements
/jeu                    → Hub jeux : challenges + mini-jeu
/jeu/challenges         → Liste des challenges disponibles
/jeu/challenge/[id]     → Challenge solo (intro → questions → score board)
/media                  → Replays, Live, Clips
/calendrier             → Liste des événements
/calendrier/[id]        → Détail d'un événement
/profil                 → Paramètres du compte
```

---

## Architecture

```
competition-front-visitor/
├── app/
│   ├── page.tsx                    → Auth (connexion / inscription)
│   ├── layout.tsx                  → Layout racine
│   ├── globals.css                 → Styles globaux + animation skeleton
│   ├── (visitor)/visit/
│   │   ├── page.tsx                → Splash screen
│   │   ├── participants/           → Onboarding participants
│   │   ├── map/                    → Plan interactif
│   │   ├── module/[id]/            → Détail module
│   │   ├── end/                    → Classement fin de visite
│   │   └── desktop/                → Blocage desktop + QR code
│   └── (app)/
│       ├── layout.tsx              → Layout avec nav bar
│       ├── home/                   → Page d'accueil membre
│       ├── jeu/
│       │   ├── page.tsx            → Hub jeux
│       │   ├── challenges/         → Liste challenges
│       │   └── challenge/[id]/     → Challenge solo
│       ├── media/                  → Replays / Live / Clips
│       ├── calendrier/             → Événements
│       └── profil/                 → Paramètres compte
├── lib/
│   ├── api.ts                      → Fetch authentifié (cookie JWT)
│   ├── challenges.ts               → Fonctions API challenges, profil, events
│   └── visit.ts                    → Fonctions API visite (groupes, modules, scores)
├── proxy.ts                        → Middleware : auth guard + blocage desktop
└── public/
    ├── miroka_splash.png           → Personnage splash screen
    ├── title_splash.png            → Titre "Mirokaï Experience"
    ├── miroki_onboarding.png       → Personnage onboarding visite
    ├── miroki_challenge.png        → Personnage card progrès
    ├── kids_finish_module.png      → Personnages page desktop
    ├── card_challenge.png          → Illustration card challenges
    ├── rune.png                    → Illustration card mini-jeu
    ├── mirokai-plan.png            → Plan de l'expérience
    └── manifest.json               → Config PWA
```

---

## Prérequis

- **Node.js** 20+
- **pnpm** — `npm install -g pnpm`
- Le [backend](https://github.com/Arnaudb78/competition_project_back) lancé (local ou production)

---

## Installation

```bash
cd competition-front-visitor
pnpm install
```

---

## Configuration

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Lancer en développement

```bash
pnpm dev
```

- App membre : `http://localhost:3000/`
- Visite guidée : `http://localhost:3000/visit`

> Pour tester sur desktop, activer le mode mobile dans les DevTools (ex : iPhone 14 Pro dans Chrome).

---

## Fonctionnement technique

### Authentification membre
- JWT stocké dans le cookie `account_token` (7 jours)
- Le middleware `proxy.ts` redirige vers `/` si le token est absent sur les routes `(app)`
- Les cookies `account_firstName` et `account_lastName` sont utilisés pour l'affichage immédiat sans appel API

### Session visite (sans compte)
La session visiteur est stockée dans le `localStorage` :

| Clé | Contenu |
|---|---|
| `visit_group_id` | ID MongoDB du groupe créé côté API |
| `visit_participants` | Liste JSON des prénoms (fallback si API KO) |

### Blocage desktop
Le middleware `proxy.ts` vérifie le `User-Agent` sur **toutes les routes**. Tout accès non mobile est redirigé vers `/visit/desktop`.

### Challenges (mode solo)
- Le joueur est le profil connecté (`GET /accounts/me`)
- Score calculé localement, envoyé au back sur `POST /challenges/:id/complete`
- Le back n'attribue des trophées que sur amélioration du meilleur score (`delta = max(0, newScore - bestPreviousScore)`)

### Skeleton loading
Les images S3 (challenges, events) affichent une animation shimmer (`@keyframes shimmer` dans `globals.css`) pendant le chargement, puis un fade-in à l'`onLoad`.

---

## Build & déploiement

```bash
pnpm build
pnpm start
```

### Variables d'environnement en production

```env
NEXT_PUBLIC_API_URL=https://api.mirokai-experience.fr/api
```
