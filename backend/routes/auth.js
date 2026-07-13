const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, full_name, email, role, is_active FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Member login (phone + password)
router.post('/member-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM members WHERE phone = ? AND status = "Actif"', [phone]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Numéro de téléphone invalide' });
    }

    const member = rows[0];
    if (!member.password) {
      return res.status(401).json({ message: 'Mot de passe non défini. Contactez l\'administrateur.' });
    }

    const valid = await bcrypt.compare(password, member.password);
    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: member.id, role: 'member', full_name: `${member.first_name} ${member.last_name}`, phone: member.phone },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: member.id, full_name: `${member.first_name} ${member.last_name}`, phone: member.phone, role: 'member', member_number: member.member_number, photo: member.photo }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get current member profile
router.get('/member-me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, member_number, first_name, last_name, sex, phone, address, photo, status FROM members WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Adhérent non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
