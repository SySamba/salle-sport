-- ============================================================
-- DONNÉES DE DÉMO - SALLA DE SPORT SÉNÉGAL
-- ============================================================
USE salle_sport;

-- Plans déjà créés par seedAdmin, on s'assure qu'ils existent
INSERT IGNORE INTO plans (id, name, duration_days, price, description, is_active) VALUES
(1, 'Séance Unique', 1, 2000, 'Une seule séance d\'entraînement', 1),
(2, 'Hebdomadaire', 7, 5000, 'Accès illimité pendant 7 jours', 1),
(3, 'Mensuel', 30, 15000, 'Accès illimité pendant 30 jours', 1),
(4, 'Trimestriel', 90, 40000, 'Accès illimité pendant 3 mois', 1),
(5, 'Semestriel', 180, 75000, 'Accès illimité pendant 6 mois', 1),
(6, 'Annuel', 365, 130000, 'Accès illimité pendant 1 an', 1);

-- Utilisateurs supplémentaires
INSERT IGNORE INTO users (id, username, password, full_name, email, role, is_active) VALUES
(2, 'agent1', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Mamadou Ndiaye', 'agent@salle-sport.sn', 'reception', 1),
(3, 'responsable1', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Aminata Diop', 'responsable@salle-sport.sn', 'responsable', 1);

-- ============================================================
-- MEMBRES (noms sénégalais, téléphones Sénégal)
-- ============================================================
INSERT INTO members (member_number, first_name, last_name, sex, phone, photo, qr_code, status, created_at) VALUES
('M100001', 'Modou', 'Fall', 'Homme', '77 123 45 01', NULL, 'M100001', 'Actif', DATE_SUB(CURDATE(), INTERVAL 45 DAY)),
('M100002', 'Fatou', 'Diop', 'Femme', '76 234 56 02', NULL, 'M100002', 'Actif', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
('M100003', 'Ibrahima', 'Ndiaye', 'Homme', '77 345 67 03', NULL, 'M100003', 'Actif', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
('M100004', 'Aminata', 'Niang', 'Femme', '70 456 78 04', NULL, 'M100004', 'Actif', DATE_SUB(CURDATE(), INTERVAL 60 DAY)),
('M100005', 'Mamadou', 'Diallo', 'Homme', '77 567 89 05', NULL, 'M100005', 'Inactif', DATE_SUB(CURDATE(), INTERVAL 90 DAY)),
('M100006', 'Mariama', 'Sow', 'Femme', '76 678 90 06', NULL, 'M100006', 'Actif', DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
('M100007', 'Alioune', 'Sall', 'Homme', '77 789 01 07', NULL, 'M100007', 'Actif', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
('M100008', 'Khady', 'Kane', 'Femme', '70 890 12 08', NULL, 'M100008', 'Inactif', DATE_SUB(CURDATE(), INTERVAL 120 DAY)),
('M100009', 'Ousmane', 'Ba', 'Homme', '77 901 23 09', NULL, 'M100009', 'Actif', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('M100010', 'Ndèye', 'Bâ', 'Femme', '76 012 34 10', NULL, 'M100010', 'Actif', DATE_SUB(CURDATE(), INTERVAL 35 DAY)),
('M100011', 'Cheikh', 'Touré', 'Homme', '77 123 45 11', NULL, 'M100011', 'Actif', DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
('M100012', 'Oumou', 'Ly', 'Femme', '70 234 56 12', NULL, 'M100012', 'Inactif', DATE_SUB(CURDATE(), INTERVAL 80 DAY)),
('M100013', 'Moussa', 'Camara', 'Homme', '77 345 67 13', NULL, 'M100013', 'Actif', DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
('M100014', 'Ramata', 'Dieng', 'Femme', '76 456 78 14', NULL, 'M100014', 'Actif', DATE_SUB(CURDATE(), INTERVAL 50 DAY)),
('M100015', 'Amadou', 'Faye', 'Homme', '77 567 89 15', NULL, 'M100015', 'Inactif', DATE_SUB(CURDATE(), INTERVAL 100 DAY)),
('M100016', 'Aïcha', 'Ndiaye', 'Femme', '70 678 90 16', NULL, 'M100016', 'Actif', DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
('M100017', 'Lamine', 'Gueye', 'Homme', '77 789 01 17', NULL, 'M100017', 'Actif', DATE_SUB(CURDATE(), INTERVAL 40 DAY)),
('M100018', 'Coumba', 'Mbengue', 'Femme', '76 890 12 18', NULL, 'M100018', 'Actif', DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
('M100019', 'Papa', 'Seck', 'Homme', '77 901 23 19', NULL, 'M100019', 'Inactif', DATE_SUB(CURDATE(), INTERVAL 70 DAY)),
('M100020', 'Nogoye', 'Sène', 'Femme', '70 012 34 20', NULL, 'M100020', 'Actif', DATE_SUB(CURDATE(), INTERVAL 12 DAY));

-- ============================================================
-- ABONNEMENTS
-- ============================================================
INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, status) VALUES
-- Modou Fall - Trimestriel (actif)
(1, 4, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 30 DAY), INTERVAL 90 DAY), 'Actif'),
-- Fatou Diop - Mensuel (actif)
(2, 3, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 10 DAY), INTERVAL 30 DAY), 'Actif'),
-- Ibrahima Ndiaye - Semestriel (actif)
(3, 5, DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 45 DAY), INTERVAL 180 DAY), 'Actif'),
-- Aminata Niang - Annuel (actif)
(4, 6, DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 60 DAY), INTERVAL 365 DAY), 'Actif'),
-- Mamadou Diallo - Mensuel (expiré)
(5, 3, DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Expire'),
-- Mariama Sow - Hebdomadaire (actif)
(6, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 3 DAY), INTERVAL 7 DAY), 'Actif'),
-- Alioune Sall - Mensuel (actif)
(7, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 5 DAY), INTERVAL 30 DAY), 'Actif'),
-- Khady Kane - Trimestriel (expiré)
(8, 4, DATE_SUB(CURDATE(), INTERVAL 120 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Expire'),
-- Ousmane Ba - Séance unique (actif)
(9, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Actif'),
-- Ndèye Bâ - Semestriel (actif)
(10, 5, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 20 DAY), INTERVAL 180 DAY), 'Actif'),
-- Cheikh Touré - Mensuel (actif)
(11, 3, DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 15 DAY), INTERVAL 30 DAY), 'Actif'),
-- Oumou Ly - Hebdomadaire (expiré)
(12, 2, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'Expire'),
-- Moussa Camara - Trimestriel (actif)
(13, 4, DATE_SUB(CURDATE(), INTERVAL 40 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 40 DAY), INTERVAL 90 DAY), 'Actif'),
-- Ramata Dieng - Annuel (actif)
(14, 6, DATE_SUB(CURDATE(), INTERVAL 50 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 50 DAY), INTERVAL 365 DAY), 'Actif'),
-- Amadou Faye - Mensuel (expiré)
(15, 3, DATE_SUB(CURDATE(), INTERVAL 100 DAY), DATE_SUB(CURDATE(), INTERVAL 70 DAY), 'Expire'),
-- Aïcha Ndiaye - Hebdomadaire (actif)
(16, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 2 DAY), INTERVAL 7 DAY), 'Actif'),
-- Lamine Gueye - Trimestriel (actif)
(17, 4, DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 25 DAY), INTERVAL 90 DAY), 'Actif'),
-- Coumba Mbengue - Mensuel (actif)
(18, 3, DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 8 DAY), INTERVAL 30 DAY), 'Actif'),
-- Papa Seck - Semestriel (expiré)
(19, 5, DATE_SUB(CURDATE(), INTERVAL 200 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Expire'),
-- Nogoye Sène - Mensuel (actif)
(20, 3, DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 6 DAY), INTERVAL 30 DAY), 'Actif');

