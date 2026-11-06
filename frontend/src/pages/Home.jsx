import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  // 1. Загрузка списка ресторанов
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        const formatted = response.data.map(r => r.id === '1' ? { ...r, name: 'Пиццерия Палермо' } : r);
        setRestaurants(formatted);
      } catch (error) {
        console.error('Ошибка загрузки ресторанов', error);
      }
    };
    fetchRestaurants();
  }, []);

  // 2. Загрузка меню выбранного ресторана
  const fetchMenu = async () => {
    if (!selectedRestaurant) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/restaurants/${selectedRestaurant.id}/menu?search=${search}&page=${page}&limit=3`);
      setMenuItems(response.data.items);
      setTotalPages(response.data.pagination.pages || 1);
    } catch (error) {
      console.error('Ошибка загрузки меню', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedRestaurant, search, page]);

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      try {
        await api.delete(`/restaurants/menu/${itemId}`);
        alert('Блюдо удалено!');
        fetchMenu();
      } catch (error) {
        alert('Ошибка при удалении');
      }
    }
  };

  // ТЁМНАЯ ТЕМА: Контролируемые инлайн-стили
  const containerStyle = {
    backgroundColor: '#121214', // Глубокий матовый тёмный фон
    color: '#e1e1e6',           // Мягкий светлый текст (не режет глаза)
    minHeight: '100vh',
    padding: '30px 20px',
    fontFamily: '"Segoe UI", Roboto, sans-serif'
  };

  const cardStyle = {
    backgroundColor: '#1f1f23', // Более светлый оттенок для карточек
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    border: '1px solid #29292e',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '8px',
    backgroundColor: '#1f1f23',
    color: '#fff',
    border: '1px solid #29292e',
    marginBottom: '25px',
    outline: 'none'
  };

  const btnSecondary = {
    padding: '8px 16px',
    backgroundColor: '#29292e',
    color: '#e1e1e6',
    border: '1px solid #38383d',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Шапка */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #29292e', paddingBottom: '15px' }}>
          <h1 style={{ fontSize: '28px', color: '#fff' }}>🚀 Сервис доставки еды</h1>
          <button onClick={() => setIsAdmin(!isAdmin)} style={{ padding: '8px 14px', backgroundColor: '#38383d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
            Роль: {isAdmin ? 'Администратор' : 'Клиент'}
          </button>
        </header>

        {/* ЭКРАН 1: ВЫБОР РЕСТОРАНА */}
        {!selectedRestaurant ? (
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#fff' }}>Выберите ресторан из списка:</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {restaurants.map(res => (
                <div key={res.id} onClick={() => setSelectedRestaurant(res)} style={cardStyle}>
                  <h3 style={{ color: '#4da5ff', fontSize: '20px', marginBottom: '8px' }}>{res.name}</h3>
                  <p style={{ color: '#a8a8b3' }}>Кухня: {res.cuisine}</p>
                  <span style={{ display: 'inline-block', marginTop: '12px', color: '#4da5ff', fontWeight: '500' }}>Перейти к меню →</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ЭКРАН 2: ПРОСМОТР МЕНЮ ВЫБРАННОГО РЕСТОРАНА */
          <div>
            <button onClick={() => { setSelectedRestaurant(null); setMenuItems([]); }} style={btnSecondary}>
              ← К списку ресторанов
            </button>
            
            <h2 style={{ marginBottom: '5px', color: '#fff' }}>Меню ресторана: <span style={{ color: '#4da5ff' }}>{selectedRestaurant.name}</span></h2>
            <p style={{ color: '#a8a8b3', marginBottom: '20px' }}>Кухня: {selectedRestaurant.cuisine}</p>

            {/* Поиск */}
            <input
              type="text"
              placeholder="🔍 Поиск блюда по названию..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={inputStyle}
            />

            {isLoading ? (
              <h3 style={{ textAlign: 'center', color: '#a8a8b3' }}>Загрузка меню...</h3>
            ) : menuItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#f55f5f', fontSize: '18px' }}>В этом меню пока нет блюд.</p>
            ) : (
              /* Сетка блюд */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {menuItems.map(item => (
                  <div key={item.id} style={{ backgroundColor: '#1f1f23', borderRadius: '12px', padding: '20px', border: '1px solid #29292e', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#fff' }}>{item.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4cd964' }}>{item.price} ₽</span>
                      {!isAdmin && <button style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px' }}>В корзину</button>}
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteItem(item.id)} style={{ marginTop: '15px', width: '100%', padding: '8px', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500' }}>
                        Удалить позицию
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Пагинация */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#1f1f23', color: '#fff' }}>Назад</button>
              <span style={{ fontWeight: '500' }}>Страница {page} из {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #29292e', backgroundColor: '#1f1f23', color: '#fff' }}>Вперед</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
