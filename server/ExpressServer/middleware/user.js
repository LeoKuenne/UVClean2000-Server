const jwt = require('jsonwebtoken');

module.exports = {
  validateRegister: (req, res, next) => {

  },
  isLoggedIn: (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
      const { userId } = decodedToken;
      if (req.body.userId && req.body.userId !== userId) {
        throw new Error('Invalid user ID');
      } else {
        next();
      }
    } catch (error) {
      return res.status(401).json({
        error: new Error('Invalid request!'),
      });
    }
  },
};
