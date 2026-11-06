// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getDB } = require('../config/db');

// Клиент/Админ: Получить список всех ресторанов
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const restaurants = await db.all('SELECT * FROM restaurants');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении ресторанов' });
  }
});

// Клиент/Админ: Получить меню конкретного ресторана с поиском и пагинацией
router.get('/:id/menu', async (req, res) => {
  try {
    const db = await getDB();
    const restaurantId = req.params.id;
    
    // Получаем параметры из URL для useSearchParams на фронте
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Запрос с фильтрацией (LIKE) и пагинацией (LIMIT/OFFSET)
    const items = await db.all(
      'SELECT * FROM menu_items WHERE restaurant_id = ? AND name LIKE ? LIMIT ? OFFSET ?',
      [restaurantId, `%${search}%`, limit, offset]
    );

    res.json({ items, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении меню' });
  }
});

// Админ: Добавить блюдо в меню (Часть CRUD)
router.post('/:id/menu', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const db = await getDB();
    const itemId = Date.now().toString();

    await db.run(
      'INSERT INTO menu_items (id, restaurant_id, name, price) VALUES (?, ?, ?, ?)',
      [itemId, req.params.id, name, price]
    );

    res.status(201).json({ id: itemId, name, price, message: 'Блюдо добавлено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении блюда' });
  }
});

// Админ: Удалить блюдо из меню (Часть CRUD)
router.delete('/menu/:itemId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.run('DELETE FROM menu_items WHERE id = ?', [req.params.itemId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Блюдо не найдено' });
    }
    
    res.json({ message: 'Блюдо успешно удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении блюда' });
  }
});

// САМОЕ ВАЖНОЕ: Экспортируем роутер наружу
module.exports = router;
