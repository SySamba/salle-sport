const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { date, member_id } = req.query;
    let sql = 'SELECT a.*, m.first_name, m.last_name, m.member_number, m.photo FROM attendance a JOIN members m ON a.member_id = m.id WHERE 1=1';
    const params = [];

    if (date) {
      sql += ' AND a.entry_date = ?';
      params.push(date);
    }
    if (member_id) {
      sql += ' AND a.member_id = ?';
      params.push(member_id);
    }
    sql += ' ORDER BY a.entry_date DESC, a.entry_time DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE member_id = ? AND entry_date = ?',
      [member_id, today]
    );

    if (existing.length > 0) {
      return res.status(200).json({ message: 'Présence déjà enregistrée', attendance: existing[0] });
    }

    const [result] = await pool.query(
      'INSERT INTO attendance (member_id, entry_date, entry_time) VALUES (?, ?, ?)',
      [member_id, today, now]
    );

    const [rows] = await pool.query(
      'SELECT a.*, m.first_name, m.last_name, m.member_number, m.photo FROM attendance a JOIN members m ON a.member_id = m.id WHERE a.id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
