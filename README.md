# Salle de Sport - Application de Gestion

Application full-stack de gestion de salle de sport avec React, Node.js/Express et MySQL.

## Fonctionnalités

- **Gestion des adhérents** : Inscription, modification, photo, QR Code
- **Gestion des abonnements** : Formules journalières à annuelles, renouvellement automatique
- **Gestion des paiements** : Enregistrement, historique, reçus imprimables
- **Contrôle d'accès par QR Code** : Scan caméra ou recherche manuelle
- **Suivi des présences** : Enregistrement automatique à l'entrée
- **Tableau de bord** : Statistiques, graphiques, alertes d'expiration
- **Rapports** : Revenus, fréquentation, répartition par sexe
- **Gestion des utilisateurs** : Administrateurs et agents d'accueil avec droits différenciés

## Stack technique

- **Frontend** : React 18, Vite, Tailwind CSS, Recharts, html5-qrcode
- **Backend** : Node.js, Express, MySQL2, bcryptjs, jsonwebtoken, qrcode
- **Base de données** : MySQL

## Installation

### Prérequis

- Node.js 18+
- MySQL 8+

### 1. Base de données

```bash
mysql -u root -p < database.sql
```

### 2. Backend
```bash
cd backend
npm install
npm start
```

Le serveur démarre sur le port 5000 et crée automatiquement :
- Un utilisateur admin (`admin` / `admin123`)
- Les formules d'abonnement par défaut

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur le port 3000.

### 4. Lancer les deux simultanément

```bash
npm install   # à la racine
npm start
```

## Configuration

Modifiez `backend/.env` si nécessaire :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=salle_sport
JWT_SECRET=votre_cle_secrete
```

## Rôles utilisateurs

| Rôle | Permissions |
|------|------------|
| **Administrateur** | Accès complet : adhérents, abonnements, paiements, accès, rapports, utilisateurs |
| **Agent d'accueil** | Rechercher adhérents, inscrire, enregistrer paiements, scanner QR Codes |

## Structure du projet

```
Salle_Sport/
├── backend/
│   ├── config/database.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── plans.js
│   │   ├── subscriptions.js
│   │   ├── payments.js
│   │   ├── attendance.js
│   │   ├── dashboard.js
│   │   └── users.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── MemberDetail.jsx
│   │   │   ├── Subscriptions.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── AccessControl.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Users.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
└── database.sql
```

## Impression

Les pages d'adhérent et de paiement supportent l'impression (Ctrl+P) avec masquage automatique de la sidebar et des boutons.
