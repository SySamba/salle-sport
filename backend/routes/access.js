const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validate, accessVerify } = require('../middleware/validators');

const router = express.Router();
router.use(authenticate);

const MEMBER_SELECT = 'id, member_number, first_name, last_name, sex, phone, photo, status';

async function findMember({ qr, phone }) {
  if (qr) {
    const [rows] = await pool.query(
      `SELECT ${MEMBER_SELECT} FROM members WHERE qr_code = ? OR member_number = ?`,
      [qr, qr]
    );
    return rows[0] || null;
  }
  const normalized = phone.replace(/\s/g, '');
  const [rows] = await pool.query(
    `SELECT ${MEMBER_SELECT} FROM members WHERE REPLACE(phone, " ", "") = ?`,
    [normalized]
  );
  return rows[0] || null;
}

// POST /api/access/verify — décision d'accès côté serveur.
// Chaque tentative est tracée dans access_logs (autorisée ou refusée),
// et la présence est enregistrée dans la même transaction que le log.
router.post('/verify', accessVerify, validate, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { qr, phone } = req.body;
    const member = await findMember({ qr, phone });

    let allowed = false;
    let reason = null;
    let subscription = null;
    let alreadyRegistered = false;

    if (!member) {
      reason = qr ? 'QR Code invalide' : 'Adhérent non trouvé';
    } else if (member.status !== 'Actif') {
      reason = 'Adhérent désactivé';
    } else {
      const [subs] = await conn.query(
        `SELECT s.*, p.name as plan_name, p.price FROM subscriptions s
         JOIN plans p ON s.plan_id = p.id
         WHERE s.member_id = ? AND s.status = "Actif" AND s.end_date >= CURDATE()
         ORDER BY s.end_date DESC LIMIT 1`,
        [member.id]
      );
      subscription = subs[0] || null;
      if (!subscription) {
        reason = 'Aucun abonnement actif';
      } else {
        allowed = true;
      }
    }

    // Si refusé pour abonnement, récupérer quand même le dernier abonnement pour l'affichage
    if (!allowed && member && !subscription) {
      const [subs] = await conn.query(
        `SELECT s.*, p.name as plan_name, p.price FROM subscriptions s
         JOIN plans p ON s.plan_id = p.id
         WHERE s.member_id = ? ORDER BY s.end_date DESC LIMIT 1`,
        [member.id]
      );
      subscription = subs[0] || null;
    }

    await conn.beginTransaction();
    try {
      await conn.query(
        'INSERT INTO access_logs (member_id, status, reason, entry_date, entry_time) VALUES (?, ?, ?, CURDATE(), CURTIME())',
        [member ? member.id : null, allowed ? 'Autorisé' : 'Refusé', reason]
      );

      if (allowed) {
        const [existing] = await conn.query(
          'SELECT id FROM attendance WHERE member_id = ? AND entry_date = CURDATE()',
          [member.id]
        );
        if (existing.length === 0) {
          await conn.query(
            'INSERT INTO attendance (member_id, entry_date, entry_time) VALUES (?, CURDATE(), CURTIME())',
            [member.id]
          );
        } else {
          alreadyRegistered = true;
        }
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    }

    res.json({ allowed, reason, member, subscription, already_registered: alreadyRegistered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    conn.release();
  }
});

module.exports = router;
