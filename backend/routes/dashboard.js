const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    const currentYear = today.substring(0, 4);

    const [[totalMembers]] = await pool.query('SELECT COUNT(*) as count FROM members');
    const [[activeMembers]] = await pool.query('SELECT COUNT(*) as count FROM members WHERE status = "Actif"');
    const [[activeSubs]] = await pool.query('SELECT COUNT(*) as count FROM subscriptions WHERE status = "Actif" AND end_date >= CURDATE()');
    const [[expiredSubs]] = await pool.query('SELECT COUNT(*) as count FROM subscriptions WHERE status = "Actif" AND end_date < CURDATE()');
    const [[todayAttendance]] = await pool.query('SELECT COUNT(*) as count FROM attendance WHERE entry_date = ?', [today]);

    const [[todayRevenue]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_date = ?', [today]);
    const [[monthRevenue]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_date LIKE ?', [`${currentMonth}%`]);
    const [[yearRevenue]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_date LIKE ?', [`${currentYear}%`]);

    const [recentMembers] = await pool.query('SELECT * FROM members ORDER BY created_at DESC LIMIT 5');
    const [recentPayments] = await pool.query(
      'SELECT p.*, m.first_name, m.last_name FROM payments p JOIN members m ON p.member_id = m.id ORDER BY p.created_at DESC LIMIT 5'
    );
    const [expiringSoon] = await pool.query(
      'SELECT s.*, m.first_name, m.last_name, m.phone, p.name as plan_name FROM subscriptions s JOIN members m ON s.member_id = m.id JOIN plans p ON s.plan_id = p.id WHERE s.status = "Actif" AND s.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) ORDER BY s.end_date'
    );

    res.json({
      stats: {
        totalMembers: totalMembers.count,
        activeMembers: activeMembers.count,
        activeSubscriptions: activeSubs.count,
        expiredSubscriptions: expiredSubs.count,
        todayAttendance: todayAttendance.count,
        todayRevenue: todayRevenue.total,
        monthRevenue: monthRevenue.total,
        yearRevenue: yearRevenue.total
      },
      recentMembers,
      recentPayments,
      expiringSoon
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const [monthlyRevenue] = await pool.query(
      'SELECT MONTH(payment_date) as month, COALESCE(SUM(amount), 0) as total FROM payments WHERE YEAR(payment_date) = ? GROUP BY MONTH(payment_date) ORDER BY month',
      [year]
    );

    const [monthlyAttendance] = await pool.query(
      'SELECT MONTH(entry_date) as month, COUNT(*) as total FROM attendance WHERE YEAR(entry_date) = ? GROUP BY MONTH(entry_date) ORDER BY month',
      [year]
    );

    res.json({ monthlyRevenue, monthlyAttendance });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
