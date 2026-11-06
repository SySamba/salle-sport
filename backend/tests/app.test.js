process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, 'test-secret');
const auth = (req) => req.set('Authorization', `Bearer ${adminToken}`);

describe('GET /api/health', () => {
  it('retourne le statut du serveur', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('Routes inconnues', () => {
  it('retourne 404 sur une route API inexistante', async () => {
    const res = await request(app).get('/api/route-inexistante');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});

describe('Authentification', () => {
  it('rejette une requête sans token', async () => {
    const res = await request(app).get('/api/members');
    expect(res.status).toBe(401);
  });

  it('rejette un token invalide', async () => {
    const res = await request(app)
      .get('/api/members')
      .set('Authorization', 'Bearer token-invalide');
    expect(res.status).toBe(401);
  });

  it('valide le body de /login', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('valide le body de /member-login', async () => {
    const res = await request(app).post('/api/auth/member-login').send({ phone: '' });
    expect(res.status).toBe(400);
  });
});

describe('Validation des entrées', () => {
  it('rejette un adhérent sans nom', async () => {
    const res = await auth(request(app).post('/api/members')).send({ full_name: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('full_name');
  });

  it('rejette un sexe invalide', async () => {
    const res = await auth(request(app).post('/api/members')).send({ full_name: 'Test', sex: 'Autre' });
    expect(res.status).toBe(400);
  });

  it('rejette un téléphone invalide', async () => {
    const res = await auth(request(app).post('/api/members')).send({ full_name: 'Test', phone: 'abc!' });
    expect(res.status).toBe(400);
  });

  it('rejette un id non numérique', async () => {
    const res = await auth(request(app).get('/api/members/abc'));
    expect(res.status).toBe(400);
  });

  it('rejette un paiement sans montant', async () => {
    const res = await auth(request(app).post('/api/payments')).send({ member_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'amount')).toBe(true);
  });

  it('rejette un abonnement sans date de début', async () => {
    const res = await auth(request(app).post('/api/subscriptions')).send({ member_id: 1, plan_id: 1 });
    expect(res.status).toBe(400);
  });

  it('rejette une vérification d\'accès sans qr ni phone', async () => {
    const res = await auth(request(app).post('/api/access/verify')).send({});
    expect(res.status).toBe(400);
  });

  it('rejette une vérification d\'accès avec un téléphone invalide', async () => {
    const res = await auth(request(app).post('/api/access/verify')).send({ phone: 'abc!' });
    expect(res.status).toBe(400);
  });

  it('rejette un utilisateur avec un rôle invalide', async () => {
    const res = await auth(request(app).post('/api/users')).send({
      username: 'test',
      password: 'password123',
      full_name: 'Test',
      role: 'superadmin',
    });
    expect(res.status).toBe(400);
  });
});

describe('Contrôle des rôles', () => {
  it('refuse la gestion des utilisateurs à un non-admin', async () => {
    const receptionToken = jwt.sign({ id: 2, username: 'recep', role: 'reception' }, 'test-secret');
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${receptionToken}`);
    expect(res.status).toBe(403);
  });
});
