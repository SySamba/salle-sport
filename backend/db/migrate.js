const pool = require('../config/database');

// MySQL ne supporte pas IF NOT EXISTS pour les ALTER TABLE :
// chaque migration est appliquée et ignorée silencieusement si la
// colonne/contrainte existe déjà.
const migrations = [
  {
    name: 'members.password',
    sql: 'ALTER TABLE members ADD COLUMN password VARCHAR(255)',
  },
  {
    name: 'members.photo LONGTEXT',
    sql: 'ALTER TABLE members MODIFY COLUMN photo LONGTEXT',
  },
  {
    name: 'members.status DEFAULT Inactif',
    sql: 'ALTER TABLE members ALTER COLUMN status SET DEFAULT "Inactif"',
  },
  {
    name: 'users.role + responsable',
    sql: 'ALTER TABLE users MODIFY COLUMN role ENUM("admin", "responsable", "reception") DEFAULT "reception"',
  },
  {
    // QR codes opaques : remplace qr_code = member_number (devinable) par un UUID.
    // member_number reste utilisable comme fallback de recherche manuelle.
    name: 'members.qr_code → UUID',
    sql: 'UPDATE members SET qr_code = UUID() WHERE qr_code = member_number',
  },
];

async function migrate() {
  for (const migration of migrations) {
    try {
      await pool.query(migration.sql);
      console.log(`Migration appliquée : ${migration.name}`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.warn(`Migration ignorée (${migration.name}) : ${err.message}`);
      }
    }
  }
}

module.exports = migrate;
