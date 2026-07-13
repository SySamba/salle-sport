# Guide de déploiement Hostinger (le plus simple) - Salle de Sport

Domaine cible : **salle-sport.sambasy.com**

Méthode : **Import d'un dépôt Git** (l'option recommandée par Hostinger).
Une seule application : le backend Node.js sert aussi le frontend React
(même domaine, **pas de CORS ni de sous-domaine**, l'API reste sur `/api`).

> Le projet est déjà configuré : à la racine, `npm run build` installe et
> construit le frontend, `npm start` lance le serveur qui sert tout.

---

## 1. Base de données MySQL (hPanel)

1. hPanel > **Bases de données** > **MySQL**.
2. Créez une base (ex : `u123_salle_sport`) et un utilisateur avec mot de passe.
3. Ouvrez **phpMyAdmin** et importez le fichier `database.sql`.
4. Notez : nom de la base, utilisateur, mot de passe, hôte (souvent `localhost`).

---

## 2. Mettre le code sur GitHub

```
git init
git add .
git commit -m "Application salle de sport"
git branch -M main
git remote add origin https://github.com/<votre-compte>/salle-sport.git
git push -u origin main
```

> Les secrets (`.env`) et `node_modules` sont déjà exclus par `.gitignore`.

---

## 3. Importer le dépôt dans Hostinger

1. Sur l'écran "Déployez votre application web", choisissez **Importez un dépôt Git**.
2. **Connectez-vous avec GitHub** et autorisez Hostinger.
3. Sélectionnez le dépôt `salle-sport`.
4. Renseignez, si demandé :
   - **Commande de build** : `npm run build`
   - **Commande de démarrage** : `npm start`
   - **Version Node** : 18 ou plus
5. Dans **Variables d'environnement**, ajoutez (voir `backend/.env.example`) :
   ```
   DB_HOST=localhost
   DB_USER=<utilisateur>
   DB_PASSWORD=<mot de passe>
   DB_NAME=<nom de la base>
   JWT_SECRET=<clé longue aléatoire : openssl rand -hex 32>
   CORS_ORIGIN=https://salle-sport.sambasy.com
   ```
   > `PORT` est géré automatiquement par Hostinger, ne pas le forcer.
6. Lancez le **déploiement**.

> À chaque `git push`, Hostinger peut redéployer automatiquement.

---

## 4. Domaine et SSL

1. hPanel > **Domaines** : assurez-vous que `salle-sport.sambasy.com` pointe vers l'application.
2. Activez le **certificat SSL gratuit** (Let's Encrypt).

---

## 5. Première connexion

- Compte admin créé automatiquement au 1er démarrage : **admin / admin123**.
- Connectez-vous et **changez immédiatement le mot de passe**.

---

## Checklist avant mise en ligne

- [ ] Base MySQL créée et `database.sql` importé
- [ ] `frontend/.env.production` vide
- [ ] Code poussé sur GitHub
- [ ] Dépôt importé dans Hostinger (build `npm run build`, start `npm start`)
- [ ] Variables d'environnement renseignées
- [ ] `JWT_SECRET` = clé aléatoire forte
- [ ] SSL (https) activé
- [ ] Mot de passe admin changé
