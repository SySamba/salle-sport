# Guide de déploiement — salle-sport.sambasy.com

Hébergeur : **Hostinger** — méthode : **import d'un dépôt Git** (GitHub).
Une seule application : le backend Node.js (`server.js` → `app.js`) sert aussi
le frontend React buildé (même domaine, pas de CORS à gérer, API sur `/api`).

## Prérequis déjà en place

- `npm run build` (racine) : installe backend + frontend, puis build Vite → `frontend/dist`
- `npm start` (racine) : lance `node backend/server.js` qui sert `/api`, `/uploads` et le SPA
- `PORT` lu depuis l'environnement (fourni par Hostinger)
- Migrations automatiques au démarrage (`db/migrate.js`) — pas de SQL à rejouer,
  sauf l'import initial de `database.sql`
- Health check : `GET /api/health`

## 1. Base de données MySQL (hPanel)

1. hPanel → **Bases de données** → **MySQL** : créer base + utilisateur.
2. **phpMyAdmin** → importer `database.sql`.
3. Noter : `DB_HOST` (souvent `localhost`), base, utilisateur, mot de passe.

## 2. Pousser le code sur GitHub

Le repo est déjà lié : `origin → github.com/SySamba/salle-sport.git`

```bash
git add -A
git commit -m "message"
git push origin main
```

> `.env`, `node_modules`, `dist`, les zips et les dossiers `backend 2/` sont
> exclus par `.gitignore` — aucun secret ne part sur GitHub.

## 3. Configurer l'application sur Hostinger

1. Choisir **Importer un dépôt Git** → connecter GitHub → sélectionner `salle-sport`.
2. Commandes :
   - **Build** : `npm run build`
   - **Démarrage** : `npm start`
   - **Version Node** : 18+
3. **Variables d'environnement** (voir `backend/.env.example`) :

   ```env
   DB_HOST=localhost
   DB_USER=<utilisateur mysql>
   DB_PASSWORD=<mot de passe>
   DB_NAME=<nom de la base>
   JWT_SECRET=<openssl rand -hex 32>
   CORS_ORIGIN=https://salle-sport.sambasy.com
   NODE_ENV=production
   ```

   > `PORT` : géré par Hostinger, ne pas le définir.
   > `CORS_ORIGIN` est requis en production : seul ce domaine sera accepté
   > par l'API (voir `config/env.js`).

4. Lier le sous-domaine `salle-sport.sambasy.com` à l'application Node
   (hPanel → Domaines → créer le sous-domaine → l'assigner à l'app).
5. Déployer. À chaque `git push`, Hostinger peut redéployer automatiquement.

## 4. Vérifications post-déploiement

| Check | Attendu |
|---|---|
| `https://salle-sport.sambasy.com/api/health` | `{"status":"ok",...}` |
| `/login` admin / admin123 | connexion → **changer le mot de passe admin** |
| QR / Contrôle d'accès | verdict + écriture `access_logs` |

## Sécurité — avant la mise en production

- [ ] `admin123` changé (Utilisateurs → réinitialiser)
- [ ] `JWT_SECRET` long et aléatoire configuré
- [ ] `CORS_ORIGIN` défini sur le domaine exact
- [ ] `NODE_ENV=production` (les messages d'erreur détaillés sont alors masqués)
