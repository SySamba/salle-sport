const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { validate, paymentCreate } = require('../middleware/validators');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { member_id, start_date, end_date } = req.query;
    let sql = 'SELECT p.*, m.first_name, m.last_name, m.member_number FROM payments p JOIN members m ON p.member_id = m.id WHERE 1=1';
    const params = [];

    if (member_id) {
      sql += ' AND p.member_id = ?';
      params.push(member_id);
    }
    if (start_date && end_date) {
      sql += ' AND p.payment_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    sql += ' ORDER BY p.payment_date DESC, p.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', paymentCreate, validate, async (req, res) => {
  try {
    const { member_id, subscription_id, amount, payment_date, payment_method, notes } = req.body;
    const [result] = await pool.query(
      'INSERT INTO payments (member_id, subscription_id, amount, payment_date, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [member_id, subscription_id || null, amount, payment_date || new Date().toISOString().split('T')[0], payment_method || 'Espèces', notes]
    );

    const [rows] = await pool.query(
      'SELECT p.*, m.first_name, m.last_name, m.member_number FROM payments p JOIN members m ON p.member_id = m.id WHERE p.id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
