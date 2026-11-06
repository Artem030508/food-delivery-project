// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const db = await getDB();
    
    // Проверка существования пользователя
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    const userRole = role || 'client';

    await db.run(
      'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, userRole]
    );

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDB();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    
    // Сохраняем refresh токен в БД
    await db.run('INSERT INTO refresh_tokens (token) VALUES (?)', [tokens.refreshToken]);

    res.json({
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при входе в систему' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const db = await getDB();

    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh токен отсутствует' });
    }

    // Проверяем наличие токена в БД
    const savedToken = await db.get('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
    if (!savedToken) {
      return res.status(403).json({ message: 'Refresh токен недействителен' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
      if (err) return res.status(403).json({ message: 'Токен устарел или неверный' });

      const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
      
      // Ротация токенов: удаляем старый, добавляем новый
      await db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
      await db.run('INSERT INTO refresh_tokens (token) VALUES (?)', [tokens.refreshToken]);

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении токена' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const db = await getDB();
    
    // Удаляем рефреш-токен из БД, сессия завершена
    await db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    res.json({ message: 'Успешный выход из системы' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при выходе из системы' });
  }
};
