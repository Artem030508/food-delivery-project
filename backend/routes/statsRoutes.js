// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getDB } = require('../config/db');

router.get('/dashboard', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const db = await getDB();

    // 1. Заказы по часам (Берем подстроку времени HH из ISO строки даты)
    const ordersByHour = await db.all(`
      SELECT strftime('%H:00', created_at) as hour, COUNT(*) as orders 
      FROM orders 
      GROUP BY hour
    `);

    // 2. Средний чек по месяцам
    const averageCheckByMonth = await db.all(`
      SELECT strftime('%m', created_at) as month, AVG(total_price) as amount 
      FROM orders 
      GROUP BY month
    `);

    // 3. Популярные блюда (Соединяем позиции заказа с названиями из меню)
    const popularItems = await db.all(`
      SELECT mi.name as name, SUM(oi.quantity) as value
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY mi.name
      ORDER BY value DESC
      LIMIT 5
    `);

    res.json({
      ordersByHour: ordersByHour.length ? ordersByHour : [{ hour: '12:00', orders: 0 }],
      averageCheckByMonth: averageCheckByMonth.length ? averageCheckByMonth : [{ month: '10', amount: 0 }],
      popularItems: popularItems.length ? popularItems : [{ name: 'Нет данных', value: 0 }]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сбора аналитики' });
  }
});

module.exports = router;
