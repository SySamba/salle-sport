const REQUIRED = ['JWT_SECRET'];

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const msg = `Variables d'environnement manquantes : ${missing.join(', ')}`;
    if (isProd) {
      console.error(`FATAL: ${msg} — arrêt du serveur`);
      process.exit(1);
    }
    console.warn(`AVERTISSEMENT: ${msg} — l'authentification JWT échouera`);
  }

  if (isProd && !process.env.CORS_ORIGIN) {
    console.warn('AVERTISSEMENT: CORS_ORIGIN non défini en production — toutes les origines seront acceptées');
  }
}

module.exports = { validateEnv };
