// config/db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: process.env.DATABASE_FILE || './database.sqlite',
    driver: sqlite3.Database
  });

  // Включаем поддержку внешних ключей (Foreign Keys)
  await dbInstance.get('PRAGMA foreign_keys = ON');

  // Создаем таблицы, если их нет
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

  // Заполним демо-данными для ресторанов, если таблица пуста
  const restaurantCheck = await dbInstance.get('SELECT COUNT(*) as count FROM restaurants');
  if (restaurantCheck.count === 0) {
    await dbInstance.run("INSERT INTO restaurants (id, name, cuisine) VALUES ('1', 'Пицца Хат', 'Итальянская')");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('101', '1', 'Пепперони', 500)");
    await dbInstance.run("INSERT INTO menu_items (id, restaurant_id, name, price) VALUES ('102', '1', 'Маргарита', 450)");
  }

  return dbInstance;
}

module.exports = { getDB };