-- ============================================================
-- PAIEMENTS
-- ============================================================
INSERT INTO payments (member_id, amount, payment_date, payment_method, notes) VALUES
(1, 40000, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Mobile', 'Paiement Wave - Trimestriel'),
(2, 15000, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Espèces', 'Paiement comptant'),
(3, 75000, DATE_SUB(CURDATE(), INTERVAL 45 DAY), 'Carte', 'Paiement carte bancaire'),
(4, 130000, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Virement', 'Virement bancaire'),
(5, 15000, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Espèces', 'Mensuel - non renouvelé'),
(6, 5000, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Mobile', 'Wave'),
(7, 15000, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Espèces', NULL),
(8, 40000, DATE_SUB(CURDATE(), INTERVAL 120 DAY), 'Virement', 'Non renouvelé'),
(9, 2000, CURDATE(), 'Mobile', 'Wave - Séance unique'),
(10, 75000, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Carte', NULL),
(11, 15000, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Espèces', NULL),
(12, 5000, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Mobile', 'Non renouvelé'),
(13, 40000, DATE_SUB(CURDATE(), INTERVAL 40 DAY), 'Carte', NULL),
(14, 130000, DATE_SUB(CURDATE(), INTERVAL 50 DAY), 'Virement', NULL),
(15, 15000, DATE_SUB(CURDATE(), INTERVAL 100 DAY), 'Espèces', 'Non renouvelé'),
(16, 5000, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Mobile', 'Wave'),
(17, 40000, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Carte', NULL),
(18, 15000, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Espèces', NULL),
(19, 75000, DATE_SUB(CURDATE(), INTERVAL 200 DAY), 'Virement', 'Non renouvelé'),
(20, 15000, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Mobile', 'Orange Money');

-- Paiements supplémentaires pour l\'historique
INSERT INTO payments (member_id, amount, payment_date, payment_method, notes) VALUES
(1, 40000, DATE_SUB(CURDATE(), INTERVAL 120 DAY), 'Mobile', 'Premier trimestriel'),
(2, 15000, DATE_SUB(CURDATE(), INTERVAL 40 DAY), 'Espèces', 'Premier mensuel'),
(3, 75000, DATE_SUB(CURDATE(), INTERVAL 225 DAY), 'Carte', 'Premier semestriel'),
(4, 130000, DATE_SUB(CURDATE(), INTERVAL 425 DAY), 'Virement', 'Premier annuel'),
(10, 75000, DATE_SUB(CURDATE(), INTERVAL 200 DAY), 'Carte', 'Premier semestriel'),
(14, 130000, DATE_SUB(CURDATE(), INTERVAL 415 DAY), 'Virement', 'Premier annuel');

-- ============================================================
-- PRÉSENCES (entrées ces 7 derniers jours)
-- ============================================================
INSERT INTO attendance (member_id, check_in) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '08:30' HOUR_MINUTE),
(2, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '09:15' HOUR_MINUTE),
(3, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '10:00' HOUR_MINUTE),
(6, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '11:30' HOUR_MINUTE),
(7, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '14:00' HOUR_MINUTE),
(9, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '16:45' HOUR_MINUTE),
(11, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '18:00' HOUR_MINUTE),
(16, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '19:30' HOUR_MINUTE),
(18, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '20:15' HOUR_MINUTE),
(20, DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '07:00' HOUR_MINUTE),

(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '08:00' HOUR_MINUTE),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '09:30' HOUR_MINUTE),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '10:45' HOUR_MINUTE),
(7, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '14:30' HOUR_MINUTE),
(10, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '17:00' HOUR_MINUTE),
(13, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '18:30' HOUR_MINUTE),
(17, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '19:00' HOUR_MINUTE),
(20, DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL '07:30' HOUR_MINUTE),

(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL '10:00' HOUR_MINUTE),
(6, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL '11:00' HOUR_MINUTE),
(11, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL '15:30' HOUR_MINUTE),
(14, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL '16:00' HOUR_MINUTE),
(18, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL '20:00' HOUR_MINUTE),

(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '08:15' HOUR_MINUTE),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '09:45' HOUR_MINUTE),
(7, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '13:30' HOUR_MINUTE),
(10, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '17:15' HOUR_MINUTE),
(13, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '18:45' HOUR_MINUTE),
(16, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '19:30' HOUR_MINUTE),
(20, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL '06:45' HOUR_MINUTE),

(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL '09:00' HOUR_MINUTE),
(6, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL '10:30' HOUR_MINUTE),
(9, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL '15:00' HOUR_MINUTE),
(11, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL '16:30' HOUR_MINUTE),
(17, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL '18:00' HOUR_MINUTE),

(3, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL '11:00' HOUR_MINUTE),
(7, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL '14:00' HOUR_MINUTE),
(13, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL '17:30' HOUR_MINUTE),
(14, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL '18:15' HOUR_MINUTE),
(18, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL '19:45' HOUR_MINUTE),

(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL '07:45' HOUR_MINUTE),
(4, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL '09:30' HOUR_MINUTE),
(10, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL '10:15' HOUR_MINUTE),
(11, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL '16:00' HOUR_MINUTE),
(16, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL '20:00' HOUR_MINUTE),
(20, DATE_SUB(CURDATE(), INTERVAL 6 DAY) + INTERVAL '06:30' HOUR_MINUTE);

-- ============================================================
-- LOGS DE CONTRÔLE D\'ACCÈS
-- ============================================================
INSERT INTO access_logs (member_id, qr_code, status, reason, checked_by, created_at) VALUES
(1, 'M100001', 'allowed', NULL, 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '08:30' HOUR_MINUTE),
(2, 'M100002', 'allowed', NULL, 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '09:15' HOUR_MINUTE),
(5, 'M100005', 'denied', 'Abonnement expiré', 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '10:00' HOUR_MINUTE),
(3, 'M100003', 'allowed', NULL, 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '10:00' HOUR_MINUTE),
(8, 'M100008', 'denied', 'Abonnement expiré', 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '11:00' HOUR_MINUTE),
(7, 'M100007', 'allowed', NULL, 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '14:00' HOUR_MINUTE),
(12, 'M100012', 'denied', 'Abonnement expiré', 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '15:00' HOUR_MINUTE),
(15, 'M100015', 'denied', 'Abonnement expiré', 'Agent Mamadou', DATE_SUB(CURDATE(), INTERVAL 0 DAY) + INTERVAL '16:00' HOUR_MINUTE);

