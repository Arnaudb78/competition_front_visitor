# Mirokaï Experience — App Visiteur

Application **PWA mobile** pour les visiteurs de la Mirokaï Experience.
Construite avec **Next.js 15** (App Router) et **Tailwind CSS**.

> **Mobile uniquement.** L'accès depuis un desktop affiche une page de redirection avec un QR code pointant vers l'app. L'application est installable sur l'écran d'accueil (PWA).

---

## Parcours utilisateur

```
/visit                → Splash screen (2s) + bouton démarrer
/visit/participants   → Onboarding : nombre de participants, prénoms et âges
/visit/map            → Plan interactif avec les modules à visiter
/visit/module/[id]    → Détail d'un module (média, description, validation)
/visit/end            → Classement final de l'équipe
/visit/desktop        → Page de blocage pour les accès desktop
```

---

## Architecture

```
competition-front-visitor/
├── app/
│   └── (visitor)/visit/
│       ├── page.tsx            → Splash screen
│       ├── participants/       → Onboarding participants
│       ├── map/                → Plan interactif
│       ├── module/[id]/        → Détail module
│       ├── end/                → Classement
│       └── desktop/            → Blocage desktop
├── lib/
│   └── visit.ts               → Fonctions API (groupe, score, modules)
└── public/
    ├── splash_screen.png       → Écran d'accueil
    ├── onboarding1.png         → Background étape 1
    ├── onboarding2.png         → Background étape 2
    └── mirokai-plan.png        → Plan de l'expérience
```

---

## Prérequis

- **Node.js** 20+
- **pnpm** — `npm install -g pnpm`
- Le [backend](../back-project) lancé (local ou production)

---

## Installation

```bash
git clone <url-du-repo>
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

Ouvrir `http://localhost:3000/visit`

> Pour tester sur desktop, utiliser les DevTools du navigateur en mode mobile (ex : iPhone 14 Pro dans Chrome DevTools).

---

## Fonctionnement technique

### Session visiteur
La session est stockée dans le `localStorage` du navigateur :

| Clé | Contenu |
|---|---|
| `visit_group_id` | ID MongoDB du groupe créé |
| `visit_participants` | Liste des prénoms (fallback si API KO) |

### Attribution des scores
- Chaque module validé = **+100 points**
- En groupe, le participant qui a visité le module est sélectionné avant validation
- Les scores sont stockés côté serveur dans la collection `groups`

### Fallback hors-ligne
Si l'API est inaccessible, le parcours continue avec les données en `localStorage`. Les scores ne sont alors pas persistés.

---

## Assets à fournir

Les images suivantes doivent être placées dans `/public` :

| Fichier | Dimensions recommandées | Usage |
|---|---|---|
| `splash_screen.png` | 440×956 px | Écran d'accueil |
| `onboarding1.png` | 440×956 px | Fond étape 1 (nombre) |
| `onboarding2.png` | 440×956 px | Fond étape 2 (prénoms) |
| `mirokai-plan.png` | 1536×1418 px | Plan de l'expérience |

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
