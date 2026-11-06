const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seed() {
  const [users] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin']);
  if (users.length === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', hashed, 'Administrateur', 'admin@salle-sport.com', 'admin', 1]
    );
    console.log('Utilisateur admin créé (admin / admin123)');
  }

  const [plans] = await pool.query('SELECT COUNT(*) as count FROM plans');
  if (plans[0].count === 0) {
    await pool.query(
      `INSERT INTO plans (name, duration_days, price, description) VALUES
      ('Journalier', 1, 1000, 'Accès pour une journée'),
      ('Hebdomadaire', 7, 5000, 'Accès pour une semaine'),
      ('Mensuel', 30, 15000, 'Accès pour un mois'),
      ('Trimestriel', 90, 40000, 'Accès pour 3 mois'),
      ('Semestriel', 180, 75000, 'Accès pour 6 mois'),
      ('Annuel', 365, 140000, 'Accès pour 1 an')`
    );
    console.log('Formules par défaut créées');
  }
}

module.exports = seed;
