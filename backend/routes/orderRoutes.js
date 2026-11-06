// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getDB } = require('../config/db');

// Клиент: Создать заказ
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, totalPrice, restaurantId } = req.body; // items: [{ id, quantity, price }]
    const db = await getDB();
    const orderId = Date.now().toString();
    const createdAt = new Date().toISOString();

    // Вставляем сам заказ
    await db.run(
      'INSERT INTO orders (id, user_id, restaurant_id, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, req.user.id, restaurantId, totalPrice, 'В обработке', createdAt]
    );

    // Вставляем позиции заказа
    for (const item of items) {
      await db.run(
        'INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [Date.now().toString() + Math.random(), orderId, item.id, item.quantity, item.price]
      );
    }

    res.status(201).json({ id: orderId, message: 'Заказ успешно создан' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
});

// Админ: Получить входящие заказы
router.get('/incoming', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const db = await getDB();
    // Получаем заказы вместе со списками блюд
    const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения заказов' });
  }
});

// Админ: Изменить статус заказа
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const db = await getDB();

    const result = await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    res.json({ id: req.params.id, status });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления статуса' });
  }
});

module.exports = router;
