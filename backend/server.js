require('dotenv').config();
const { validateEnv } = require('./config/env');

validateEnv();

const app = require('./app');
const pool = require('./config/database');
const migrate = require('./db/migrate');
const seed = require('./db/seed');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  try {
    await migrate();
    await seed();
  } catch (err) {
    console.error('Erreur initialisation base de données :', err.message);
  }
});

function shutdown(signal) {
  console.log(`${signal} reçu — arrêt en cours`);
  server.close(async () => {
    try {
      await pool.end();
    } finally {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
