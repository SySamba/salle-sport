const express = require('express');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, idParam, planCreate, planUpdate } = require('../middleware/validators');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plans WHERE is_active = 1 ORDER BY duration_days');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', authorize(['admin', 'responsable']), planCreate, validate, async (req, res) => {
  try {
    const { name, duration_days, price, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO plans (name, duration_days, price, description) VALUES (?, ?, ?, ?)',
      [name, duration_days, price, description]
    );
    const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id', authorize(['admin', 'responsable']), idParam, planUpdate, validate, async (req, res) => {
  try {
    const { name, duration_days, price, description, is_active } = req.body;
    await pool.query(
      'UPDATE plans SET name = ?, duration_days = ?, price = ?, description = ?, is_active = ? WHERE id = ?',
      [name, duration_days, price, description, is_active, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
