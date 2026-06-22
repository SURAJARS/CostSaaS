const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
