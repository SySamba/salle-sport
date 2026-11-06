const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const optionalString = (field, max) =>
  body(field).optional({ nullable: true, checkFalsy: true }).isString().isLength({ max });

const phoneRule = body('phone')
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .matches(/^[\d\s()+.-]{6,20}$/)
  .withMessage('Numéro de téléphone invalide');

const dateRule = (field, required = false) => {
  const rule = required
    ? body(field)
    : body(field).optional({ nullable: true, checkFalsy: true });
  return rule.isISO8601().withMessage(`${field} doit être une date valide (YYYY-MM-DD)`);
};

const idParam = [param('id').isInt({ min: 1 }).withMessage('Identifiant invalide')];

const login = [
  body('username').trim().notEmpty().withMessage("Nom d'utilisateur requis"),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const memberLogin = [
  body('phone').trim().notEmpty().withMessage('Numéro de téléphone requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const memberCreate = [
  body('full_name').trim().notEmpty().withMessage('Le nom complet est requis').isLength({ max: 100 }),
  body('sex').optional().isIn(['Homme', 'Femme']).withMessage('Sexe invalide'),
  phoneRule,
  body('photo').optional({ nullable: true }).isString(),
];

const memberUpdate = [
  body('full_name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide').isLength({ max: 100 }),
  body('sex').optional().isIn(['Homme', 'Femme']).withMessage('Sexe invalide'),
  phoneRule,
  body('photo').optional({ nullable: true }).isString(),
  body('status').optional().isIn(['Actif', 'Inactif']).withMessage('Statut invalide'),
];

const paymentCreate = [
  body('member_id').isInt({ min: 1 }).withMessage('Adhérent requis'),
  body('amount').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('subscription_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
  dateRule('payment_date'),
  body('payment_method').optional().isIn(['Espèces', 'Carte', 'Virement', 'Mobile']).withMessage('Méthode de paiement invalide'),
  optionalString('notes', 1000),
];

const userCreate = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage("Nom d'utilisateur requis (3 à 50 caractères)"),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (6 caractères minimum)'),
  body('full_name').trim().notEmpty().withMessage('Nom complet requis').isLength({ max: 100 }),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Email invalide'),
  body('role').isIn(['admin', 'responsable', 'reception']).withMessage('Rôle invalide'),
];

const userUpdate = [
  body('full_name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Email invalide'),
  body('role').optional().isIn(['admin', 'responsable', 'reception']).withMessage('Rôle invalide'),
  body('is_active').optional().isBoolean().withMessage('is_active doit être booléen'),
];

const passwordReset = [
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (6 caractères minimum)'),
];

const planCreate = [
  body('name').trim().notEmpty().withMessage('Nom de la formule requis').isLength({ max: 100 }),
  body('duration_days').isInt({ min: 1 }).withMessage('Durée invalide (jours)'),
  body('price').isFloat({ min: 0 }).withMessage('Prix invalide'),
  optionalString('description', 1000),
];

const planUpdate = [
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('duration_days').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional({ nullable: true }).isString(),
  body('is_active').optional().isBoolean(),
];

const subscriptionCreate = [
  body('member_id').isInt({ min: 1 }).withMessage('Adhérent requis'),
  body('plan_id').isInt({ min: 1 }).withMessage('Formule requise'),
  dateRule('start_date', true),
];

const attendanceCreate = [
  body('member_id').isInt({ min: 1 }).withMessage('Adhérent requis'),
];

const accessVerify = [
  body('qr').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 255 }),
  phoneRule,
  body().custom((value) => value.qr || value.phone).withMessage('QR code ou téléphone requis'),
];

module.exports = {
  validate,
  idParam,
  login,
  memberLogin,
  memberCreate,
  memberUpdate,
  paymentCreate,
  userCreate,
  userUpdate,
  passwordReset,
  planCreate,
  planUpdate,
  subscriptionCreate,
  attendanceCreate,
  accessVerify,
};
