const express = require('express');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

router.get('/', async (req, res) => {
  try {
    const { status, member_id } = req.query;
    let sql = 'SELECT s.*, m.first_name, m.last_name, m.member_number, p.name as plan_name, p.price FROM subscriptions s JOIN members m ON s.member_id = m.id JOIN plans p ON s.plan_id = p.id WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (member_id) {
      sql += ' AND s.member_id = ?';
      params.push(member_id);
    }
    sql += ' ORDER BY s.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_id, plan_id, start_date } = req.body;
    const [planRows] = await pool.query('SELECT duration_days, price FROM plans WHERE id = ?', [plan_id]);
    if (planRows.length === 0) return res.status(404).json({ message: 'Formule non trouvée' });

    const end_date = addDays(start_date, planRows[0].duration_days);

    const [result] = await pool.query(
      'INSERT INTO subscriptions (member_id, plan_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [member_id, plan_id, start_date, end_date]
    );

    // Auto-create payment for this subscription
    await pool.query(
      'INSERT INTO payments (member_id, subscription_id, amount, payment_date, payment_method) VALUES (?, ?, ?, ?, ?)',
      [member_id, result.insertId, planRows[0].price, start_date, 'Espèces']
    );

    // Activate member
    await pool.query('UPDATE members SET status = "Actif" WHERE id = ?', [member_id]);

    const [rows] = await pool.query(
      'SELECT s.*, p.name as plan_name, p.price FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/renew', async (req, res) => {
  try {
    const [subRows] = await pool.query('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
    if (subRows.length === 0) return res.status(404).json({ message: 'Abonnement non trouvé' });

    const sub = subRows[0];
    const [planRows] = await pool.query('SELECT duration_days FROM plans WHERE id = ?', [sub.plan_id]);
    const start_date = sub.end_date > new Date().toISOString().split('T')[0] ? sub.end_date : new Date().toISOString().split('T')[0];
    const end_date = addDays(start_date, planRows[0].duration_days);

    await pool.query(
      'UPDATE subscriptions SET start_date = ?, end_date = ?, status = "Actif" WHERE id = ?',
      [start_date, end_date, req.params.id]
    );

    // Activate member
    await pool.query('UPDATE members SET status = "Actif" WHERE id = ?', [sub.member_id]);

    const [rows] = await pool.query(
      'SELECT s.*, p.name as plan_name, p.price FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/:id/cancel', authorize(['admin', 'responsable']), async (req, res) => {
  try {
    await pool.query('UPDATE subscriptions SET status = "Annule" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Abonnement annulé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
