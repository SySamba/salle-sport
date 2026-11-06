const notFound = (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Erreur serveur' : err.message || 'Erreur',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
};

module.exports = { notFound, errorHandler };
