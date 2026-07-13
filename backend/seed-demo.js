const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function seedDemo() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insérer ou mettre à jour les plans
    const plans = [
      { name: 'Séance Unique', duration_days: 1, price: 2000, description: 'Une seule séance d\'entraînement' },
      { name: 'Hebdomadaire', duration_days: 7, price: 5000, description: 'Accès illimité pendant 7 jours' },
      { name: 'Mensuel', duration_days: 30, price: 15000, description: 'Accès illimité pendant 30 jours' },
      { name: 'Trimestriel', duration_days: 90, price: 40000, description: 'Accès illimité pendant 3 mois' },
      { name: 'Semestriel', duration_days: 180, price: 75000, description: 'Accès illimité pendant 6 mois' },
      { name: 'Annuel', duration_days: 365, price: 130000, description: 'Accès illimité pendant 1 an' },
    ];

    for (const p of plans) {
      await conn.query(
        'INSERT INTO plans (name, duration_days, price, description, is_active) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE price=VALUES(price), description=VALUES(description)',
        [p.name, p.duration_days, p.price, p.description]
      );
    }
    console.log('✓ Plans insérés');

    // 2. Utilisateurs supplémentaires
    const hashed = await bcrypt.hash('agent123', 10);
    const hashedResp = await bcrypt.hash('resp123', 10);

    await conn.query(
      'INSERT INTO users (username, password, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)',
      ['agent1', hashed, 'Mamadou Ndiaye', 'agent@salle-sport.sn', 'reception']
    );
    await conn.query(
      'INSERT INTO users (username, password, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)',
      ['responsable1', hashedResp, 'Aminata Diop', 'responsable@salle-sport.sn', 'responsable']
    );
    console.log('✓ Utilisateurs insérés');

    // 3. Nettoyer les anciennes données de démo si existantes
    await conn.query('DELETE FROM access_logs WHERE member_id IN (SELECT id FROM members WHERE member_number LIKE "M100%")');
    await conn.query('DELETE FROM attendance WHERE member_id IN (SELECT id FROM members WHERE member_number LIKE "M100%")');
    await conn.query('DELETE FROM payments WHERE member_id IN (SELECT id FROM members WHERE member_number LIKE "M100%")');
    await conn.query('DELETE FROM subscriptions WHERE member_id IN (SELECT id FROM members WHERE member_number LIKE "M100%")');
    await conn.query('DELETE FROM members WHERE member_number LIKE "M100%"');
    console.log('✓ Anciennes données nettoyées');

    // 4. Membres sénégalais
    const membersData = [
      { num: 'M100001', fn: 'Modou', ln: 'Fall', sex: 'Homme', phone: '77 123 45 01', status: 'Actif', days: 45 },
      { num: 'M100002', fn: 'Fatou', ln: 'Diop', sex: 'Femme', phone: '76 234 56 02', status: 'Actif', days: 30 },
      { num: 'M100003', fn: 'Ibrahima', ln: 'Ndiaye', sex: 'Homme', phone: '77 345 67 03', status: 'Actif', days: 15 },
      { num: 'M100004', fn: 'Aminata', ln: 'Niang', sex: 'Femme', phone: '70 456 78 04', status: 'Actif', days: 60 },
      { num: 'M100005', fn: 'Mamadou', ln: 'Diallo', sex: 'Homme', phone: '77 567 89 05', status: 'Inactif', days: 90 },
      { num: 'M100006', fn: 'Mariama', ln: 'Sow', sex: 'Femme', phone: '76 678 90 06', status: 'Actif', days: 10 },
      { num: 'M100007', fn: 'Alioune', ln: 'Sall', sex: 'Homme', phone: '77 789 01 07', status: 'Actif', days: 20 },
      { num: 'M100008', fn: 'Khady', ln: 'Kane', sex: 'Femme', phone: '70 890 12 08', status: 'Inactif', days: 120 },
      { num: 'M100009', fn: 'Ousmane', ln: 'Ba', sex: 'Homme', phone: '77 901 23 09', status: 'Actif', days: 5 },
      { num: 'M100010', fn: 'Ndèye', ln: 'Bâ', sex: 'Femme', phone: '76 012 34 10', status: 'Actif', days: 35 },
      { num: 'M100011', fn: 'Cheikh', ln: 'Touré', sex: 'Homme', phone: '77 123 45 11', status: 'Actif', days: 25 },
      { num: 'M100012', fn: 'Oumou', ln: 'Ly', sex: 'Femme', phone: '70 234 56 12', status: 'Inactif', days: 80 },
      { num: 'M100013', fn: 'Moussa', ln: 'Camara', sex: 'Homme', phone: '77 345 67 13', status: 'Actif', days: 18 },
      { num: 'M100014', fn: 'Ramata', ln: 'Dieng', sex: 'Femme', phone: '76 456 78 14', status: 'Actif', days: 50 },
      { num: 'M100015', fn: 'Amadou', ln: 'Faye', sex: 'Homme', phone: '77 567 89 15', status: 'Inactif', days: 100 },
      { num: 'M100016', fn: 'Aïcha', ln: 'Ndiaye', sex: 'Femme', phone: '70 678 90 16', status: 'Actif', days: 8 },
      { num: 'M100017', fn: 'Lamine', ln: 'Gueye', sex: 'Homme', phone: '77 789 01 17', status: 'Actif', days: 40 },
      { num: 'M100018', fn: 'Coumba', ln: 'Mbengue', sex: 'Femme', phone: '76 890 12 18', status: 'Actif', days: 22 },
      { num: 'M100019', fn: 'Papa', ln: 'Seck', sex: 'Homme', phone: '77 901 23 19', status: 'Inactif', days: 70 },
      { num: 'M100020', fn: 'Nogoye', ln: 'Sène', sex: 'Femme', phone: '70 012 34 20', status: 'Actif', days: 12 },
    ];

    const memberIds = {};
    for (const m of membersData) {
      const [res] = await conn.query(
        'INSERT INTO members (member_number, first_name, last_name, sex, phone, photo, qr_code, status, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? DAY))',
        [m.num, m.fn, m.ln, m.sex, m.phone, m.num, m.status, m.days]
      );
      memberIds[m.num] = res.insertId;
    }
    console.log('✓ 20 membres insérés');

    // 5. Abonnements
    const subs = [
      { num: 'M100001', plan: 4, daysAgo: 30 },
      { num: 'M100002', plan: 3, daysAgo: 10 },
      { num: 'M100003', plan: 5, daysAgo: 45 },
      { num: 'M100004', plan: 6, daysAgo: 60 },
      { num: 'M100005', plan: 3, daysAgo: 60, expired: true },
      { num: 'M100006', plan: 2, daysAgo: 3 },
      { num: 'M100007', plan: 3, daysAgo: 5 },
      { num: 'M100008', plan: 4, daysAgo: 120, expired: true },
      { num: 'M100009', plan: 1, daysAgo: 0 },
      { num: 'M100010', plan: 5, daysAgo: 20 },
      { num: 'M100011', plan: 3, daysAgo: 15 },
      { num: 'M100012', plan: 2, daysAgo: 20, expired: true },
      { num: 'M100013', plan: 4, daysAgo: 40 },
      { num: 'M100014', plan: 6, daysAgo: 50 },
      { num: 'M100015', plan: 3, daysAgo: 100, expired: true },
      { num: 'M100016', plan: 2, daysAgo: 2 },
      { num: 'M100017', plan: 4, daysAgo: 25 },
      { num: 'M100018', plan: 3, daysAgo: 8 },
      { num: 'M100019', plan: 5, daysAgo: 200, expired: true },
      { num: 'M100020', plan: 3, daysAgo: 6 },
    ];

    const [planRows] = await conn.query('SELECT id, duration_days FROM plans WHERE is_active = 1');
    const planMap = {};
    for (const p of planRows) planMap[p.id] = p.duration_days;

    for (const s of subs) {
      const mid = memberIds[s.num];
      const dur = planMap[s.plan];
      const start = new Date();
      start.setDate(start.getDate() - s.daysAgo);
      const end = new Date(start);
      if (s.expired) {
        end.setDate(end.getDate() - 1); // déjà expiré
      } else {
        end.setDate(end.getDate() + dur);
      }
      const status = s.expired ? 'Expire' : 'Actif';
      await conn.query(
        'INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
        [mid, s.plan, start.toISOString().split('T')[0], end.toISOString().split('T')[0], status]
      );
    }
    console.log('✓ Abonnements insérés');

    // 6. Paiements
    const payments = [
      { num: 'M100001', amount: 40000, daysAgo: 30, method: 'Mobile', note: 'Paiement Wave - Trimestriel' },
      { num: 'M100002', amount: 15000, daysAgo: 10, method: 'Espèces', note: 'Paiement comptant' },
      { num: 'M100003', amount: 75000, daysAgo: 45, method: 'Carte', note: 'Paiement carte bancaire' },
      { num: 'M100004', amount: 130000, daysAgo: 60, method: 'Virement', note: 'Virement bancaire' },
      { num: 'M100005', amount: 15000, daysAgo: 60, method: 'Espèces', note: 'Mensuel - non renouvelé' },
      { num: 'M100006', amount: 5000, daysAgo: 3, method: 'Mobile', note: 'Wave' },
      { num: 'M100007', amount: 15000, daysAgo: 5, method: 'Espèces', note: null },
      { num: 'M100008', amount: 40000, daysAgo: 120, method: 'Virement', note: 'Non renouvelé' },
      { num: 'M100009', amount: 2000, daysAgo: 0, method: 'Mobile', note: 'Wave - Séance unique' },
      { num: 'M100010', amount: 75000, daysAgo: 20, method: 'Carte', note: null },
      { num: 'M100011', amount: 15000, daysAgo: 15, method: 'Espèces', note: null },
      { num: 'M100012', amount: 5000, daysAgo: 20, method: 'Mobile', note: 'Non renouvelé' },
      { num: 'M100013', amount: 40000, daysAgo: 40, method: 'Carte', note: null },
      { num: 'M100014', amount: 130000, daysAgo: 50, method: 'Virement', note: null },
      { num: 'M100015', amount: 15000, daysAgo: 100, method: 'Espèces', note: 'Non renouvelé' },
      { num: 'M100016', amount: 5000, daysAgo: 2, method: 'Mobile', note: 'Wave' },
      { num: 'M100017', amount: 40000, daysAgo: 25, method: 'Carte', note: null },
      { num: 'M100018', amount: 15000, daysAgo: 8, method: 'Espèces', note: null },
      { num: 'M100019', amount: 75000, daysAgo: 200, method: 'Virement', note: 'Non renouvelé' },
      { num: 'M100020', amount: 15000, daysAgo: 6, method: 'Mobile', note: 'Orange Money' },
      // Historique
      { num: 'M100001', amount: 40000, daysAgo: 120, method: 'Mobile', note: 'Premier trimestriel' },
      { num: 'M100002', amount: 15000, daysAgo: 40, method: 'Espèces', note: 'Premier mensuel' },
      { num: 'M100003', amount: 75000, daysAgo: 225, method: 'Carte', note: 'Premier semestriel' },
      { num: 'M100004', amount: 130000, daysAgo: 425, method: 'Virement', note: 'Premier annuel' },
      { num: 'M100010', amount: 75000, daysAgo: 200, method: 'Carte', note: 'Premier semestriel' },
      { num: 'M100014', amount: 130000, daysAgo: 415, method: 'Virement', note: 'Premier annuel' },
    ];

    for (const p of payments) {
      const mid = memberIds[p.num];
      const date = new Date();
      date.setDate(date.getDate() - p.daysAgo);
      await conn.query(
        'INSERT INTO payments (member_id, amount, payment_date, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
        [mid, p.amount, date.toISOString().split('T')[0], p.method, p.note]
      );
    }
    console.log('✓ Paiements insérés');

    // 7. Présences (7 derniers jours)
    const attendanceEntries = [
      { num: 'M100001', daysAgo: 0, time: '08:30' },
      { num: 'M100002', daysAgo: 0, time: '09:15' },
      { num: 'M100003', daysAgo: 0, time: '10:00' },
      { num: 'M100006', daysAgo: 0, time: '11:30' },
      { num: 'M100007', daysAgo: 0, time: '14:00' },
      { num: 'M100009', daysAgo: 0, time: '16:45' },
      { num: 'M100011', daysAgo: 0, time: '18:00' },
      { num: 'M100016', daysAgo: 0, time: '19:30' },
      { num: 'M100018', daysAgo: 0, time: '20:15' },
      { num: 'M100020', daysAgo: 0, time: '07:00' },
      { num: 'M100001', daysAgo: 1, time: '08:00' },
      { num: 'M100002', daysAgo: 1, time: '09:30' },
      { num: 'M100004', daysAgo: 1, time: '10:45' },
      { num: 'M100007', daysAgo: 1, time: '14:30' },
      { num: 'M100010', daysAgo: 1, time: '17:00' },
      { num: 'M100013', daysAgo: 1, time: '18:30' },
      { num: 'M100017', daysAgo: 1, time: '19:00' },
      { num: 'M100020', daysAgo: 1, time: '07:30' },
      { num: 'M100003', daysAgo: 2, time: '10:00' },
      { num: 'M100006', daysAgo: 2, time: '11:00' },
      { num: 'M100011', daysAgo: 2, time: '15:30' },
      { num: 'M100014', daysAgo: 2, time: '16:00' },
      { num: 'M100018', daysAgo: 2, time: '20:00' },
      { num: 'M100001', daysAgo: 3, time: '08:15' },
      { num: 'M100004', daysAgo: 3, time: '09:45' },
      { num: 'M100007', daysAgo: 3, time: '13:30' },
      { num: 'M100010', daysAgo: 3, time: '17:15' },
      { num: 'M100013', daysAgo: 3, time: '18:45' },
      { num: 'M100016', daysAgo: 3, time: '19:30' },
      { num: 'M100020', daysAgo: 3, time: '06:45' },
      { num: 'M100002', daysAgo: 4, time: '09:00' },
      { num: 'M100006', daysAgo: 4, time: '10:30' },
      { num: 'M100009', daysAgo: 4, time: '15:00' },
      { num: 'M100011', daysAgo: 4, time: '16:30' },
      { num: 'M100017', daysAgo: 4, time: '18:00' },
      { num: 'M100003', daysAgo: 5, time: '11:00' },
      { num: 'M100007', daysAgo: 5, time: '14:00' },
      { num: 'M100013', daysAgo: 5, time: '17:30' },
      { num: 'M100014', daysAgo: 5, time: '18:15' },
      { num: 'M100018', daysAgo: 5, time: '19:45' },
      { num: 'M100001', daysAgo: 6, time: '07:45' },
      { num: 'M100004', daysAgo: 6, time: '09:30' },
      { num: 'M100010', daysAgo: 6, time: '10:15' },
      { num: 'M100011', daysAgo: 6, time: '16:00' },
      { num: 'M100016', daysAgo: 6, time: '20:00' },
      { num: 'M100020', daysAgo: 6, time: '06:30' },
    ];

    for (const a of attendanceEntries) {
      const mid = memberIds[a.num];
      const date = new Date();
      date.setDate(date.getDate() - a.daysAgo);
      const [h, m] = a.time.split(':');
      date.setHours(parseInt(h), parseInt(m), 0, 0);
      await conn.query(
        'INSERT INTO attendance (member_id, entry_date, entry_time) VALUES (?, ?, ?)',
        [mid, date.toISOString().split('T')[0], a.time]
      );
    }
    console.log('✓ Présences insérées');

    // 8. Logs d'accès
    const accessLogs = [
      { num: 'M100001', status: 'Autorisé', daysAgo: 0, time: '08:30', by: 'Agent Mamadou' },
      { num: 'M100002', status: 'Autorisé', daysAgo: 0, time: '09:15', by: 'Agent Mamadou' },
      { num: 'M100005', status: 'Refusé', daysAgo: 0, time: '10:00', by: 'Agent Mamadou', reason: 'Abonnement expiré' },
      { num: 'M100003', status: 'Autorisé', daysAgo: 0, time: '10:00', by: 'Agent Mamadou' },
      { num: 'M100008', status: 'Refusé', daysAgo: 0, time: '11:00', by: 'Agent Mamadou', reason: 'Abonnement expiré' },
      { num: 'M100007', status: 'Autorisé', daysAgo: 0, time: '14:00', by: 'Agent Mamadou' },
      { num: 'M100012', status: 'Refusé', daysAgo: 0, time: '15:00', by: 'Agent Mamadou', reason: 'Abonnement expiré' },
      { num: 'M100015', status: 'Refusé', daysAgo: 0, time: '16:00', by: 'Agent Mamadou', reason: 'Abonnement expiré' },
    ];

    for (const l of accessLogs) {
      const mid = memberIds[l.num];
      const date = new Date();
      date.setDate(date.getDate() - l.daysAgo);
      const [h, m] = l.time.split(':');
      date.setHours(parseInt(h), parseInt(m), 0, 0);
      await conn.query(
        'INSERT INTO access_logs (member_id, status, reason, entry_date, entry_time) VALUES (?, ?, ?, ?, ?)',
        [mid, l.status, l.reason || null, date.toISOString().split('T')[0], l.time]
      );
    }
    console.log('✓ Logs d\'accès insérés');

    await conn.commit();
    console.log('\n🎉 DONNÉES DE DÉMO INSÉRÉES AVEC SUCCÈS !');
    console.log('   6 formules d\'abonnement');
    console.log('   3 utilisateurs (admin, agent, responsable)');
    console.log('   20 adhérents sénégalais');
    console.log('   20 abonnements (actifs + expirés)');
    console.log('   26 paiements');
    console.log('   47 présences sur 7 jours');
    console.log('   8 logs de contrôle d\'accès');

  } catch (err) {
    await conn.rollback();
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

seedDemo();
