# Salle de Sport - Application de Gestion

![Stack](https://img.shields.io/badge/stack-React%2018%20%C2%B7%20Express%20%C2%B7%20MySQL%208-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)

Application full-stack de gestion de salle de sport avec React, Node.js/Express et MySQL.

## Fonctionnalités

- **Gestion des adhérents** : Inscription, modification, photo, QR Code, liste paginée
- **Gestion des abonnements** : Formules journalières à annuelles, renouvellement automatique
- **Gestion des paiements** : Enregistrement, historique, reçus imprimables
- **Contrôle d'accès** : Scan QR (caméra/fichier), téléphone ou n° adhérent — décision côté serveur, chaque tentative tracée dans `access_logs`
- **Suivi des présences** : Enregistrement automatique à l'entrée
- **Tableau de bord** : Statistiques, graphiques, alertes d'expiration
- **Rapports** : Revenus, fréquentation, répartition par sexe
- **Gestion des utilisateurs** : Administrateurs, responsables et agents d'accueil avec droits différenciés

## Stack technique

- **Frontend** : React 18, Vite, Tailwind CSS, Recharts, html5-qrcode, ESLint + Prettier
- **Backend** : Node.js, Express, MySQL2, bcryptjs, jsonwebtoken, helmet, express-rate-limit, express-validator
- **Base de données** : MySQL 8
- **Tests** : Jest + Supertest

## Installation

### Prérequis

- Node.js 18+
- MySQL 8 — ou Docker (`npm run db` démarre MySQL via docker-compose)

### 1. Base de données

```bash
# Option A : MySQL local
mysql -u root -p < database.sql

# Option B : Docker
npm run db
```

### 2. Configuration

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Modifiez `backend/.env` (voir [Configuration](#configuration)).

### 3. Dépendances et démarrage

```bash
npm install   # à la racine (installe backend + frontend)
npm start     # démarre le serveur (sert aussi le frontend buildé)
```

En développement :

```bash
npm run dev   # backend (nodemon) + frontend (Vite) simultanément
```

Le serveur crée automatiquement au premier démarrage :
- Un utilisateur admin (`admin` / `admin123`) — **à changer en production**
- Les formules d'abonnement par défaut
- Les migrations de schéma idempotentes (`backend/db/migrate.js`)

## Configuration

`backend/.env` :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=salle_sport
JWT_SECRET=votre_cle_secrete      # obligatoire : openssl rand -hex 32
CORS_ORIGIN=https://votre-domaine.com   # obligatoire en production
NODE_ENV=development
```

`frontend/.env` :

```env
VITE_API_URL=   # vide = même origine / proxy Vite
```

## Qualité & tests

```bash
npm test        # tests backend (Jest + Supertest)
npm run lint    # ESLint backend + frontend
```

- Les erreurs API sont centralisées (`middleware/errorHandler.js`) avec format uniforme `{ message, errors? }`
- Les entrées sont validées par `express-validator` (`middleware/validators.js`) → 400 avec détails par champ
- `/api/health` expose l'état du serveur pour le monitoring
- Connexions protégées par rate limiting (30 tentatives / 15 min sur `/api/auth`)

## Rôles utilisateurs

| Rôle | Permissions |
|------|------------|
| **Administrateur** | Accès complet : adhérents, abonnements, paiements, accès, rapports, utilisateurs |
| **Responsable** | Gestion : adhérents, formules, rapports |
| **Agent d'accueil** | Rechercher adhérents, inscrire, enregistrer paiements, scanner QR Codes |
| **Adhérent** | Espace membre : profil, abonnement, QR Code |

## Structure du projet

```
Salle_Sport/
├── .github/workflows/ci.yml    # CI : lint + tests + build
├── backend/
│   ├── config/database.js
│   ├── config/env.js           # validation des variables d'env
│   ├── db/migrate.js           # migrations idempotentes
│   ├── db/seed.js              # admin + formules par défaut
│   ├── middleware/
│   │   ├── auth.js             # JWT authenticate/authorize
│   │   ├── errorHandler.js     # 404 + erreurs centralisées
│   │   └── validators.js       # express-validator
│   ├── routes/                 # auth, members, plans, subscriptions,
│   │                           # payments, attendance, dashboard, users
│   ├── tests/app.test.js       # tests API (supertest)
│   ├── app.js                  # app Express (importable pour les tests)
│   └── server.js               # bootstrap + graceful shutdown
├── frontend/
│   ├── src/
│   │   ├── api/axios.js        # instance axios + intercepteur 401
│   │   ├── components/         # Layout, Sidebar, ErrorBoundary, ...
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/              # Login, Dashboard, Gestion, Members,
│   │   │                       # AccessControl, Attendance, Reports,
│   │   │                       # Users, MemberSpace, NotFound, ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
├── docker-compose.yml          # MySQL 8 local
├── database.sql
└── package.json
```

## Pagination API

`GET /api/members` retourne un tableau complet par défaut. Avec `?page=1&limit=20`, la réponse devient :

```json
{ "data": [...], "pagination": { "total": 152, "page": 1, "limit": 20, "totalPages": 8 } }
```

## Contrôle d'accès

`POST /api/access/verify` accepte `{ qr }` ou `{ phone }` et retourne `{ allowed, reason, member, subscription, already_registered }`. Toutes les tentatives (autorisées ou refusées) sont écrites dans `access_logs`, et la présence est enregistrée dans la même transaction.

## Impression

Les pages d'adhérent et de paiement supportent l'impression (Ctrl+P) avec masquage automatique de la sidebar et des boutons.
