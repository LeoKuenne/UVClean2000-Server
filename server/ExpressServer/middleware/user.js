const jwt = require('jsonwebtoken');
const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'ExpressServer' });

module.exports = {
  validateRegister: (req, res, next) => {
    logger.info('Validate sign up parameters, username: %s, password %s', req.body.username, req.body.username);
    // username min length 3
    if (!req.body.username || req.body.username.length < 3) {
      logger.info('Validating username: %s failed', req.body.username);
      return res.status(400).send({
        msg: 'Please enter a username with min. 3 chars',
      });
    }
    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      logger.info('Validating password: %s failed', req.body.password);
      return res.status(400).send({
        msg: 'Please enter a password with min. 6 chars',
      });
    }
    // password (repeat) does not match
    if (
      !req.body.password_repeat
      || req.body.password !== req.body.password_repeat
    ) {
      logger.info('Validating repeated password: %s failed', req.body.password_repeat);
      return res.status(400).send({
        msg: 'Both passwords must match',
      });
    }
    logger.info('Validating sign up paramters succeded');
    next();
  },
  isLoggedIn: (req, res, next) => {
    logger.info('Validate user to be logged in with cookie %o', req.cookies);
    try {
      const token = req.cookies.UVCleanSID;
      const decoded = jwt.verify(
        token,
        'SECRETKEY',
      );
      logger.info('User is logged in. %o', decoded);
      req.userData = decoded;
      next();
    } catch (err) {
      logger.info('User is not logged in.');
      return res.status(401).send('<p>Your session is not valid</p>');
    }
  },
};
