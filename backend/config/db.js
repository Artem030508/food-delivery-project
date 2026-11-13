// backend/config/db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: process.env.DATABASE_FILE || './database.sqlite',
    driver: sqlite3.Database
  });

  // Включаем поддержку внешних ключей
  await dbInstance.get('PRAGMA foreign_keys = ON');

  // Создаем все таблицы базы данных
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client'
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'В обработке',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // Заполняем демо-данными, если таблица ресторанов пуста
  const restaurantCheck = await dbInstance.get('SELECT COUNT(*) as count FROM restaurants');
  if (restaurantCheck.count === 0) {
    // 1. Пиццерия Палермо
    await dbInstance.run("INSERT INTO restaurants (id, name, cuisine) VALUES ('1', 'Пиццерия Палермо', 'Итальянская')");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('101', '1', 'Пицца Пепперони', 500)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('102', '1', 'Пицца Маргарита', 450)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('103', '1', 'Пицца Четыре сыра', 600)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('104', '1', 'Паста Карбонара', 420)");

    // 2. KFC
    await dbInstance.run("INSERT INTO restaurants (id, name, cuisine) VALUES ('2', 'KFC', 'Фастфуд и курица')");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('201', '2', 'Баскет Дуэт', 650)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('202', '2', 'Шефбургер Острый', 250)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('203', '2', 'Твистер Оригинальный', 220)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('204', '2', 'Картофель Фри стандарт', 120)");

    // 3. Шаурмечная
    await dbInstance.run("INSERT INTO restaurants (id, name, cuisine) VALUES ('3', 'Шаурмечная №1', 'Восточный стритфуд')");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('301', '3', 'Шаурма Классическая в лаваше', 280)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('302', '3', 'Шаурма Сырная с халапеньо', 320)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('303', '3', 'Шаурма на тарелке XXL', 450)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('304', '3', 'Морс клюквенный домашний', 100)");
  }

  return dbInstance;
}

module.exports = { getDB };
