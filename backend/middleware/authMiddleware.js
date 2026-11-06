const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует. Доступ запрещен.' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      // Возвращаем строго 401, чтобы Axios Interceptor на фронте понял: пора обновлять токен
      return res.status(401).json({ message: 'Срок действия токена истек или он неверен.' });
    }
    req.user = user;
    next();
  });
};
