const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));

// Servir le frontend React (build de production) sur le même domaine
const fs = require('fs');
const frontendDist = process.env.FRONTEND_DIST || path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Fallback SPA : toute route non-API renvoie index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

async function seedAdmin() {
  try {
    // Ensure members.password column exists
    try {
      await pool.query('ALTER TABLE members ADD COLUMN password VARCHAR(255)');
      console.log('Colonne password ajoutée à members');
    } catch (e) {}

    // Ensure photo column is LONGTEXT
    try {
      await pool.query('ALTER TABLE members MODIFY COLUMN photo LONGTEXT');
      console.log('Colonne photo convertie en LONGTEXT');
    } catch (e) {}

    // Change default status to Inactif
    try {
      await pool.query('ALTER TABLE members ALTER COLUMN status SET DEFAULT "Inactif"');
      console.log('Statut par défaut changé à Inactif');
    } catch (e) {}

    // Add responsable role to users
    try {
      await pool.query('ALTER TABLE users MODIFY COLUMN role ENUM("admin", "responsable", "reception") DEFAULT "reception"');
      console.log('Rôle responsable ajouté');
    } catch (e) {}

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', hashed, 'Administrateur', 'admin@salle-sport.com', 'admin', 1]
      );
      console.log('Utilisateur admin créé (admin / admin123)');
    }
    // Seed default plans
    const [planRows] = await pool.query('SELECT COUNT(*) as count FROM plans');
    if (planRows[0].count === 0) {
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
  } catch (err) {
    console.error('Erreur seed:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  seedAdmin();
});
