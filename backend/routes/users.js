const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, full_name, email, role, is_active, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', authorize(['admin']), async (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashed, full_name, email, role]
    );
    const [rows] = await pool.query('SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', authorize(['admin']), async (req, res) => {
  try {
    const { full_name, email, role, is_active } = req.body;
    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [full_name, email, role, is_active, req.params.id]
    );
    const [rows] = await pool.query('SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/reset-password', authorize(['admin']), async (req, res) => {
  try {
    const { password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id]);
    res.json({ message: 'Mot de passe réinitialisé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
