const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

async function deactivateExpiredMembers() {
  try {
    await pool.query(
      `UPDATE members SET status = 'Inactif'
       WHERE status = 'Actif'
       AND id NOT IN (
         SELECT member_id FROM subscriptions
         WHERE status = 'Actif' AND end_date >= CURDATE()
       )`
    );
  } catch (e) {}
}

// GET all members with search
router.get('/', async (req, res) => {
  try {
    await deactivateExpiredMembers();
    const { search, status } = req.query;
    let sql = 'SELECT m.*, s.status as sub_status, p.name as plan_name FROM members m LEFT JOIN subscriptions s ON m.id = s.member_id AND s.status = "Actif" LEFT JOIN plans p ON s.plan_id = p.id WHERE 1=1';
    const params = [];

    if (search) {
      const searchClean = search.replace(/\s/g, '');
      sql += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.member_number LIKE ? OR m.phone LIKE ? OR REPLACE(m.phone, " ", "") LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${searchClean}%`);
    }
    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY m.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET member by id
router.get('/:id', async (req, res) => {
  try {
    const [memberRows] = await pool.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (memberRows.length === 0) return res.status(404).json({ message: 'Adhérent non trouvé' });

    const member = memberRows[0];
    const [subRows] = await pool.query(
      'SELECT s.*, p.name as plan_name, p.price FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.member_id = ? ORDER BY s.created_at DESC',
      [req.params.id]
    );
    const [paymentRows] = await pool.query('SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC', [req.params.id]);
    const [attendanceRows] = await pool.query('SELECT * FROM attendance WHERE member_id = ? ORDER BY entry_date DESC, entry_time DESC LIMIT 30', [req.params.id]);

    res.json({ member, subscriptions: subRows, payments: paymentRows, attendance: attendanceRows });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST create member
router.post('/', async (req, res) => {
  try {
    const { full_name, sex, phone, photo } = req.body;
 const normalizedPhone = (phone || '').replace(/\s/g, '');
    if (normalizedPhone) {
      const [existing] = await pool.query('SELECT id FROM members WHERE REPLACE(phone, " ", "") = ?', [normalizedPhone]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé par un adhérent' });
      }
    }

    const parts = (full_name || '').trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';
    const member_number = 'M' + Date.now().toString().slice(-6);
    const qr_code = member_number;
    const tempPassword = phone || '123456';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [result] = await pool.query(
      'INSERT INTO members (member_number, first_name, last_name, sex, phone, photo, qr_code, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [member_number, first_name, last_name, sex, phone, photo || null, qr_code, hashedPassword, 'Inactif']
    );

    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], temp_password: tempPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  try {
    const { full_name, sex, phone, photo, status } = req.body;
    const [existingRows] = await pool.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (existingRows.length === 0) return res.status(404).json({ message: 'Adhérent non trouvé' });
    const existing = existingRows[0];

    const phoneToCheck = phone !== undefined ? phone : existing.phone;
    const normalizedPhone = (phoneToCheck || '').replace(/\s/g, '');
    if (normalizedPhone) {
      const [duplicate] = await pool.query(
        'SELECT id FROM members WHERE REPLACE(phone, " ", "") = ? AND id != ?',
        [normalizedPhone, req.params.id]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé par un adhérent' });
      }
    }

    let first_name = existing.first_name;
    let last_name = existing.last_name;
    if (full_name !== undefined) {
      const parts = full_name.trim().split(/\s+/);
      first_name = parts[0] || '';
      last_name = parts.slice(1).join(' ') || '';
    }

    await pool.query(
      'UPDATE members SET first_name = ?, last_name = ?, sex = ?, phone = ?, photo = ?, status = ? WHERE id = ?',
      [
        first_name,
        last_name,
        sex !== undefined ? sex : existing.sex,
        phone !== undefined ? phone : existing.phone,
        photo !== undefined ? photo : existing.photo,
        status !== undefined ? status : existing.status,
        req.params.id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Adhérent supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET check member by QR
router.get('/qr/:qr', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM members WHERE qr_code = ? OR member_number = ?', [req.params.qr, req.params.qr]);
    if (rows.length === 0) return res.status(404).json({ message: 'QR Code invalide' });

    const member = rows[0];
    const [subRows] = await pool.query(
      'SELECT s.*, p.name as plan_name, p.duration_days FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.member_id = ? AND s.status = "Actif" AND s.end_date >= CURDATE() ORDER BY s.end_date DESC LIMIT 1',
      [member.id]
    );

    res.json({ member, subscription: subRows[0] || null });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
