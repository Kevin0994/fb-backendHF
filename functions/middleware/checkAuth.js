const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('cabecera: ', req.headers);
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, 'secretpassw');
    req.usuarioAuth = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      msg: 'Autenticación fallida',
      ...error,
    });
  }
};