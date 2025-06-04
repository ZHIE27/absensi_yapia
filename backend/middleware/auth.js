const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = {
  authenticate(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token tidak tersedia' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token tidak valid' });
      }
      req.user = user;
      next();
    });
  },

  authorize(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Akses ditolak. Role tidak sesuai.' });
      }
      next();
    };
  }
};

module.exports = authMiddleware;